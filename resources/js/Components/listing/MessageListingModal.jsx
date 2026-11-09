import ListingModal from './ListingModal';
import { ContactMessageForm } from './ContactInfoPage';

export default function MessageListingModal({ open, onClose, listing }) {
    return (
        <ListingModal
            open={open}
            onClose={onClose}
            title="Send us a message"
            wide
        >
            <p className="mb-5 text-sm leading-relaxed text-olive-700">
                Message {listing?.title || 'this listing'}. We reply within
                minutes, and you’ll hear back in Messages and by email.
            </p>
            <ContactMessageForm
                listing={listing}
                framed={false}
                onSuccess={() => {
                    window.setTimeout(() => onClose?.(), 1200);
                }}
            />
        </ListingModal>
    );
}
