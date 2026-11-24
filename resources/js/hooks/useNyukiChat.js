import { askNyuki } from '@/lib/nyukiChatApi';
import { useCallback, useState } from 'react';

/**
 * Browser-session Nyuki chat (history lives in React state only).
 */
export default function useNyukiChat() {
    const [messages, setMessages] = useState([]);
    const [draft, setDraft] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);

    const ask = useCallback(async (text) => {
        const q = String(text || '').trim();
        if (!q || busy) {
            return;
        }

        const history = messages.map((m) => ({
            role: m.role,
            content: m.body,
        }));

        const userId = `u-${Date.now()}`;
        const pendingId = `p-${Date.now()}`;

        setError(null);
        setDraft('');
        setBusy(true);
        setMessages((prev) => [
            ...prev,
            { id: userId, role: 'user', body: q },
            {
                id: pendingId,
                role: 'assistant',
                body: '',
                pending: true,
            },
        ]);

        try {
            const result = await askNyuki({ message: q, history });
            setMessages((prev) =>
                prev.map((m) =>
                    m.id === pendingId
                        ? {
                              id: `n-${Date.now()}`,
                              role: 'assistant',
                              body:
                                  result.reply ||
                                  'I could not form an answer. Try another question.',
                              citations: result.citations,
                              followUps: result.followUps,
                              exploreCta: result.exploreCta,
                          }
                        : m,
                ),
            );
        } catch (e) {
            const message =
                e?.message ||
                'Nyuki could not answer right now. Try again in a moment.';
            const errorKind =
                e?.code === 'busy' || e?.status === 429 ? 'busy' : 'error';
            setError(message);
            setMessages((prev) =>
                prev.map((m) =>
                    m.id === pendingId
                        ? {
                              id: `n-${Date.now()}`,
                              role: 'assistant',
                              body: message,
                              error: true,
                              errorKind,
                          }
                        : m,
                ),
            );
        } finally {
            setBusy(false);
        }
    }, [busy, messages]);

    return {
        messages,
        draft,
        setDraft,
        busy,
        error,
        ask,
    };
}
