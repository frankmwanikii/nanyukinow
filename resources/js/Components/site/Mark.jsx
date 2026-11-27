/**
 * Nanyuki Now icon system — IconScout Unicons (fill currentColor).
 * Stable Mark* export names for site chrome; LucideCompat covers admin/forms.
 */
import { UNICONS } from './uniconsPaths';

export function Mark({ className = 'h-4 w-4', children, ...props }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className={className}
            aria-hidden="true"
            fill="currentColor"
            {...props}
        >
            {children}
        </svg>
    );
}

function Unicon({ name, className = 'h-4 w-4', ...props }) {
    const html = UNICONS[name];
    if (!html) {
        return null;
    }

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className={className}
            aria-hidden="true"
            fill="currentColor"
            {...props}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}

function mark(name) {
    return function IconMark({ className = 'h-4 w-4', ...props }) {
        return <Unicon name={name} className={className} {...props} />;
    };
}
export const UpgradePlansMark = mark('calendar-alt');
export const ForwardMark = mark('arrow-right');
export const LeaveMark = mark('external-link-alt');
export const BackMark = mark('arrow-left');
export const SendMark = mark('telegram-alt');
/** Horizontal paper plane (points right). Prefer over telegram-alt for CTAs. */
export const SendArrowMark = mark('message');
export const AttachMark = mark('paperclip');
export const CloseMark = mark('multiply');
export const TicketMark = mark('ticket');
export const CheckMark = mark('check');
export const DisclosureMark = mark('angle-down');
export const UploadMark = mark('upload');
export const CropMark = mark('crop-alt');
export const TrashMark = mark('trash-alt');
export const EyeMark = mark('eye');
export const PasskeyMark = mark('key-skeleton');
export const EyeOffMark = mark('eye-slash');
export const SignOutMark = mark('sign-out-alt');
export const BellMark = mark('notification-bell');
export const SearchMark = mark('search');
export const PinMark = mark('map-marker');
export const CalendarMark = mark('calendar-alt');
export const MenuMark = mark('bars');
export const PlusMark = mark('plus');
export const MoreMark = mark('ellipsis-h');
export const UserMark = mark('user');
export const CompassMark = mark('compass');
export const FiltersMark = mark('filter');
export const ListMark = mark('list-ul');
export const MapMark = mark('map');
export const MailMark = mark('envelope');
export const PhoneMark = mark('phone');
export const EmptyListingsMark = mark('smile');
export const EatMark = mark('utensils');
export const StayMark = mark('bed');
export const ExploreMark = mark('camera');
export const ShopMark = mark('bag');
export const ServicesMark = mark('wrench');
export const PropertyMark = mark('estate');
export const EventMark = mark('calendar-alt');
export const DashboardMark = mark('apps');
export const MessageMark = mark('comment');
export const CardMark = mark('credit-card');
export const GearMark = mark('setting');
export const SunMark = mark('sun');
export const MoonMark = mark('moon');
export const StandardTierMark = mark('star');
export const PremiumTierMark = mark('bolt');

export function HeartMark({ className = 'h-4 w-4', filled = false, ...props }) {
    return <Unicon name="heart" className={className} {...props} />;
}

export function BookmarkMark({ className = 'h-4 w-4', filled = false, ...props }) {
    return <Unicon name={filled ? 'bookmark-full' : 'bookmark'} className={className} {...props} />;
}

export function StarMark({ className = 'h-4 w-4', filled = false, ...props }) {
    return <Unicon name="star" className={className} {...props} />;
}

/** Instagram-style verified badge — scalloped seal with white check. */
export function VerifiedMark({ className = 'h-4 w-4' }) {
    return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
            <path
                fill="currentColor"
                d="M12 1.15 13.95 3.4l2.95-.55.95 2.85 2.85.95-.55 2.95L22.85 12l-2.25 1.95.55 2.95-2.85.95-.95 2.85-2.95-.55L12 22.85l-1.95-2.25-2.95.55-.95-2.85-2.85-.95.55-2.95L1.15 12l2.25-1.95-.55-2.95 2.85-.95.95-2.85 2.95.55L12 1.15Z"
            />
            <path
                fill="#fff"
                d="M10.35 15.55a.95.95 0 0 1-1.34 0l-2.2-2.2a.95.95 0 1 1 1.34-1.34l1.53 1.53 4.7-4.7a.95.95 0 1 1 1.34 1.34l-5.37 5.37Z"
            />
        </svg>
    );
}

/**
 * Nyuki AI — stylised bee (Kiswahili: nyuki). Brand mark; not a Unicons glyph.
 */
export function NyukiMark({ className = 'h-4 w-4' }) {
    return (
        <Mark className={className}>
            <path
                fillRule="evenodd"
                d="M12 6.2c2.4 0 4.35 2.75 4.35 6.5S14.4 19.2 12 19.2s-4.35-2.75-4.35-6.5S9.6 6.2 12 6.2zM9.15 9.45h5.7v1.35H9.15V9.45zm0 2.6h5.7v1.35H9.15v-1.35zm0 2.6h5.7v1.35H9.15v-1.35z"
            />
            <circle cx="12" cy="4.4" r="2.6" />
            <path d="M10.95 3.5 8.2 1.25l-1 1.2 2.85 2.1z" />
            <path d="M13.05 3.5 15.8 1.25l1 1.2-2.85 2.1z" />
            <circle cx="7.45" cy="1.5" r="1.2" />
            <circle cx="16.55" cy="1.5" r="1.2" />
        </Mark>
    );
}
