import FieldLabel from './FieldLabel';
import { useAlert, usePrompt } from '@/Components/ConfirmDialog';
import { uploadEditorMedia } from '@/utils/uploadEditorMedia';
import { EditorContent, useEditor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { TextStyle } from '@tiptap/extension-text-style';
import { FontSize } from '@tiptap/extension-text-style/font-size';
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
    Underline as UnderlineIcon,
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

function normalizeEditorHtml(html) {
    if (!html) return '';
    const trimmed = String(html).trim();
    if (
        trimmed === '' ||
        trimmed === '<p></p>' ||
        trimmed === '<p><br></p>' ||
        trimmed === '<p><br/></p>'
    ) {
        return '';
    }
    return trimmed;
}

async function fileToEditorImage(file, uploadUrl = null) {
    const url = await uploadEditorMedia(file, uploadUrl);
    if (url) {
        return url;
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
                canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.src = reader.result;
        };
        reader.readAsDataURL(file);
    });
}

function ToolBtn({
    title,
    active,
    disabled,
    onClick,
    children,
    className = '',
}) {
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

function BubbleBtn({ title, active, onClick, children }) {
    return (
        <button
            type="button"
            title={title}
            aria-label={title}
            aria-pressed={active || undefined}
            onMouseDown={(e) => {
                e.preventDefault();
                onClick?.();
            }}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition ${
                active
                    ? 'bg-olive-100 text-olive-950 ring-1 ring-olive-200 dark:bg-olive-800 dark:text-olive-50 dark:ring-olive-600'
                    : 'text-olive-700 hover:bg-olive-50 dark:text-olive-200 dark:hover:bg-olive-800'
            }`}
        >
            {children}
        </button>
    );
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
    uploadUrl = null,
}) {
    const { alert, dialog: alertDialog } = useAlert();
    const { prompt, dialog: promptDialog } = usePrompt();
    const fileRef = useRef(null);
    const [fontSize, setFontSize] = useState('16px');
    const [uploading, setUploading] = useState(false);
    const [, setTick] = useState(0);
    const listId = useId();
    const showImages = allowImages && !compact;
    const lastEmitted = useRef(normalizeEditorHtml(value));

    const emitHtml = useCallback(
        (editorInstance) => {
            if (!editorInstance) return;
            const html = normalizeEditorHtml(editorInstance.getHTML());
            lastEmitted.current = html;
            onChange?.(html);
        },
        [onChange],
    );

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: { levels: [3] },
                link: false,
                underline: false,
            }),
            Underline,
            TextStyle,
            FontSize,
            Link.configure({
                openOnClick: false,
                autolink: true,
                defaultProtocol: 'https',
                HTMLAttributes: {
                    target: '_blank',
                    rel: 'noopener noreferrer',
                },
            }),
            Image.configure({
                allowBase64: true,
                HTMLAttributes: {
                    class: 'nn-editor-img',
                },
            }),
            Placeholder.configure({
                placeholder,
            }),
        ],
        content: value || '',
        editorProps: {
            attributes: {
                id,
                class: `nn-editor tiptap ProseMirror ${
                    compact ? 'min-h-[120px]' : 'min-h-[160px]'
                } px-3.5 py-3 text-base leading-relaxed text-olive-900 outline-none dark:text-olive-50`,
                role: 'textbox',
                'aria-multiline': 'true',
            },
            handlePaste: (view, event) => {
                if (!showImages) return false;
                const items = event.clipboardData?.items;
                if (!items) return false;
                for (const item of items) {
                    if (item.type.startsWith('image/')) {
                        event.preventDefault();
                        const file = item.getAsFile();
                        if (file) {
                            view.dom.dispatchEvent(
                                new CustomEvent('nn-editor-image', {
                                    detail: { file },
                                    bubbles: true,
                                }),
                            );
                        }
                        return true;
                    }
                }
                return false;
            },
            handleDrop: (view, event) => {
                if (!showImages) return false;
                const file = event.dataTransfer?.files?.[0];
                if (file?.type.startsWith('image/')) {
                    event.preventDefault();
                    view.dom.dispatchEvent(
                        new CustomEvent('nn-editor-image', {
                            detail: { file },
                            bubbles: true,
                        }),
                    );
                    return true;
                }
                return false;
            },
        },
        onUpdate: ({ editor: ed }) => emitHtml(ed),
        onSelectionUpdate: () => setTick((n) => n + 1),
        onTransaction: () => setTick((n) => n + 1),
        onBlur: () => onBlurProp?.(),
    });

    useEffect(() => {
        if (!editor) return;
        const next = normalizeEditorHtml(value);
        const current = normalizeEditorHtml(editor.getHTML());
        if (next !== current && next !== lastEmitted.current) {
            editor.commands.setContent(value || '', { emitUpdate: false });
            lastEmitted.current = next;
        }
    }, [value, editor]);

    const insertImage = useCallback(
        async (file) => {
            if (!editor || !file || !file.type.startsWith('image/')) return;
            setUploading(true);
            try {
                const src = await fileToEditorImage(file, uploadUrl);
                editor.chain().focus().setImage({ src, alt: '' }).run();
                emitHtml(editor);
            } catch (err) {
                await alert({
                    title: 'Could not add image',
                    message: err?.message || 'Could not add image.',
                    tone: 'danger',
                });
            } finally {
                setUploading(false);
                if (fileRef.current) fileRef.current.value = '';
            }
        },
        [alert, editor, emitHtml, uploadUrl],
    );

    useEffect(() => {
        if (!editor || !showImages) return undefined;
        const el = editor.view.dom;
        const onCustomImage = (e) => {
            const file = e.detail?.file;
            if (file) insertImage(file);
        };
        el.addEventListener('nn-editor-image', onCustomImage);
        return () => el.removeEventListener('nn-editor-image', onCustomImage);
    }, [editor, showImages, insertImage]);

    const addLink = async () => {
        if (!editor) return;
        const previous = editor.getAttributes('link').href || 'https://';
        const url = await prompt({
            title: 'Add link',
            message: 'Paste a URL to link the selected text.',
            label: 'Link URL',
            defaultValue: previous,
            placeholder: 'https://',
            confirmLabel: 'Add link',
        });
        if (url === null) return;
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }
        editor
            .chain()
            .focus()
            .extendMarkRange('link')
            .setLink({ href: url })
            .run();
    };

    const applySize = (size) => {
        setFontSize(size);
        editor?.chain().focus().setFontSize(size).run();
    };

    const defaultHelp = compact
        ? 'Bold, lists, and links for a short About blurb.'
        : 'Use the toolbar — select text for quick formatting, or paste to keep structure.';

    const active = {
        bold: editor?.isActive('bold') ?? false,
        italic: editor?.isActive('italic') ?? false,
        underline: editor?.isActive('underline') ?? false,
        ul: editor?.isActive('bulletList') ?? false,
        ol: editor?.isActive('orderedList') ?? false,
        heading: editor?.isActive('heading', { level: 3 }) ?? false,
        link: editor?.isActive('link') ?? false,
    };

    return (
        <div>
            {alertDialog}
            {promptDialog}
            <FieldLabel htmlFor={id}>{labelText}</FieldLabel>
            <div
                className={`overflow-hidden border bg-white transition focus-within:border-olive-900 dark:bg-olive-950 dark:focus-within:border-mustard ${
                    error
                        ? 'border-rose-400'
                        : 'border-olive-900/20 dark:border-olive-700'
                }`}
            >
                <div className="flex flex-wrap items-center gap-0.5 border-b border-olive-900/10 bg-olive-50 px-2 py-1.5 dark:border-olive-800 dark:bg-olive-900">
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
                                    onChange={(e) => applySize(e.target.value)}
                                    className="nn-editor-size h-8 border border-olive-900/15 bg-white py-0 pl-2.5 pr-7 text-xs font-semibold text-olive-800 focus:border-olive-900 focus:outline-none focus:ring-0 dark:border-olive-700 dark:bg-olive-950 dark:text-olive-100"
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
                        disabled={!editor}
                        onClick={() =>
                            editor?.chain().focus().toggleBold().run()
                        }
                    >
                        <Bold className="h-4 w-4" strokeWidth={2} />
                    </ToolBtn>
                    <ToolBtn
                        title="Italic"
                        active={active.italic}
                        disabled={!editor}
                        onClick={() =>
                            editor?.chain().focus().toggleItalic().run()
                        }
                    >
                        <Italic className="h-4 w-4" strokeWidth={2} />
                    </ToolBtn>
                    <ToolBtn
                        title="Underline"
                        active={active.underline}
                        disabled={!editor}
                        onClick={() =>
                            editor?.chain().focus().toggleUnderline().run()
                        }
                    >
                        <UnderlineIcon className="h-4 w-4" strokeWidth={2} />
                    </ToolBtn>

                    <Divider />

                    {!compact ? (
                        <ToolBtn
                            title="Heading"
                            active={active.heading}
                            disabled={!editor}
                            onClick={() =>
                                editor
                                    ?.chain()
                                    .focus()
                                    .toggleHeading({ level: 3 })
                                    .run()
                            }
                        >
                            <Heading2 className="h-4 w-4" strokeWidth={1.75} />
                        </ToolBtn>
                    ) : null}
                    <ToolBtn
                        title="Bullet list"
                        active={active.ul}
                        disabled={!editor}
                        onClick={() =>
                            editor?.chain().focus().toggleBulletList().run()
                        }
                    >
                        <List className="h-4 w-4" strokeWidth={1.75} />
                    </ToolBtn>
                    <ToolBtn
                        title="Numbered list"
                        active={active.ol}
                        disabled={!editor}
                        onClick={() =>
                            editor?.chain().focus().toggleOrderedList().run()
                        }
                    >
                        <ListOrdered className="h-4 w-4" strokeWidth={1.75} />
                    </ToolBtn>
                    <ToolBtn
                        title="Link"
                        active={active.link}
                        disabled={!editor}
                        onClick={addLink}
                    >
                        <LinkIcon className="h-4 w-4" strokeWidth={1.75} />
                    </ToolBtn>

                    {showImages ? (
                        <>
                            <Divider />
                            <ToolBtn
                                title="Add image"
                                disabled={!editor || uploading}
                                onClick={() => fileRef.current?.click()}
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
                        <ToolBtn
                            title="Undo"
                            disabled={!editor?.can().undo()}
                            onClick={() => editor?.chain().focus().undo().run()}
                        >
                            <Undo2 className="h-4 w-4" strokeWidth={1.75} />
                        </ToolBtn>
                        <ToolBtn
                            title="Redo"
                            disabled={!editor?.can().redo()}
                            onClick={() => editor?.chain().focus().redo().run()}
                        >
                            <Redo2 className="h-4 w-4" strokeWidth={1.75} />
                        </ToolBtn>
                    </span>
                </div>

                {editor ? (
                    <BubbleMenu
                        editor={editor}
                        options={{ placement: 'top' }}
                        className="flex items-center gap-0.5 border border-olive-900/20 bg-white p-1 dark:border-olive-700 dark:bg-olive-900"
                    >
                        <BubbleBtn
                            title="Bold"
                            active={active.bold}
                            onClick={() =>
                                editor.chain().focus().toggleBold().run()
                            }
                        >
                            <Bold className="h-3.5 w-3.5" strokeWidth={2.25} />
                        </BubbleBtn>
                        <BubbleBtn
                            title="Italic"
                            active={active.italic}
                            onClick={() =>
                                editor.chain().focus().toggleItalic().run()
                            }
                        >
                            <Italic className="h-3.5 w-3.5" strokeWidth={2.25} />
                        </BubbleBtn>
                        <BubbleBtn
                            title="Underline"
                            active={active.underline}
                            onClick={() =>
                                editor.chain().focus().toggleUnderline().run()
                            }
                        >
                            <UnderlineIcon
                                className="h-3.5 w-3.5"
                                strokeWidth={2.25}
                            />
                        </BubbleBtn>
                        <BubbleBtn
                            title="Link"
                            active={active.link}
                            onClick={addLink}
                        >
                            <LinkIcon
                                className="h-3.5 w-3.5"
                                strokeWidth={1.75}
                            />
                        </BubbleBtn>
                    </BubbleMenu>
                ) : null}

                <EditorContent editor={editor} />
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
            ) : (helpText ?? defaultHelp) ? (
                <p className="mt-1.5 text-xs text-olive-500 dark:text-olive-400">
                    {helpText ?? defaultHelp}
                </p>
            ) : null}
        </div>
    );
}
