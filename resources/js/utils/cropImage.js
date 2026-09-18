/**
 * Draw a cropped region of an image to a canvas and return a Blob/File.
 * Compatible with react-easy-crop's croppedAreaPixels output.
 */
export async function getCroppedImage(imageSrc, pixelCrop, {
    fileName = 'avatar.jpg',
    mimeType = 'image/jpeg',
    quality = 0.92,
    maxSize = 800,
} = {}) {
    const image = await loadImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('Could not get canvas context');
    }

    const scale = Math.min(1, maxSize / Math.max(pixelCrop.width, pixelCrop.height));
    const outputWidth = Math.round(pixelCrop.width * scale);
    const outputHeight = Math.round(pixelCrop.height * scale);

    canvas.width = outputWidth;
    canvas.height = outputHeight;

    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        outputWidth,
        outputHeight,
    );

    const blob = await new Promise((resolve, reject) => {
        canvas.toBlob(
            (result) => (result ? resolve(result) : reject(new Error('Crop failed'))),
            mimeType,
            quality,
        );
    });

    return new File([blob], fileName, { type: mimeType });
}

/** Turn any displayable image source into a data URL for the cropper. */
export async function srcToDataUrl(src) {
    if (!src) {
        throw new Error('No image source');
    }

    if (src.startsWith('data:')) {
        return src;
    }

    const normalized = toSameOriginSrc(src);

    if (normalized.startsWith('blob:') || normalized.startsWith('/')) {
        const response = await fetch(normalized, { credentials: 'same-origin' });
        if (!response.ok) {
            throw new Error('Failed to load image');
        }
        const blob = await response.blob();
        return blobToDataUrl(blob);
    }

    // Cross-origin fallback via canvas (needs CORS). Prefer same-origin paths.
    const response = await fetch(normalized);
    if (!response.ok) {
        throw new Error('Failed to load image');
    }
    const blob = await response.blob();
    return blobToDataUrl(blob);
}

export function toSameOriginSrc(src) {
    try {
        const url = new URL(src, window.location.href);
        if (url.pathname.startsWith('/storage/')) {
            return `${url.pathname}${url.search}`;
        }
        if (url.origin === window.location.origin) {
            return `${url.pathname}${url.search}`;
        }
    } catch {
        // keep original
    }
    return src;
}

function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error('Could not read image'));
        reader.readAsDataURL(blob);
    });
}

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', () => reject(new Error('Image failed to load')));
        // crossOrigin on data:/blob: URLs can break loading in some browsers
        if (!src.startsWith('data:') && !src.startsWith('blob:')) {
            image.crossOrigin = 'anonymous';
        }
        image.src = src;
    });
}
