import { field, label } from './fieldStyles';
import {
    Bold,
    Heading2,
    Italic,
    Link as LinkIcon,
    List,
    ListOrdered,
    Redo2,
    Underline,
    Undo2,
} from 'lucide-react';
import { useCallback, useEffect, useRef } from 'react';

function exec(command, value = null) {
    document.execCommand(command, false, value);
}

export default function RichTextEditor({
    id = 'description',
    value = '',
    onChange,
    placeholder = 'Tell the story…',
    error,
}) {
    const editorRef = useRef(null);
    const lastHtml = useRef(value || '');

    useEffect(() => {
        const el = editorRef.current;
        if (!el) return;
        if ((value || '') !== lastHtml.current) {
            el.innerHTML = value || '';
            lastHtml.current = value || '';
        }
    }, [value]);

    const emit = useCallback(() => {
        const el = editorRef.current;
        if (!el) return;
        const html = el.innerHTML === '<br>' ? '' : el.innerHTML;
        lastHtml.current = html;
        onChange?.(html);
    }, [onChange]);

    const run = (command, value = null) => {
        editorRef.current?.focus();
        exec(command, value);
        emit();
    };

    const addLink = () => {
        const url = window.prompt('Link URL', 'https://');
        if (!url) return;
        run('createLink', url);
    };

    const tools = [
        { icon: Bold, title: 'Bold', action: () => run('bold') },
        { icon: Italic, title: 'Italic', action: () => run('italic') },
        { icon: Underline, title: 'Underline', action: () => run('underline') },
        { icon: Heading2, title: 'Heading', action: () => run('formatBlock', 'h3') },
        { icon: List, title: 'Bullet list', action: () => run('insertUnorderedList') },
        {
            icon: ListOrdered,
            title: 'Numbered list',
            action: () => run('insertOrderedList'),
        },
        { icon: LinkIcon, title: 'Link', action: addLink },
        { icon: Undo2, title: 'Undo', action: () => run('undo') },
        { icon: Redo2, title: 'Redo', action: () => run('redo') },
    ];

    return (
        <div>
            <label className={label} htmlFor={id}>
                Description
            </label>
            <div
                className={`overflow-hidden rounded-xl border bg-white transition focus-within:border-mustard focus-within:ring-2 focus-within:ring-mustard/30 ${
                    error ? 'border-rose-400' : 'border-olive-200'
                }`}
            >
                <div className="flex flex-wrap gap-1 border-b border-olive-100 bg-olive-50/70 px-2 py-2">
                    {tools.map(({ icon: Icon, title, action }) => (
                        <button
                            key={title}
                            type="button"
                            title={title}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                action();
                            }}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-olive-700 transition hover:bg-white hover:text-olive-950"
                        >
                            <Icon className="h-4 w-4" strokeWidth={1.75} />
                        </button>
                    ))}
                </div>
                <div
                    id={id}
                    ref={editorRef}
                    role="textbox"
                    aria-multiline="true"
                    contentEditable
                    suppressContentEditableWarning
                    data-placeholder={placeholder}
                    onInput={emit}
                    onBlur={emit}
                    className={`${field} min-h-[160px] rounded-none border-0 focus:ring-0 empty:before:pointer-events-none empty:before:text-olive-400 empty:before:content-[attr(data-placeholder)]`}
                />
            </div>
            {error ? (
                <p className="mt-1.5 text-sm text-rose-600">{error}</p>
            ) : (
                <p className="mt-1.5 text-xs text-olive-500">
                    Use headings, lists, and links to make your listing easy to scan.
                </p>
            )}
        </div>
    );
}
