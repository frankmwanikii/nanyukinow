import Modal from '@/Components/Modal';
import { AdminButton } from '@/Components/Admin/ui';
import { getCroppedImage } from '@/utils/cropImage';
import { useCallback, useEffect, useState } from 'react';
import Cropper from 'react-easy-crop';

export default function ImageCropModal({
    show,
    imageSrc,
    fileName = 'avatar.jpg',
    aspect = 1,
    loading = false,
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
                quality: 0.92,
                maxSize: 800,
            });
            onComplete?.(file);
        } catch (err) {
            setError(err?.message || 'Could not crop image.');
        } finally {
            setBusy(false);
        }
    };

    return (
        <Modal show={show} onClose={onCancel} maxWidth="lg">
            <div className="border-b border-olive-100 px-5 py-4 dark:border-olive-800">
                <h3 className="text-base font-semibold text-olive-950 dark:text-olive-50">
                    Crop profile image
                </h3>
                <p className="mt-1 text-sm text-olive-500 dark:text-olive-400">
                    Drag to reposition, then use zoom to resize before saving.
                </p>
            </div>

            <div className="relative h-72 bg-olive-950 sm:h-80">
                {loading || !imageSrc ? (
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
                        cropShape="round"
                        showGrid={false}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                    />
                )}
            </div>

            <div className="space-y-4 px-5 py-4">
                <label className="block">
                    <span className="mb-2 flex items-center justify-between text-sm font-medium text-olive-700 dark:text-olive-200">
                        Zoom
                        <span className="tabular-nums text-olive-500">{zoom.toFixed(1)}×</span>
                    </span>
                    <input
                        type="range"
                        min={1}
                        max={3}
                        step={0.05}
                        value={zoom}
                        disabled={loading || !imageSrc}
                        onChange={(e) => setZoom(Number(e.target.value))}
                        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-olive-200 accent-mustard disabled:opacity-40 dark:bg-olive-700"
                    />
                </label>

                {error && (
                    <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
                )}

                <div className="flex flex-wrap justify-end gap-2">
                    <AdminButton type="button" size="sm" variant="secondary" onClick={onCancel} disabled={busy}>
                        Cancel
                    </AdminButton>
                    <AdminButton
                        type="button"
                        size="sm"
                        onClick={apply}
                        disabled={busy || loading || !croppedAreaPixels}
                    >
                        {busy ? 'Applying…' : 'Use photo'}
                    </AdminButton>
                </div>
            </div>
        </Modal>
    );
}
