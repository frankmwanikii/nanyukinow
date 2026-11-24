/**
 * Drop-in Unicons replacements for former Lucide icon imports.
 * Import path: @/Components/site/LucideCompat
 */
import { UNICONS } from './uniconsPaths';

function Icon({ name, className = 'h-4 w-4', size, strokeWidth, absoluteStrokeWidth, ...props }) {
    const html = UNICONS[name];
    if (!html) {
        return null;
    }

    const resolvedClass = size != null ? `${className}`.replace(/\bh-\S+/g, '').replace(/\bw-\S+/g, '').trim() : className;
    const style = size != null ? { width: size, height: size, ...(props.style || {}) } : props.style;

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className={size != null ? `${resolvedClass} shrink-0`.trim() : className}
            style={style}
            aria-hidden="true"
            fill="currentColor"
            {...props}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}

function lucide(name) {
    return function LucideIcon(props) {
        return <Icon name={name} {...props} />;
    };
}
export const Accessibility = lucide('accessible-icon-alt');
export const AlertCircle = lucide('exclamation-circle');
export const AlertTriangle = lucide('exclamation-triangle');
export const ArrowDown = lucide('arrow-down');
export const ArrowLeft = lucide('arrow-left');
export const ArrowRight = lucide('arrow-right');
export const ArrowUp = lucide('arrow-up');
export const ArrowUpDown = lucide('arrows-v');
export const ArrowUpRight = lucide('arrow-up-right');
export const AtSign = lucide('at');
export const Baby = lucide('baby-carriage');
export const BadgeCheck = lucide('check-circle');
export const Banknote = lucide('money-bill');
export const BedDouble = lucide('bed-double');
export const Bold = lucide('bold');
export const BookUser = lucide('book-reader');
export const Bookmark = lucide('bookmark');
export const Briefcase = lucide('briefcase');
export const CalendarClock = lucide('calendar-alt');
export const CalendarDays = lucide('calendar-alt');
export const Camera = lucide('camera');
export const Car = lucide('car');
export const Check = lucide('check');
export const CheckCircle2 = lucide('check-circle');
export const ChevronDown = lucide('angle-down');
export const ChevronLeft = lucide('angle-left');
export const ChevronRight = lucide('angle-right');
export const ChevronsLeft = lucide('angle-double-left');
export const ChevronsRight = lucide('angle-double-right');
export const CircleCheck = lucide('check-circle');
export const CircleDollarSign = lucide('dollar-sign');
export const ClipboardCheck = lucide('clipboard-notes');
export const ClipboardList = lucide('clipboard-notes');
export const Clock = lucide('clock');
export const Cloud = lucide('cloud');
export const CloudOff = lucide('cloud-slash');
export const CloudUpload = lucide('cloud-upload');
export const ConciergeBell = lucide('bell');
export const Copy = lucide('copy');
export const CreditCard = lucide('credit-card');
export const Crop = lucide('crop-alt');
export const Crown = lucide('diamond');
export const Expand = lucide('arrows-maximize');
export const ExternalLink = lucide('external-link-alt');
export const Eye = lucide('eye');
export const EyeOff = lucide('eye-slash');
export const FileText = lucide('file-alt');
export const Film = lucide('film');
export const Filter = lucide('filter');
export const Flag = lucide('exclamation-triangle');
export const Flame = lucide('fire');
export const FolderTree = lucide('folder');
export const Globe = lucide('globe');
export const Grid2X2 = lucide('apps');
export const Heading2 = lucide('text-size');
export const Heart = lucide('heart');
export const Home = lucide('home');
export const Hourglass = lucide('hourglass');
export const Image = lucide('image');
export const ImagePlus = lucide('image-plus');
export const Images = lucide('images');
export const Inbox = lucide('inbox');
export const Info = lucide('info-circle');
export const Italic = lucide('italic');
export const KeyRound = lucide('key-skeleton');
export const LayoutDashboard = lucide('web-layout');
export const LayoutGrid = lucide('apps');
export const LayoutList = lucide('list-ul');
export const Leaf = lucide('trees');
export const Lightbulb = lucide('lightbulb');
export const Link = lucide('link');
export const Link2 = lucide('link-alt');
export const List = lucide('list-ul');
export const ListOrdered = lucide('list-ol');
export const Loader2 = lucide('spinner');
export const LogOut = lucide('sign-out-alt');
export const Mail = lucide('envelope');
export const MailOpen = lucide('envelope-open');
export const MapPin = lucide('map-marker');
export const Menu = lucide('bars');
export const MessageCircle = lucide('comment');
export const MessagesSquare = lucide('comments');
export const Moon = lucide('moon');
export const MoreVertical = lucide('ellipsis-v');
export const Newspaper = lucide('newspaper');
export const Package = lucide('package');
export const ParkingCircle = lucide('parking-circle');
export const PawPrint = lucide('favorite');
export const Pencil = lucide('edit-alt');
export const Phone = lucide('phone');
export const Plus = lucide('plus');
export const Redo2 = lucide('redo');
export const RefreshCw = lucide('refresh');
export const RotateCcw = lucide('history');
export const Save = lucide('save');
export const Search = lucide('search');
export const Send = lucide('telegram-alt');
export const Settings = lucide('setting');
export const Settings2 = lucide('sliders-v-alt');
export const Share = lucide('share');
export const Share2 = lucide('share-alt');
export const Shield = lucide('shield');
export const ShieldCheck = lucide('shield-check');
export const Shirt = lucide('bag');
export const ShoppingCart = lucide('shopping-cart');
export const Smartphone = lucide('mobile-android');
export const Snowflake = lucide('snowflake');
export const Sparkles = lucide('favorite');
export const Star = lucide('star');
export const Tag = lucide('tag');
export const Ticket = lucide('ticket');
export const Trash2 = lucide('trash-alt');
export const Trees = lucide('trees');
export const Underline = lucide('underline');
export const Undo2 = lucide('history');
export const Upload = lucide('upload');
export const UserRound = lucide('user');
export const Users = lucide('users-alt');
export const Utensils = lucide('utensils');
export const UtensilsCrossed = lucide('utensils-alt');
export const Wallet = lucide('wallet');
export const Waves = lucide('water');
export const Wifi = lucide('wifi');
export const Wine = lucide('glass-martini-alt');
export const X = lucide('multiply');
export const XCircle = lucide('times-circle');
export const Zap = lucide('bolt');
