import { field, label } from './fieldStyles';
import {
    Bold,
    ChevronDown,
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
            className={`inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-1.5 text-olive-700 transition hover:bg-white hover:text-olive-950 disabled:cursor-not-allowed disabled:opacity-40 dark:text-olive-300 dark:hover:bg-olive-800 dark:hover:text-olive-50 ${
                active
                    ? 'bg-white text-olive-950 shadow-sm ring-1 ring-olive-200 dark:bg-olive-800 dark:text-olive-50 dark:ring-olive-600'
                    : ''
            } ${className}`}
        >
            {children}
        </button>
    );
}

function Divider() {
    return (
        <span
            className="mx-0.5 hidden h-5 w-px bg-olive-200 dark:bg-olive-700 sm:block"
            aria-hidden
        />
    );
}

const PASTE_ALLOWED = new Set([
    'P',
    'BR',
    'STRONG',
    'B',
    'EM',
    'I',
    'U',
    'UL',
    'OL',
    'LI',
    'A',
    'H1',
    'H2',
    'H3',
    'H4',
    'SPAN',
    'DIV',
]);

function escapeHtml(text) {
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/** Turn plain pasted text into readable paragraphs / lists. */
function plainTextToStyledHtml(text) {
    const lines = String(text)
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .split('\n');

    const blocks = [];
    let listType = null;
    let listItems = [];

    const flushList = () => {
        if (!listType || !listItems.length) {
            listType = null;
            listItems = [];
            return;
        }
        const tag = listType;
        blocks.push(
            `<${tag}>${listItems.map((item) => `<li>${item}</li>`).join('')}</${tag}>`,
        );
        listType = null;
        listItems = [];
    };

    for (const raw of lines) {
        const line = raw.replace(/\u00a0/g, ' ').trimEnd();
        const trimmed = line.trim();

        if (!trimmed) {
            flushList();
            continue;
        }

        const numbered = trimmed.match(/^\d+[.)]\s+(.+)$/);
        const bulleted = trimmed.match(/^[-*•]\s+(.+)$/);

        if (numbered) {
            if (listType && listType !== 'ol') flushList();
            listType = 'ol';
            listItems.push(escapeHtml(numbered[1]));
            continue;
        }

        if (bulleted) {
            if (listType && listType !== 'ul') flushList();
            listType = 'ul';
            listItems.push(escapeHtml(bulleted[1]));
            continue;
        }

        flushList();

        const looksHeading =
            trimmed.length <= 80 &&
            !trimmed.endsWith('.') &&
            (/^[A-Z0-9][A-Z0-9\s,&/'-]{2,}$/.test(trimmed) ||
                /^how\b.+/i.test(trimmed) ||
                /^\d+\.\s+[A-Z]/.test(raw.trim()));

        if (looksHeading && trimmed === trimmed.toUpperCase() && trimmed.length > 3) {
            blocks.push(`<h3>${escapeHtml(trimmed)}</h3>`);
        } else {
            blocks.push(`<p>${escapeHtml(trimmed)}</p>`);
        }
    }

    flushList();

    return blocks.join('') || `<p>${escapeHtml(text)}</p>`;
}

/** Keep useful structure from Word/Docs/etc., drop junk chrome. */
function sanitizePastedHtml(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    doc.querySelectorAll('script, style, meta, link, xml, img, iframe, object, embed').forEach(
        (node) => node.remove(),
    );

    const clean = (node) => {
        const children = Array.from(node.childNodes);
        for (const child of children) {
            if (child.nodeType === Node.COMMENT_NODE) {
                child.remove();
                continue;
            }
            if (child.nodeType !== Node.ELEMENT_NODE) continue;

            const tag = child.tagName;
            if (['H1', 'H2', 'H4', 'H5', 'H6'].includes(tag)) {
                const h3 = doc.createElement('h3');
                while (child.firstChild) h3.appendChild(child.firstChild);
                child.replaceWith(h3);
                clean(h3);
                continue;
            }

            if (tag === 'DIV') {
                const p = doc.createElement('p');
                while (child.firstChild) p.appendChild(child.firstChild);
                child.replaceWith(p);
                clean(p);
                continue;
            }

            if (!PASTE_ALLOWED.has(tag)) {
                const parent = child.parentNode;
                while (child.firstChild) parent.insertBefore(child.firstChild, child);
                child.remove();
                clean(parent);
                continue;
            }

            [...child.attributes].forEach((attr) => {
                const name = attr.name.toLowerCase();
                if (tag === 'A' && name === 'href') {
                    const href = attr.value.trim();
                    if (!/^(https?:\/\/|mailto:)/i.test(href)) {
                        child.removeAttribute(attr.name);
                    }
                    return;
                }
                if (tag === 'SPAN' && name === 'style') {
                    const size = attr.value.match(/font-size\s*:\s*([0-9.]+px)/i);
                    if (size) {
                        child.setAttribute('style', `font-size: ${size[1]}`);
                    } else {
                        child.removeAttribute(attr.name);
                    }
                    return;
                }
                child.removeAttribute(attr.name);
            });

            if (tag === 'A') {
                child.setAttribute('target', '_blank');
                child.setAttribute('rel', 'noopener noreferrer');
            }

            clean(child);
        }
    };

    clean(doc.body);

    // Collapse empty paragraphs Word often leaves behind
    doc.body.querySelectorAll('p').forEach((p) => {
        if (!p.textContent?.trim() && !p.querySelector('br')) {
            p.remove();
        }
    });

    return doc.body.innerHTML.trim();
}

export default function RichTextEditor({
    id = 'description',
    label: labelText = 'Description',
    value = '',
    onChange,
    onBlur: onBlurProp,
    placeholder = 'Tell the story…',
    error,
    ok = false,
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

    const showImages = allowImages && !compact;

    const onPaste = (e) => {
        const items = e.clipboardData?.items;
        if (showImages && items) {
            for (const item of items) {
                if (item.type.startsWith('image/')) {
                    e.preventDefault();
                    const file = item.getAsFile();
                    if (file) insertImage(file);
                    return;
                }
            }
        }

        const html = e.clipboardData?.getData('text/html')?.trim();
        const text = e.clipboardData?.getData('text/plain') ?? '';

        // Always intercept so pasted content lands as structured, styled HTML.
        if (html || text) {
            e.preventDefault();
            focusEditor(editorRef.current);
            restoreSelection(savedRange.current);
            document.execCommand('styleWithCSS', false, true);

            let styled = '';
            if (html) {
                styled = sanitizePastedHtml(html);
            }
            if (!styled && text) {
                styled = plainTextToStyledHtml(text);
            }
            if (styled) {
                document.execCommand('insertHTML', false, styled);
                emit();
                refreshActive();
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

    const editorMinH = compact ? 'min-h-[120px]' : 'min-h-[160px]';
    const defaultHelp = compact
        ? 'Bold, lists, and links for a short About blurb.'
        : 'Use the toolbar — paste keeps bold, lists, and headings automatically.';

    return (
        <div>
            <label className={label} htmlFor={id}>
                {labelText}
            </label>
            <div
                className={`overflow-hidden rounded-xl border bg-white transition focus-within:border-mustard focus-within:ring-2 focus-within:ring-mustard/30 dark:bg-olive-950 dark:focus-within:border-mustard dark:focus-within:ring-mustard/30 ${
                    error
                        ? 'border-rose-400'
                        : 'border-olive-200 dark:border-olive-700'
                }`}
            >
                <div className="flex flex-wrap items-center gap-0.5 border-b border-olive-100 bg-gradient-to-b from-olive-50 to-olive-50/40 px-2 py-1.5 dark:border-olive-800 dark:from-olive-900 dark:to-olive-900/80">
                    {!compact ? (
                        <>
                            <label className="sr-only" htmlFor={`${listId}-size`}>
                                Font size
                            </label>
                            <span className="relative mr-1 inline-flex">
                                <select
                                    id={`${listId}-size`}
                                    value={fontSize}
                                    title="Font size"
                                    onMouseDown={rememberSelection}
                                    onChange={(e) => applySize(e.target.value)}
                                    className="nn-editor-size h-8 rounded-lg border-0 bg-white/80 py-0 pl-2.5 pr-7 text-xs font-semibold text-olive-800 shadow-sm ring-1 ring-olive-200 focus:ring-2 focus:ring-mustard/40 dark:bg-olive-950 dark:text-olive-100 dark:ring-olive-700"
                                >
                                    {FONT_SIZES.map((s) => (
                                        <option key={s.value} value={s.value}>
                                            {s.label}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown
                                    className="pointer-events-none absolute right-1.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-olive-600 dark:text-olive-300"
                                    strokeWidth={2.25}
                                    aria-hidden
                                />
                            </span>
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
                    onBlur={() => {
                        emit();
                        onBlurProp?.();
                    }}
                    onKeyUp={refreshActive}
                    onMouseUp={() => {
                        rememberSelection();
                        refreshActive();
                    }}
                    onPaste={onPaste}
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
                    className={`nn-editor ${field} ${editorMinH} rounded-none border-0 text-base leading-relaxed focus:ring-0 empty:before:pointer-events-none empty:before:text-olive-400 empty:before:content-[attr(data-placeholder)] dark:empty:before:text-olive-500`}
                />
            </div>
            {error ? (
                <p className="mt-1.5 text-sm text-rose-600 dark:text-rose-400">
                    {error}
                </p>
            ) : ok ? (
                <p className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-olive-700 dark:text-olive-300">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-olive-700 text-white">
                        <svg
                            viewBox="0 0 24 24"
                            className="h-2.5 w-2.5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            aria-hidden
                        >
                            <path d="M5 13l4 4L19 7" />
                        </svg>
                    </span>
                    Looks good
                </p>
            ) : (
                <p className="mt-1.5 text-xs text-olive-500 dark:text-olive-400">
                    {helpText ?? defaultHelp}
                </p>
            )}
        </div>
    );
}
