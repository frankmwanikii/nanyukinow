import Modal from '@/Components/Modal';
import { getCroppedImage } from '@/utils/cropImage';
import { useCallback, useEffect, useState } from 'react';
import Cropper from 'react-easy-crop';

async function dataUrlToFile(dataUrl, fileName = 'photo.jpg') {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const type = blob.type || 'image/jpeg';
    const base = fileName.replace(/\.[^.]+$/, '') || 'photo';
    const ext = type.includes('png')
        ? 'png'
        : type.includes('webp')
          ? 'webp'
          : 'jpg';
    return new File([blob], `${base}.${ext}`, { type });
}

export default function ListingImageCropModal({
    show,
    imageSrc,
    originalFile = null,
    fileName = 'photo.jpg',
    aspect = 4 / 3,
    title = 'Crop image',
    cropShape = 'rect',
    maxSize = 1400,
    onCancel,
    onComplete,
}) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!show) return;
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setCroppedAreaPixels(null);
        setBusy(false);
        setError(null);
    }, [show, imageSrc]);

    const onCropComplete = useCallback((_area, pixels) => {
        setCroppedAreaPixels(pixels);
    }, []);

    const apply = async () => {
        if (!imageSrc || !croppedAreaPixels) return;
        setBusy(true);
        setError(null);
        try {
            const file = await getCroppedImage(imageSrc, croppedAreaPixels, {
                fileName,
                mimeType: 'image/jpeg',
                quality: 0.9,
                maxSize,
            });
            onComplete?.(file);
        } catch (err) {
            setError(err?.message || 'Could not crop image.');
        } finally {
            setBusy(false);
        }
    };

    const useWithoutCrop = async () => {
        setBusy(true);
        setError(null);
        try {
            if (originalFile instanceof File) {
                onComplete?.(originalFile);
                return;
            }
            if (!imageSrc) {
                throw new Error('No image available.');
            }
            const file = await dataUrlToFile(imageSrc, fileName);
            onComplete?.(file);
        } catch (err) {
            setError(err?.message || 'Could not use that image.');
        } finally {
            setBusy(false);
        }
    };

    return (
        <Modal show={show} onClose={onCancel} maxWidth="lg">
            <div className="border-b border-olive-100 px-5 py-4">
                <h3 className="text-base font-semibold text-olive-950">{title}</h3>
                <p className="mt-1 text-sm text-olive-500">
                    Drag to reposition, then zoom — or skip cropping and use the
                    original.
                </p>
            </div>

            <div className="relative h-72 bg-olive-950 sm:h-80">
                {!imageSrc ? (
                    <div className="flex h-full items-center justify-center text-sm text-olive-200">
                        Loading image…
                    </div>
                ) : (
                    <Cropper
                        key={imageSrc.slice(0, 64)}
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={aspect}
                        cropShape={cropShape}
                        showGrid
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                    />
                )}
            </div>

            <div className="space-y-4 px-5 py-4">
                <label className="block">
                    <span className="mb-2 flex items-center justify-between text-sm font-medium text-olive-700">
                        Zoom
                        <span className="tabular-nums text-olive-500">
                            {zoom.toFixed(1)}×
                        </span>
                    </span>
                    <input
                        type="range"
                        min={1}
                        max={3}
                        step={0.05}
                        value={zoom}
                        disabled={!imageSrc}
                        onChange={(e) => setZoom(Number(e.target.value))}
                        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-olive-200 accent-mustard disabled:opacity-40"
                    />
                </label>

                {error ? (
                    <p className="text-sm text-rose-600">{error}</p>
                ) : null}

                <div className="flex flex-wrap items-center justify-between gap-2">
                    <button
                        type="button"
                        onClick={useWithoutCrop}
                        disabled={busy || (!imageSrc && !originalFile)}
                        className="rounded-sm border border-olive-200 px-4 py-2 text-sm font-semibold text-olive-800 transition hover:bg-olive-50 disabled:opacity-50"
                    >
                        {busy ? 'Working…' : 'Don’t crop'}
                    </button>
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={busy}
                            className="rounded-sm border border-olive-200 px-4 py-2 text-sm font-semibold text-olive-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={apply}
                            disabled={busy || !croppedAreaPixels}
                            className="rounded-sm bg-mustard px-4 py-2 text-sm font-bold text-earth-dusk disabled:opacity-50"
                        >
                            {busy ? 'Applying…' : 'Use cropped'}
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
