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
     * Sanitize rich-text HTML from the contact form for storage and email.
     */
    public static function sanitizeMessage(?string $html): string
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
            return trim(strip_tags($html, '<'.implode('><', self::ALLOWED_TAGS).'>'));
        }

        self::cleanChildren($root);

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

    private static function cleanChildren(DOMNode $parent): void
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

            if (in_array($tag, ['script', 'style', 'meta', 'link', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'img'], true)) {
                $parent->removeChild($child);

                continue;
            }

            if (in_array($tag, ['h1', 'h2', 'h4', 'h5', 'h6'], true)) {
                $child = self::replaceTag($child, 'h3');
                $tag = 'h3';
            } elseif ($tag === 'div') {
                $child = self::replaceTag($child, 'p');
                $tag = 'p';
            }

            if (! in_array($tag, self::ALLOWED_TAGS, true)) {
                while ($child->firstChild) {
                    $parent->insertBefore($child->firstChild, $child);
                }
                $parent->removeChild($child);
                self::cleanChildren($parent);

                return;
            }

            self::cleanAttributes($child, $tag);
            self::cleanChildren($child);
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
