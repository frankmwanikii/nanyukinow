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

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.setAttribute('crossOrigin', 'anonymous');
        image.src = src;
    });
}
