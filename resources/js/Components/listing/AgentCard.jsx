import { Mail, Phone, UserRound } from 'lucide-react';
import DetailSection from './DetailSection';

export default function AgentCard({ agent, title = 'Contact agent' }) {
    if (!agent?.name && !agent?.phone) return null;

    const tel = agent.phone
        ? `tel:${String(agent.phone).replace(/\s+/g, '')}`
        : null;

    return (
        <DetailSection title={title}>
            <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-olive-100 text-olive-700">
                    <UserRound className="h-5 w-5" />
                </span>
                <div>
                    <p className="font-display text-base font-semibold text-earth-dusk">
                        {agent.name}
                    </p>
                    {agent.note ? (
                        <p className="mt-1 text-sm text-olive-600">{agent.note}</p>
                    ) : null}
                </div>
            </div>
            <div className="mt-4 flex flex-col gap-2">
                {tel ? (
                    <a
                        href={tel}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-mustard px-4 py-2.5 text-sm font-bold text-olive-950 transition hover:bg-olive-700 hover:text-white"
                    >
                        <Phone className="h-4 w-4" />
                        {agent.phone}
                    </a>
                ) : null}
                {agent.email ? (
                    <a
                        href={`mailto:${agent.email}`}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-olive-50 px-4 py-2.5 text-sm font-semibold text-olive-800 transition hover:bg-olive-100"
                    >
                        <Mail className="h-4 w-4" />
                        {agent.email}
                    </a>
                ) : null}
            </div>
        </DetailSection>
    );
}
