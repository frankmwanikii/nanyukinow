import { field, label } from './fieldStyles';
import {
    Bold,
    Heading2,
    ImagePlus,
    Italic,
    Link as LinkIcon,
    List,
    ListOrdered,
    Loader2,
    Redo2,
    Underline,
    Undo2,
} from 'lucide-react';
import { useCallback, useEffect, useId, useRef, useState } from 'react';

const FONT_SIZES = [
    { label: 'Small', value: '13px' },
    { label: 'Normal', value: '16px' },
    { label: 'Medium', value: '18px' },
    { label: 'Large', value: '22px' },
    { label: 'Huge', value: '28px' },
];

function saveSelection() {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    return sel.getRangeAt(0);
}

function restoreSelection(range) {
    if (!range) return;
    const sel = window.getSelection();
    if (!sel) return;
    sel.removeAllRanges();
    sel.addRange(range);
}

function focusEditor(el) {
    el?.focus({ preventScroll: true });
}

function exec(command, value = null) {
    document.execCommand(command, false, value);
}

function applyFontSize(size) {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
        // No selection — apply to next typed text via a sized span.
        const span = document.createElement('span');
        span.style.fontSize = size;
        span.appendChild(document.createTextNode('\u200b'));
        const range = sel?.rangeCount ? sel.getRangeAt(0) : null;
        if (range) {
            range.insertNode(span);
            range.setStart(span.firstChild, 1);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
        }
        return;
    }

    document.execCommand('styleWithCSS', false, true);
    // fontSize only accepts 1–7; we restyle the resulting elements.
    document.execCommand('fontSize', false, '7');
    const editor = sel.anchorNode?.nodeType === 1
        ? sel.anchorNode
        : sel.anchorNode?.parentElement;
    const root = editor?.closest?.('[contenteditable]') || document;
    root.querySelectorAll('font[size="7"], span[style*="font-size: xx-large"]').forEach(
        (node) => {
            if (node.tagName === 'FONT') {
                const span = document.createElement('span');
                span.style.fontSize = size;
                while (node.firstChild) span.appendChild(node.firstChild);
                node.replaceWith(span);
            } else {
                node.style.fontSize = size;
            }
        },
    );
}

async function fileToEditorImage(file) {
    // Prefer server upload so descriptions stay small; fall back to compressed data URL.
    try {
        const csrf =
            document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute('content') || '';
        const body = new FormData();
        body.append('image', file);
        const res = await fetch('/account/listings/editor-media', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'X-CSRF-TOKEN': csrf,
                'X-Requested-With': 'XMLHttpRequest',
            },
            credentials: 'same-origin',
            body,
        });
        if (res.ok) {
            const json = await res.json();
            if (json?.url) return json.url;
        }
    } catch {
        // fall through to local compress
    }

    return compressImage(file);
}

function compressImage(file, maxWidth = 1200, quality = 0.82) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('Could not read image'));
        reader.onload = () => {
            const img = new Image();
            img.onerror = () => reject(new Error('Invalid image'));
            img.onload = () => {
                const scale = Math.min(1, maxWidth / img.width);
                const w = Math.round(img.width * scale);
                const h = Math.round(img.height * scale);
                const canvas = document.createElement('canvas');
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, w, h);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.src = reader.result;
        };
        reader.readAsDataURL(file);
    });
}

function ToolBtn({ title, active, disabled, onClick, children, className = '' }) {
    return (
        <button
            type="button"
            title={title}
            aria-label={title}
            aria-pressed={active || undefined}
            disabled={disabled}
            onMouseDown={(e) => {
                e.preventDefault();
                if (!disabled) onClick?.();
            }}
            className={`inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-1.5 text-olive-700 transition hover:bg-white hover:text-olive-950 disabled:cursor-not-allowed disabled:opacity-40 ${
                active ? 'bg-white text-olive-950 shadow-sm ring-1 ring-olive-200' : ''
            } ${className}`}
        >
            {children}
        </button>
    );
}

function Divider() {
    return <span className="mx-0.5 hidden h-5 w-px bg-olive-200 sm:block" aria-hidden />;
}

export default function RichTextEditor({
    id = 'description',
    label: labelText = 'Description',
    value = '',
    onChange,
    placeholder = 'Tell the story…',
    error,
    help: helpText,
    compact = false,
    allowImages = true,
}) {
    const editorRef = useRef(null);
    const fileRef = useRef(null);
    const lastHtml = useRef(value || '');
    const savedRange = useRef(null);
    const [fontSize, setFontSize] = useState('16px');
    const [uploading, setUploading] = useState(false);
    const [active, setActive] = useState({});
    const listId = useId();

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
        const html =
            el.innerHTML === '<br>' || el.innerHTML === '<div><br></div>'
                ? ''
                : el.innerHTML;
        lastHtml.current = html;
        onChange?.(html);
    }, [onChange]);

    const refreshActive = useCallback(() => {
        try {
            setActive({
                bold: document.queryCommandState('bold'),
                italic: document.queryCommandState('italic'),
                underline: document.queryCommandState('underline'),
                ul: document.queryCommandState('insertUnorderedList'),
                ol: document.queryCommandState('insertOrderedList'),
            });
        } catch {
            // ignore when selection is outside
        }
    }, []);

    const run = (command, commandValue = null) => {
        focusEditor(editorRef.current);
        restoreSelection(savedRange.current);
        document.execCommand('styleWithCSS', false, true);
        exec(command, commandValue);
        emit();
        refreshActive();
    };

    const rememberSelection = () => {
        const range = saveSelection();
        if (!range) return;
        const el = editorRef.current;
        if (!el) return;
        if (el.contains(range.commonAncestorContainer)) {
            savedRange.current = range;
        }
    };

    const addLink = () => {
        focusEditor(editorRef.current);
        restoreSelection(savedRange.current);
        const url = window.prompt('Link URL', 'https://');
        if (!url) return;
        run('createLink', url);
    };

    const applySize = (size) => {
        setFontSize(size);
        focusEditor(editorRef.current);
        restoreSelection(savedRange.current);
        applyFontSize(size);
        emit();
    };

    const insertImage = async (file) => {
        if (!file || !file.type.startsWith('image/')) return;
        setUploading(true);
        try {
            const src = await fileToEditorImage(file);
            focusEditor(editorRef.current);
            restoreSelection(savedRange.current);
            const safe = src.replace(/"/g, '&quot;');
            document.execCommand(
                'insertHTML',
                false,
                `<img src="${safe}" alt="" class="nn-editor-img" />`,
            );
            emit();
        } catch (err) {
            window.alert(err?.message || 'Could not add image.');
        } finally {
            setUploading(false);
            if (fileRef.current) fileRef.current.value = '';
        }
    };

    const onPaste = (e) => {
        const items = e.clipboardData?.items;
        if (!items) return;
        for (const item of items) {
            if (item.type.startsWith('image/')) {
                e.preventDefault();
                const file = item.getAsFile();
                if (file) insertImage(file);
                return;
            }
        }
    };

    const onDrop = (e) => {
        const file = e.dataTransfer?.files?.[0];
        if (file?.type.startsWith('image/')) {
            e.preventDefault();
            insertImage(file);
        }
    };

    const showImages = allowImages && !compact;
    const editorMinH = compact ? 'min-h-[120px]' : 'min-h-[200px]';
    const defaultHelp = compact
        ? 'Bold, lists, and links for a short About blurb.'
        : 'Font size, bullets, headings, links, and images — paste or drop a photo into the editor.';

    return (
        <div>
            <label className={label} htmlFor={id}>
                {labelText}
            </label>
            <div
                className={`overflow-hidden rounded-xl border bg-white transition focus-within:border-mustard focus-within:ring-2 focus-within:ring-mustard/30 ${
                    error ? 'border-rose-400' : 'border-olive-200'
                }`}
            >
                <div className="flex flex-wrap items-center gap-0.5 border-b border-olive-100 bg-gradient-to-b from-olive-50 to-olive-50/40 px-2 py-1.5">
                    {!compact ? (
                        <>
                            <label className="sr-only" htmlFor={`${listId}-size`}>
                                Font size
                            </label>
                            <select
                                id={`${listId}-size`}
                                value={fontSize}
                                title="Font size"
                                onMouseDown={rememberSelection}
                                onChange={(e) => applySize(e.target.value)}
                                className="mr-1 h-8 rounded-lg border-0 bg-white/80 px-2 text-xs font-semibold text-olive-800 shadow-sm ring-1 ring-olive-200 focus:ring-2 focus:ring-mustard/40"
                            >
                                {FONT_SIZES.map((s) => (
                                    <option key={s.value} value={s.value}>
                                        {s.label}
                                    </option>
                                ))}
                            </select>
                            <Divider />
                        </>
                    ) : null}

                    <ToolBtn
                        title="Bold"
                        active={active.bold}
                        onClick={() => run('bold')}
                    >
                        <Bold className="h-4 w-4" strokeWidth={2} />
                    </ToolBtn>
                    <ToolBtn
                        title="Italic"
                        active={active.italic}
                        onClick={() => run('italic')}
                    >
                        <Italic className="h-4 w-4" strokeWidth={2} />
                    </ToolBtn>
                    <ToolBtn
                        title="Underline"
                        active={active.underline}
                        onClick={() => run('underline')}
                    >
                        <Underline className="h-4 w-4" strokeWidth={2} />
                    </ToolBtn>

                    <Divider />

                    {!compact ? (
                        <ToolBtn
                            title="Heading"
                            onClick={() => run('formatBlock', 'h3')}
                        >
                            <Heading2 className="h-4 w-4" strokeWidth={1.75} />
                        </ToolBtn>
                    ) : null}
                    <ToolBtn
                        title="Bullet list"
                        active={active.ul}
                        onClick={() => run('insertUnorderedList')}
                    >
                        <List className="h-4 w-4" strokeWidth={1.75} />
                    </ToolBtn>
                    <ToolBtn
                        title="Numbered list"
                        active={active.ol}
                        onClick={() => run('insertOrderedList')}
                    >
                        <ListOrdered className="h-4 w-4" strokeWidth={1.75} />
                    </ToolBtn>
                    <ToolBtn title="Link" onClick={addLink}>
                        <LinkIcon className="h-4 w-4" strokeWidth={1.75} />
                    </ToolBtn>

                    {showImages ? (
                        <>
                            <Divider />
                            <ToolBtn
                                title="Add image"
                                disabled={uploading}
                                onClick={() => {
                                    rememberSelection();
                                    fileRef.current?.click();
                                }}
                                className="gap-1 px-2"
                            >
                                {uploading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <ImagePlus
                                        className="h-4 w-4"
                                        strokeWidth={1.75}
                                    />
                                )}
                                <span className="hidden text-[11px] font-semibold sm:inline">
                                    Image
                                </span>
                            </ToolBtn>
                            <input
                                ref={fileRef}
                                type="file"
                                accept="image/png,image/jpeg,image/webp,image/gif"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) insertImage(file);
                                }}
                            />
                        </>
                    ) : null}

                    <span className="ml-auto flex items-center gap-0.5">
                        <ToolBtn title="Undo" onClick={() => run('undo')}>
                            <Undo2 className="h-4 w-4" strokeWidth={1.75} />
                        </ToolBtn>
                        <ToolBtn title="Redo" onClick={() => run('redo')}>
                            <Redo2 className="h-4 w-4" strokeWidth={1.75} />
                        </ToolBtn>
                    </span>
                </div>

                <div
                    id={id}
                    ref={editorRef}
                    role="textbox"
                    aria-multiline="true"
                    contentEditable
                    suppressContentEditableWarning
                    data-placeholder={placeholder}
                    onInput={() => {
                        emit();
                        refreshActive();
                    }}
                    onBlur={emit}
                    onKeyUp={refreshActive}
                    onMouseUp={() => {
                        rememberSelection();
                        refreshActive();
                    }}
                    onPaste={showImages ? onPaste : undefined}
                    onDrop={showImages ? onDrop : undefined}
                    onDragOver={
                        showImages
                            ? (e) => {
                                  if (
                                      Array.from(
                                          e.dataTransfer?.types || [],
                                      ).includes('Files')
                                  ) {
                                      e.preventDefault();
                                  }
                              }
                            : undefined
                    }
                    className={`nn-editor ${field} ${editorMinH} rounded-none border-0 text-base leading-relaxed focus:ring-0 empty:before:pointer-events-none empty:before:text-olive-400 empty:before:content-[attr(data-placeholder)]`}
                />
            </div>
            {error ? (
                <p className="mt-1.5 text-sm text-rose-600">{error}</p>
            ) : (
                <p className="mt-1.5 text-xs text-olive-500">
                    {helpText ?? defaultHelp}
                </p>
            )}
        </div>
    );
}
