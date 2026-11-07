/**
 * Nanyuki Now icon system — solid hospitality glyphs (filled silhouette).
 * Custom set for eat / stay / explore; not a stock Lucide kit.
 */
export function Mark({ className = 'h-4 w-4', children, ...props }) {
    return (
        <svg
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

function OutlineMark({ className = 'h-4 w-4', children, ...props }) {
    return (
        <svg
            viewBox="0 0 24 24"
            className={className}
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            {children}
        </svg>
    );
}

/** Calendar with refresh — upgrade / plans. */
export function UpgradePlansMark({ className = 'h-4 w-4' }) {
    return (
        <OutlineMark className={className}>
            <path d="M8 5v2.5M16 5v2.5" />
            <rect x="4.5" y="7" width="15" height="12.5" rx="2" />
            <path d="M14.75 11.25a2.5 2.5 0 0 0-4.25-.75M9.25 14.25a2.5 2.5 0 0 0 4.25.75" />
            <path d="M14.75 9.5v1.9h-1.9M9.25 16v-1.9h1.9" />
        </OutlineMark>
    );
}

export function ForwardMark({ className = 'h-4 w-4' }) {
    return (
        <Mark className={className}>
            <path d="M13.2 5.3a1 1 0 0 1 1.4 0l5.1 5.1a1 1 0 0 1 0 1.4l-5.1 5.1a1 1 0 1 1-1.4-1.4L16.6 13H5a1 1 0 1 1 0-2h11.6l-3.4-3.3a1 1 0 0 1 0-1.4z" />
        </Mark>
    );
}

export function BackMark({ className = 'h-4 w-4' }) {
    return (
        <Mark className={className}>
            <path d="M10.8 5.3a1 1 0 0 1 0 1.4L7.4 11H19a1 1 0 1 1 0 2H7.4l3.4 3.3a1 1 0 1 1-1.4 1.4l-5.1-5.1a1 1 0 0 1 0-1.4l5.1-5.1a1 1 0 0 1 1.4 0z" />
        </Mark>
    );
}

export function CloseMark({ className = 'h-4 w-4' }) {
    return (
        <Mark className={className}>
            <path d="M6.7 5.3a1 1 0 0 1 1.4 0L12 9.2l3.9-3.9a1 1 0 1 1 1.4 1.4L13.4 10.6l3.9 3.9a1 1 0 1 1-1.4 1.4L12 12l-3.9 3.9a1 1 0 1 1-1.4-1.4l3.9-3.9-3.9-3.9a1 1 0 0 1 0-1.4z" />
        </Mark>
    );
}

export function CheckMark({ className = 'h-4 w-4' }) {
    return (
        <Mark className={className}>
            <path d="M9.2 16.3a1 1 0 0 1-1.4 0l-3.5-3.5a1 1 0 1 1 1.4-1.4l2.8 2.8 6.4-6.4a1 1 0 1 1 1.4 1.4l-7.1 7.1z" />
        </Mark>
    );
}

export function DisclosureMark({ className = 'h-4 w-4' }) {
    return (
        <Mark className={className}>
            <path d="M7.3 9.3a1 1 0 0 1 1.4 0L12 12.6l3.3-3.3a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 0-1.4z" />
        </Mark>
    );
}

export function UploadMark({ className = 'h-4 w-4' }) {
    return (
        <Mark className={className}>
            <path d="M12 3.25a1 1 0 0 1 1 1V12l2.3-2.3a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L11 12V4.25a1 1 0 0 1 1-1zM4.75 15.5a1 1 0 0 1 1 1v1.75c0 .41.34.75.75.75h11c.41 0 .75-.34.75-.75V16.5a1 1 0 1 1 2 0v1.75A2.75 2.75 0 0 1 17.5 21H6.5A2.75 2.75 0 0 1 3.75 18.25V16.5a1 1 0 0 1 1-1z" />
        </Mark>
    );
}

export function CropMark({ className = 'h-4 w-4' }) {
    return (
        <OutlineMark className={className}>
            <path d="M6 3v13a2 2 0 0 0 2 2h13" />
            <path d="M18 21V8a2 2 0 0 0-2-2H3" />
        </OutlineMark>
    );
}

export function TrashMark({ className = 'h-4 w-4' }) {
    return (
        <Mark className={className}>
            <path d="M9.25 3.5A1.75 1.75 0 0 1 11 1.75h2A1.75 1.75 0 0 1 14.75 3.5V4.5H19a1 1 0 1 1 0 2h-.75l-.7 12.1A2.75 2.75 0 0 1 14.81 21H9.19a2.75 2.75 0 0 1-2.74-2.4L5.75 6.5H5a1 1 0 1 1 0-2h4.25V3.5zm1.5 1h2.5V3.5h-2.5v1zm-2.98 2 .68 11.75c.04.4.37.7.77.7h5.62c.4 0 .73-.3.77-.7L15.23 6.5H7.77zM10 9.25a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0v-6a1 1 0 0 1 1-1zm4 0a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0v-6a1 1 0 0 1 1-1z" />
        </Mark>
    );
}

export function EyeMark({ className = 'h-4 w-4' }) {
    return (
        <Mark className={className}>
            <path d="M12 5.25c4.1 0 7.55 2.55 9.15 6.2a1 1 0 0 1 0 .9C19.55 16.2 16.1 18.75 12 18.75S4.45 16.2 2.85 12.35a1 1 0 0 1 0-.9C4.45 7.8 7.9 5.25 12 5.25zm0 2C8.95 7.25 6.25 9.1 4.85 12 6.25 14.9 8.95 16.75 12 16.75S17.75 14.9 19.15 12C17.75 9.1 15.05 7.25 12 7.25zM12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" />
        </Mark>
    );
}

export function EyeOffMark({ className = 'h-4 w-4' }) {
    return (
        <Mark className={className}>
            <path d="M3.3 3.3a1 1 0 0 1 1.4 0l16 16a1 1 0 1 1-1.4 1.4l-2.55-2.55C15.05 18.85 13.6 19.25 12 19.25c-4.1 0-7.55-2.55-9.15-6.2a1 1 0 0 1 0-.9c.75-1.7 1.9-3.15 3.35-4.2L3.3 4.7a1 1 0 0 1 0-1.4zm5.05 5.05L6.9 6.9C5.7 7.8 4.75 9 4.1 10.4c1.25 2.7 3.75 4.6 6.75 4.95l-1.35-1.35a3.5 3.5 0 0 1-1.15-5.65zm3.1-2.6c.5-.08 1-.12 1.55-.12 4.1 0 7.55 2.55 9.15 6.2a1 1 0 0 1 0 .9c-.5 1.15-1.2 2.15-2.05 3l-1.45-1.45c.6-.6 1.05-1.3 1.4-2.1-1.4-2.9-4.1-4.75-7.15-4.75-.2 0-.4 0-.6.05l-1.45-1.45c.5-.15 1-.23 1.55-.28zM12 8.75c.2 0 .4.02.6.06l-3.6 3.6A3.5 3.5 0 0 1 12 8.75z" />
        </Mark>
    );
}

export function SignOutMark({ className = 'h-4 w-4' }) {
    return (
        <Mark className={className}>
            <path d="M10.5 4.25H6.75A2.75 2.75 0 0 0 4 7v10a2.75 2.75 0 0 0 2.75 2.75h3.75a1 1 0 1 0 0-2H6.75c-.41 0-.75-.34-.75-.75V7c0-.41.34-.75.75-.75h3.75a1 1 0 1 0 0-2zM13.3 8.3a1 1 0 0 1 1.4 0l3 3a1 1 0 0 1 0 1.4l-3 3a1 1 0 1 1-1.4-1.4L14.6 13H9a1 1 0 1 1 0-2h5.6l-1.3-1.3a1 1 0 0 1 0-1.4z" />
        </Mark>
    );
}

export function BellMark({ className = 'h-4 w-4' }) {
    return (
        <Mark className={className}>
            <path d="M12 3.25a5.25 5.25 0 0 1 5.25 5.25v2.1l1.35 2.7a1.25 1.25 0 0 1-1.12 1.8H6.52a1.25 1.25 0 0 1-1.12-1.8L6.75 10.6V8.5A5.25 5.25 0 0 1 12 3.25zm-2.1 14.5a2.1 2.1 0 0 0 4.2 0h-4.2z" />
        </Mark>
    );
}

export function SearchMark({ className = 'h-4 w-4' }) {
    return (
        <Mark className={className}>
            <path d="M10.5 3.25a7.25 7.25 0 1 1 0 14.5 7.25 7.25 0 0 1 0-14.5zm0 2a5.25 5.25 0 1 0 0 10.5 5.25 5.25 0 0 0 0-10.5z" />
            <path d="M15.2 14.5a1 1 0 0 1 1.4 0l4.1 4.1a1 1 0 1 1-1.4 1.4l-4.1-4.1a1 1 0 0 1 0-1.4z" />
        </Mark>
    );
}

/** Map pin — solid teardrop with punched hole (matches category marks). */
export function PinMark({ className = 'h-4 w-4' }) {
    return (
        <Mark className={className}>
            <path
                fillRule="evenodd"
                d="M12 2.25c3.85 0 7 3.05 7 6.85 0 4.55-5.2 10.35-6.45 11.7a.85.85 0 0 1-1.1 0C10.2 19.45 5 13.65 5 9.1c0-3.8 3.15-6.85 7-6.85zm0 4.35a2.65 2.65 0 1 0 0 5.3 2.65 2.65 0 0 0 0-5.3z"
            />
        </Mark>
    );
}

export function HeartMark({
    className = 'h-4 w-4',
    filled = false,
}) {
    if (filled) {
        return (
            <Mark className={className}>
                <path d="M12 20.35c-.35 0-.7-.12-1-.35C7.9 17.55 3.5 13.55 3.5 9.4A4.65 4.65 0 0 1 8.2 4.7c1.35 0 2.6.55 3.5 1.5A4.65 4.65 0 0 1 15.2 4.7a4.65 4.65 0 0 1 4.7 4.7c0 4.15-4.4 8.15-7.5 10.6-.3.23-.65.35-1 .35z" />
            </Mark>
        );
    }

    return (
        <Mark className={className}>
            <path
                fillRule="evenodd"
                d="M12 20.35c-.35 0-.7-.12-1-.35C7.9 17.55 3.5 13.55 3.5 9.4A4.65 4.65 0 0 1 8.2 4.7c1.35 0 2.6.55 3.5 1.5A4.65 4.65 0 0 1 15.2 4.7a4.65 4.65 0 0 1 4.7 4.7c0 4.15-4.4 8.15-7.5 10.6-.3.23-.65.35-1 .35zM8.35 6.55A2.85 2.85 0 0 0 5.5 9.4c0 3.2 3.55 6.55 6.5 8.85 2.95-2.3 6.5-5.65 6.5-8.85a2.85 2.85 0 0 0-2.85-2.85c-.9 0-1.75.4-2.3 1.1L12 8.85l-.85-1.2a2.85 2.85 0 0 0-2.8-1.1z"
            />
        </Mark>
    );
}

export function BookmarkMark({
    className = 'h-4 w-4',
    filled = false,
}) {
    if (filled) {
        return (
            <Mark className={className}>
                <path d="M7 3.25h10A1.75 1.75 0 0 1 18.75 5v15.1a.9.9 0 0 1-1.4.75L12 17.4l-5.35 3.45a.9.9 0 0 1-1.4-.75V5A1.75 1.75 0 0 1 7 3.25z" />
            </Mark>
        );
    }

    return (
        <Mark className={className}>
            <path
                fillRule="evenodd"
                d="M7 3.25h10A1.75 1.75 0 0 1 18.75 5v15.1a.9.9 0 0 1-1.4.75L12 17.4l-5.35 3.45a.9.9 0 0 1-1.4-.75V5A1.75 1.75 0 0 1 7 3.25zm1.75 1.75v12.35L12 15.55l3.25 1.8V5H8.75z"
            />
        </Mark>
    );
}

export function StarMark({
    className = 'h-4 w-4',
    filled = false,
}) {
    if (filled) {
        return (
            <Mark className={className}>
                <path d="m12 2.6 2.55 5.17 5.7.83-4.12 4.02.97 5.67L12 15.7l-5.1 2.59.97-5.67L3.75 8.6l5.7-.83L12 2.6z" />
            </Mark>
        );
    }

    return (
        <Mark className={className}>
            <path
                fillRule="evenodd"
                d="m12 2.6 2.55 5.17 5.7.83-4.12 4.02.97 5.67L12 15.7l-5.1 2.59.97-5.67L3.75 8.6l5.7-.83L12 2.6zm0 3.35L10.35 9.3l-3.7.54 2.68 2.61-.63 3.68L12 14.4l3.3 1.68-.63-3.68 2.68-2.61-3.7-.54L12 5.95z"
            />
        </Mark>
    );
}

export function CalendarMark({ className = 'h-4 w-4' }) {
    return (
        <Mark className={className}>
            <path d="M8 2.75a1 1 0 0 1 1 1V5h6V3.75a1 1 0 1 1 2 0V5h1.25A2.75 2.75 0 0 1 21 7.75v11.5A2.75 2.75 0 0 1 18.25 22H5.75A2.75 2.75 0 0 1 3 19.25V7.75A2.75 2.75 0 0 1 5.75 5H7V3.75a1 1 0 0 1 1-1zM5 10.5v8.75c0 .41.34.75.75.75h12.5c.41 0 .75-.34.75-.75V10.5H5z" />
        </Mark>
    );
}

export function MenuMark({ className = 'h-4 w-4' }) {
    return (
        <Mark className={className}>
            <path d="M4 6.25A1.25 1.25 0 0 1 5.25 5h13.5a1.25 1.25 0 1 1 0 2.5H5.25A1.25 1.25 0 0 1 4 6.25zm0 5.75A1.25 1.25 0 0 1 5.25 10.75h13.5a1.25 1.25 0 1 1 0 2.5H5.25A1.25 1.25 0 0 1 4 12zm0 5.75A1.25 1.25 0 0 1 5.25 16.5h13.5a1.25 1.25 0 1 1 0 2.5H5.25A1.25 1.25 0 0 1 4 17.75z" />
        </Mark>
    );
}

export function PlusMark({ className = 'h-4 w-4' }) {
    return (
        <Mark className={className}>
            <path d="M12 4.25a1 1 0 0 1 1 1V11h5.75a1 1 0 1 1 0 2H13v5.75a1 1 0 1 1-2 0V13H5.25a1 1 0 1 1 0-2H11V5.25a1 1 0 0 1 1-1z" />
        </Mark>
    );
}

/** Three dots — More / overflow */
export function MoreMark({ className = 'h-4 w-4' }) {
    return (
        <Mark className={className}>
            <circle cx="5" cy="12" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="19" cy="12" r="2" />
        </Mark>
    );
}

export function UserMark({ className = 'h-4 w-4' }) {
    return (
        <Mark className={className}>
            <path d="M12 2.75a4.25 4.25 0 1 1 0 8.5 4.25 4.25 0 0 1 0-8.5zM12 13c3.95 0 7.5 2.05 8.85 5.1A1.75 1.75 0 0 1 19.25 20.5H4.75a1.75 1.75 0 0 1-1.6-2.4C4.5 15.05 8.05 13 12 13z" />
        </Mark>
    );
}

export function CompassMark({ className = 'h-4 w-4' }) {
    return (
        <Mark className={className}>
            <path d="M12 2.25a9.75 9.75 0 1 1 0 19.5 9.75 9.75 0 0 1 0-19.5zm2.85 6.05-1.55 5.15-5.15 1.55 1.55-5.15 5.15-1.55zM12 10.6a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8z" />
        </Mark>
    );
}

export function FiltersMark({ className = 'h-4 w-4' }) {
    return (
        <Mark className={className}>
            <path d="M4 6.25A1.25 1.25 0 0 1 5.25 5h13.5a1.25 1.25 0 1 1 0 2.5H5.25A1.25 1.25 0 0 1 4 6.25zm2.5 5.75A1.25 1.25 0 0 1 7.75 10.75h8.5a1.25 1.25 0 1 1 0 2.5h-8.5A1.25 1.25 0 0 1 6.5 12zm2.5 5.75A1.25 1.25 0 0 1 10.25 16.5h3.5a1.25 1.25 0 1 1 0 2.5h-3.5A1.25 1.25 0 0 1 9 17.75z" />
        </Mark>
    );
}

export function ListMark({ className = 'h-4 w-4' }) {
    return (
        <Mark className={className}>
            <path d="M8.5 6.25A1.25 1.25 0 0 1 9.75 5H19a1.25 1.25 0 1 1 0 2.5H9.75A1.25 1.25 0 0 1 8.5 6.25zm0 5.75A1.25 1.25 0 0 1 9.75 10.75H19a1.25 1.25 0 1 1 0 2.5H9.75A1.25 1.25 0 0 1 8.5 12zm0 5.75A1.25 1.25 0 0 1 9.75 16.5H19a1.25 1.25 0 1 1 0 2.5H9.75A1.25 1.25 0 0 1 8.5 17.75zM5 6.25a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0zm0 5.75a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0zm0 5.75a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0z" />
        </Mark>
    );
}

export function MapMark({ className = 'h-4 w-4' }) {
    return (
        <Mark className={className}>
            <path d="M14.85 3.2a1 1 0 0 1 .9.1l5 3.1A1 1 0 0 1 21.25 7.25v11.5a1 1 0 0 1-1.5.85l-4.6-2.7-5.15 2.85a1 1 0 0 1-.9-.05l-5.05-3A1 1 0 0 1 2.75 15.7V4.25A1 1 0 0 1 4.2 3.4l4.65 2.55 5.1-2.65a1 1 0 0 1 .9-.1zM9.5 7.55v10.05l4 2.2V9.75l-4-2.2zm-2 9.85V7.35L4.75 5.9v9.85l2.75 1.65zm8.5-7.65v10.05l2.75 1.6V9.5L16 9.75z" />
        </Mark>
    );
}

export function MailMark({ className = 'h-4 w-4' }) {
    return (
        <Mark className={className}>
            <path d="M4.75 5h14.5A2.75 2.75 0 0 1 22 7.75v8.5A2.75 2.75 0 0 1 19.25 19H4.75A2.75 2.75 0 0 1 2 16.25v-8.5A2.75 2.75 0 0 1 4.75 5zm.4 2.5 6.2 4.3a1.1 1.1 0 0 0 1.3 0l6.2-4.3H5.15zM4 9.85v6.4c0 .41.34.75.75.75h14.5c.41 0 .75-.34.75-.75v-6.4l-5.85 4.05a3.1 3.1 0 0 1-3.7 0L4 9.85z" />
        </Mark>
    );
}

export function PhoneMark({ className = 'h-4 w-4' }) {
    return (
        <Mark className={className}>
            <path d="M8.35 3.5c.55-.55 1.45-.55 2 0l1.55 1.55c.5.5.55 1.3.15 1.9l-.95 1.4a1.5 1.5 0 0 0 .2 1.9l3.4 3.4c.5.5 1.3.55 1.9.2l1.4-.95c.6-.4 1.4-.35 1.9.15l1.55 1.55c.55.55.55 1.45 0 2l-1.15 1.15c-.7.7-1.7 1.05-2.7.95-2.45-.25-5.15-1.85-7.85-4.55S4.4 9.15 4.15 6.7c-.1-1 .25-2 .95-2.7L6.25 2.85z" />
        </Mark>
    );
}

export function EmptyListingsMark({ className = 'h-4 w-4' }) {
    return (
        <Mark className={className}>
            <path d="M12 2.5a9.5 9.5 0 1 1 0 19 9.5 9.5 0 0 1 0-19zm-3.1 6.15a1.15 1.15 0 1 0 0 2.3 1.15 1.15 0 0 0 0-2.3zm6.2 0a1.15 1.15 0 1 0 0 2.3 1.15 1.15 0 0 0 0-2.3zM8.2 14.6a1 1 0 0 0-.2 1.4 5 5 0 0 0 8 0 1 1 0 1 0-1.6-1.2 3 3 0 0 1-4.8 0 1 1 0 0 0-1.4-.2z" />
        </Mark>
    );
}

/** Fork & knife — Eat & Drink */
export function EatMark({ className = 'h-4 w-4' }) {
    return (
        <Mark className={className}>
            <path d="M7.1 2.75c.55 0 1 .45 1 1V9.5c0 .83-.67 1.5-1.5 1.5S5.1 10.33 5.1 9.5V3.75c0-.55.45-1 1-1h1zM5.35 12.25h2.5c.55 0 1 .45 1 1V20.5a1 1 0 1 1-2 0v-5.5h-.5V20.5a1 1 0 1 1-2 0v-7.25c0-.55.45-1 1-1zM15.4 2.75c1.9 0 3.35 1.7 3.1 3.6l-.55 4.1c-.15 1.1-1.1 1.9-2.2 1.9h-.35V20.5a1 1 0 1 1-2 0V3.75c0-.55.45-1 1-1h1z" />
        </Mark>
    );
}

/** Bed — Stay */
export function StayMark({ className = 'h-4 w-4' }) {
    return (
        <Mark className={className}>
            <path d="M4.75 10.5V6.75A2.75 2.75 0 0 1 7.5 4h4.25A2.75 2.75 0 0 1 14.5 6.75V10.5H19A2.75 2.75 0 0 1 21.75 13.25v5.5a1 1 0 1 1-2 0v-1H4.25v1a1 1 0 1 1-2 0v-5.5A2.75 2.75 0 0 1 5 10.5h-.25zm2.75-4c-.41 0-.75.34-.75.75V10.5h5.25V7.25c0-.41-.34-.75-.75-.75H7.5zM3.25 15.75h17.5v-2.5c0-.41-.34-.75-.75-.75H5A.75.75 0 0 0 4.25 13.25v2.5z" />
        </Mark>
    );
}

/** Binoculars — Things to do */
export function ExploreMark({ className = 'h-4 w-4' }) {
    return (
        <Mark className={className}>
            <path d="M8.6 4.5h1.9l1 3.4h.9l1-3.4h1.9l1.55 5.1H18a3.75 3.75 0 1 1-3.55 4.95l-1.2-1.2a2 2 0 0 0-2.5 0l-1.2 1.2A3.75 3.75 0 1 1 6 9.6h.05L8.6 4.5zM7.75 12.25a1.75 1.75 0 1 0 0 3.5 1.75 1.75 0 0 0 0-3.5zm8.5 0a1.75 1.75 0 1 0 0 3.5 1.75 1.75 0 0 0 0-3.5z" />
        </Mark>
    );
}

/** Shopping bag */
export function ShopMark({ className = 'h-4 w-4' }) {
    return (
        <Mark className={className}>
            <path d="M9 3.5a3 3 0 0 1 6 0v1.75h2.35c1.35 0 2.45 1.05 2.55 2.4l.7 10.1A2.75 2.75 0 0 1 17.9 20.5H6.1a2.75 2.75 0 0 1-2.7-2.75l.7-10.1A2.6 2.6 0 0 1 6.65 5.25H9V3.5zm2 1.75h2V3.5a1 1 0 1 0-2 0v1.75zM6.65 7.25c-.3 0-.55.22-.58.52l-.7 10.1c-.05.4.27.73.68.73h11.9c.41 0 .73-.33.68-.73l-.7-10.1a.58.58 0 0 0-.58-.52H6.65z" />
        </Mark>
    );
}

/** Wrench — Services */
export function ServicesMark({ className = 'h-4 w-4' }) {
    return (
        <Mark className={className}>
            <path d="M14.7 3.35a5.5 5.5 0 0 0-7.1 6.55L3.4 14.1a2.25 2.25 0 0 0 3.18 3.18l4.2-4.2a5.5 5.5 0 0 0 6.55-7.1l-2.55 2.55a1.75 1.75 0 1 1-2.47-2.47l2.55-2.55a5.45 5.45 0 0 0-.16-.16z" />
        </Mark>
    );
}

/** House — Properties */
export function PropertyMark({ className = 'h-4 w-4' }) {
    return (
        <Mark className={className}>
            <path d="M11.35 3.35a1.1 1.1 0 0 1 1.3 0l8 6.1c.45.35.2 1.05-.35 1.05H19v8.25A1.75 1.75 0 0 1 17.25 20.5h-3.5a.75.75 0 0 1-.75-.75V15.5H11v4.25a.75.75 0 0 1-.75.75h-3.5A1.75 1.75 0 0 1 5 18.75V10.5H3.7c-.55 0-.8-.7-.35-1.05l8-6.1z" />
        </Mark>
    );
}

/** Calendar — Events */
export function EventMark({ className = 'h-4 w-4' }) {
    return <CalendarMark className={className} />;
}

/** Four tiles — account home */
export function DashboardMark({ className = 'h-4 w-4' }) {
    return (
        <Mark className={className}>
            <path d="M4.25 4.25h6.5v6.5h-6.5v-6.5zm9 0h6.5v6.5h-6.5v-6.5zm-9 9h6.5v6.5h-6.5v-6.5zm9 0h6.5v6.5h-6.5v-6.5z" />
        </Mark>
    );
}

/** Speech bubble — messages */
export function MessageMark({ className = 'h-4 w-4' }) {
    return (
        <Mark className={className}>
            <path d="M4.5 4.5h15A2.5 2.5 0 0 1 22 7v8a2.5 2.5 0 0 1-2.5 2.5H12l-4.6 3.45a.75.75 0 0 1-1.2-.6V17.5H4.5A2.5 2.5 0 0 1 2 15V7A2.5 2.5 0 0 1 4.5 4.5z" />
        </Mark>
    );
}

/** Credit card — billing */
export function CardMark({ className = 'h-4 w-4' }) {
    return (
        <Mark className={className}>
            <path d="M3.5 6.75A2.75 2.75 0 0 1 6.25 4h11.5A2.75 2.75 0 0 1 20.5 6.75v10.5A2.75 2.75 0 0 1 17.75 20H6.25A2.75 2.75 0 0 1 3.5 17.25V6.75zM5.25 8.5h13.5V6.75c0-.41-.34-.75-.75-.75H6.25c-.41 0-.75.34-.75.75V8.5zm0 3v5.75c0 .41.34.75.75.75h11.5c.41 0 .75-.34.75-.75V11.5H5.25z" />
        </Mark>
    );
}

/** Gear — settings */
export function GearMark({ className = 'h-4 w-4' }) {
    return (
        <Mark className={className}>
            <path
                fillRule="evenodd"
                d="M10.1 2.75h3.8l.45 2.05a6.9 6.9 0 0 1 1.85.95l2-.85 1.9 3.3-1.55 1.5c.1.4.15.8.15 1.25s-.05.85-.15 1.25l1.55 1.5-1.9 3.3-2-.85a6.9 6.9 0 0 1-1.85.95l-.45 2.05h-3.8l-.45-2.05a6.9 6.9 0 0 1-1.85-.95l-2 .85-1.9-3.3 1.55-1.5A6.7 6.7 0 0 1 4.75 12c0-.45.05-.85.15-1.25L3.35 9.25l1.9-3.3 2 .85a6.9 6.9 0 0 1 1.85-.95l.45-2.05zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"
            />
        </Mark>
    );
}

/** Sun — light theme */
export function SunMark({ className = 'h-4 w-4' }) {
    return (
        <Mark className={className}>
            <path d="M12 7.25a4.75 4.75 0 1 1 0 9.5 4.75 4.75 0 0 1 0-9.5zM12 2.5a1 1 0 0 1 1 1V5a1 1 0 1 1-2 0V3.5a1 1 0 0 1 1-1zm0 14a1 1 0 0 1 1 1v1.5a1 1 0 1 1-2 0V17.5a1 1 0 0 1 1-1zM3.5 12a1 1 0 0 1 1-1H6a1 1 0 1 1 0 2H4.5a1 1 0 0 1-1-1zm14 0a1 1 0 0 1 1-1H19.5a1 1 0 1 1 0 2H18.5a1 1 0 0 1-1-1zM5.4 5.4a1 1 0 0 1 1.4 0l1.05 1.05a1 1 0 1 1-1.4 1.4L5.4 6.8a1 1 0 0 1 0-1.4zm10.75 10.75a1 1 0 0 1 1.4 0l1.05 1.05a1 1 0 1 1-1.4 1.4l-1.05-1.05a1 1 0 0 1 0-1.4zM18.6 5.4a1 1 0 0 1 0 1.4l-1.05 1.05a1 1 0 1 1-1.4-1.4L17.2 5.4a1 1 0 0 1 1.4 0zM7.85 16.15a1 1 0 0 1 0 1.4L6.8 18.6a1 1 0 1 1-1.4-1.4l1.05-1.05a1 1 0 0 1 1.4 0z" />
        </Mark>
    );
}

/** Moon — dark theme */
export function MoonMark({ className = 'h-4 w-4' }) {
    return (
        <Mark className={className}>
            <path d="M14.35 3.4a.9.9 0 0 1 1.05 1.2 7.5 7.5 0 1 0 4 7.95.9.9 0 0 1 1.65.7A9.25 9.25 0 1 1 13.2 3.15a.9.9 0 0 1 1.15.25z" />
        </Mark>
    );
}

/** Star — Standard / featured listing tier */
export function StandardTierMark({ className = 'h-4 w-4' }) {
    return <StarMark className={className} filled />;
}

/** Bolt — Premium listing tier */
export function PremiumTierMark({ className = 'h-4 w-4' }) {
    return (
        <Mark className={className}>
            <path d="M13.4 2.6a.9.9 0 0 1 .55 1.55L10.9 8.4h4.85a.9.9 0 0 1 .7 1.48l-6.6 8.7a.9.9 0 0 1-1.6-.85L10.1 12H5.35a.9.9 0 0 1-.72-1.45l6.75-7.55a.9.9 0 0 1 1.02-.4z" />
        </Mark>
    );
}
