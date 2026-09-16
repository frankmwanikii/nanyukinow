import { Banknote, CreditCard, Smartphone, Wallet } from 'lucide-react';
import DetailSection from './DetailSection';

function iconFor(method) {
    const m = String(method).toLowerCase();
    if (m.includes('mpesa') || m.includes('paybill')) return Smartphone;
    if (m.includes('card')) return CreditCard;
    if (m.includes('bank')) return Wallet;
    return Banknote;
}

export default function WaysToPay({ payments = [] }) {
    const items = Array.isArray(payments) ? payments.filter(Boolean) : [];
    if (!items.length) return null;

    return (
        <DetailSection title="Ways to pay">
            <ul className="flex flex-wrap gap-2">
                {items.map((method) => {
                    const Icon = iconFor(method);
                    return (
                        <li
                            key={method}
                            className="inline-flex items-center gap-2 rounded-full bg-olive-50 px-3 py-2 text-sm font-semibold text-olive-800"
                        >
                            <Icon className="h-4 w-4 text-mustard" />
                            {method}
                        </li>
                    );
                })}
            </ul>
        </DetailSection>
    );
}
