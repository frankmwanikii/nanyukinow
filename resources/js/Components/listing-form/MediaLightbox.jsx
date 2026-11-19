import GalleryLightbox from '@/Components/listing/GalleryLightbox';

/**
 * Full-screen image lightbox with keyboard + optional prev/next.
 */
export default function MediaLightbox({
    items = [],
    index = 0,
    onClose,
    onIndexChange,
    padBlur = false,
}) {
    return (
        <GalleryLightbox
            items={items}
            index={index}
            onClose={onClose}
            onIndexChange={onIndexChange}
            padBlur={padBlur}
        />
    );
}
