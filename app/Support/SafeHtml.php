<?php

namespace App\Support;

use DOMDocument;
use DOMElement;
use DOMNode;

class SafeHtml
{
    /**
     * @var list<string>
     */
    private const ALLOWED_TAGS = [
        'p', 'br', 'strong', 'b', 'em', 'i', 'u',
        'ul', 'ol', 'li', 'a', 'h3', 'span',
    ];

    /**
     * Extra tags allowed in editorial story bodies (TipTap).
     *
     * @var list<string>
     */
    private const STORY_EXTRA_TAGS = [
        'h2', 'blockquote', 'img', 'figure', 'figcaption',
    ];

    /**
     * Sanitize rich-text HTML from the contact form for storage and email.
     */
    public static function sanitizeMessage(?string $html): string
    {
        return self::sanitize($html, self::ALLOWED_TAGS);
    }

    /**
     * Sanitize TipTap story body HTML for storage and public render.
     */
    public static function sanitizeStory(?string $html): string
    {
        return self::sanitize($html, array_values(array_unique([
            ...self::ALLOWED_TAGS,
            ...self::STORY_EXTRA_TAGS,
        ])));
    }

    /**
     * @param  list<string>  $allowedTags
     */
    private static function sanitize(?string $html, array $allowedTags): string
    {
        $html = trim((string) $html);
        if ($html === '') {
            return '';
        }

        if (preg_match('/^(<p>(\s|&nbsp;|<br\s*\/?>)*<\/p>|\s|<br\s*\/?>)*$/i', $html)) {
            return '';
        }

        $document = new DOMDocument('1.0', 'UTF-8');
        $previous = libxml_use_internal_errors(true);
        $document->loadHTML(
            '<?xml encoding="UTF-8"><div id="nn-root">'.$html.'</div>',
        );
        libxml_clear_errors();
        libxml_use_internal_errors($previous);

        $root = $document->getElementById('nn-root');
        if (! $root) {
            return trim(strip_tags($html, '<'.implode('><', $allowedTags).'>'));
        }

        self::cleanChildren($root, $allowedTags);

        $clean = '';
        foreach (iterator_to_array($root->childNodes) as $child) {
            $clean .= $document->saveHTML($child);
        }

        return trim($clean);
    }

    /**
     * Plain-text length for validation (ignores tags).
     */
    public static function plainTextLength(?string $html): int
    {
        $text = html_entity_decode(strip_tags((string) $html), ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $text = preg_replace('/\x{200b}/u', '', $text) ?? $text;

        return mb_strlen(trim($text));
    }

    /**
     * Plain text for text/plain email parts.
     */
    public static function toPlainText(?string $html): string
    {
        $text = (string) $html;
        $text = preg_replace('/<\s*br\s*\/?\s*>/i', "\n", $text) ?? $text;
        $text = preg_replace('/<\/\s*p\s*>/i', "\n\n", $text) ?? $text;
        $text = preg_replace('/<\/\s*li\s*>/i', "\n", $text) ?? $text;
        $text = preg_replace('/<\/\s*h3\s*>/i', "\n\n", $text) ?? $text;
        $text = html_entity_decode(strip_tags($text), ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $text = preg_replace("/[ \t]+\n/", "\n", $text) ?? $text;
        $text = preg_replace("/\n{3,}/", "\n\n", $text) ?? $text;

        return trim($text);
    }

    /**
     * @param  list<string>  $allowedTags
     */
    private static function cleanChildren(DOMNode $parent, array $allowedTags): void
    {
        foreach (iterator_to_array($parent->childNodes) as $child) {
            if ($child->nodeType === XML_TEXT_NODE) {
                continue;
            }

            if ($child->nodeType !== XML_ELEMENT_NODE) {
                $parent->removeChild($child);

                continue;
            }

            /** @var DOMElement $child */
            $tag = strtolower($child->tagName);

            $alwaysStrip = ['script', 'style', 'meta', 'link', 'iframe', 'object', 'embed', 'form', 'input', 'button'];
            if (! in_array('img', $allowedTags, true)) {
                $alwaysStrip[] = 'img';
            }

            if (in_array($tag, $alwaysStrip, true)) {
                $parent->removeChild($child);

                continue;
            }

            if ($tag === 'h1' || $tag === 'h4' || $tag === 'h5' || $tag === 'h6') {
                $child = self::replaceTag($child, in_array('h2', $allowedTags, true) ? 'h2' : 'h3');
                $tag = strtolower($child->tagName);
            } elseif ($tag === 'h2' && ! in_array('h2', $allowedTags, true)) {
                $child = self::replaceTag($child, 'h3');
                $tag = 'h3';
            } elseif ($tag === 'div') {
                $child = self::replaceTag($child, 'p');
                $tag = 'p';
            }

            if (! in_array($tag, $allowedTags, true)) {
                while ($child->firstChild) {
                    $parent->insertBefore($child->firstChild, $child);
                }
                $parent->removeChild($child);
                self::cleanChildren($parent, $allowedTags);

                return;
            }

            self::cleanAttributes($child, $tag);
            self::cleanChildren($child, $allowedTags);
        }
    }

    private static function cleanAttributes(DOMElement $element, string $tag): void
    {
        $keep = [];

        if ($tag === 'a') {
            $href = trim((string) $element->getAttribute('href'));
            if ($href !== '' && preg_match('/^(https?:\/\/|mailto:)/i', $href)) {
                $keep['href'] = $href;
                $keep['target'] = '_blank';
                $keep['rel'] = 'noopener noreferrer';
            }
        }

        if ($tag === 'span') {
            $style = (string) $element->getAttribute('style');
            if (preg_match('/font-size\s*:\s*([0-9.]+px)/i', $style, $match)) {
                $keep['style'] = 'font-size: '.$match[1];
            }
        }

        if ($tag === 'img') {
            $src = trim((string) $element->getAttribute('src'));
            if ($src !== '' && preg_match('/^(https?:\/\/|\/)/i', $src)) {
                $keep['src'] = $src;
                $alt = trim((string) $element->getAttribute('alt'));
                if ($alt !== '') {
                    $keep['alt'] = $alt;
                }
                $keep['class'] = 'nn-editor-img';
                $keep['loading'] = 'lazy';
            }
        }

        while ($element->hasAttributes()) {
            $element->removeAttribute($element->attributes->item(0)?->name ?? '');
        }

        foreach ($keep as $name => $value) {
            $element->setAttribute($name, $value);
        }
    }

    private static function replaceTag(DOMElement $element, string $newTag): DOMElement
    {
        $document = $element->ownerDocument;
        $replacement = $document->createElement($newTag);
        while ($element->firstChild) {
            $replacement->appendChild($element->firstChild);
        }
        $element->parentNode?->replaceChild($replacement, $element);

        return $replacement;
    }
}
