<?php

namespace Tests\Unit;

use App\Support\SafeHtml;
use PHPUnit\Framework\TestCase;

class SafeHtmlTest extends TestCase
{
    public function test_it_strips_scripts_and_keeps_safe_markup(): void
    {
        $clean = SafeHtml::sanitizeMessage(
            '<p>Hello <strong>there</strong></p><script>alert(1)</script><ul><li>One</li></ul>',
        );

        $this->assertStringContainsString('<p>Hello <strong>there</strong></p>', $clean);
        $this->assertStringContainsString('<li>One</li>', $clean);
        $this->assertStringNotContainsString('<script', $clean);
    }

    public function test_it_rejects_dangerous_links(): void
    {
        $clean = SafeHtml::sanitizeMessage(
            '<p><a href="javascript:alert(1)">Bad</a> <a href="https://nanyukinow.co.ke">Good</a></p>',
        );

        $this->assertStringNotContainsString('javascript:', $clean);
        $this->assertStringContainsString('https://nanyukinow.co.ke', $clean);
    }

    public function test_plain_text_length_ignores_tags(): void
    {
        $this->assertSame(
            11,
            SafeHtml::plainTextLength('<p>Hello <strong>world</strong></p>'),
        );
    }

    public function test_to_plain_text_preserves_line_breaks(): void
    {
        $plain = SafeHtml::toPlainText('<p>Hi</p><ul><li>One</li><li>Two</li></ul>');

        $this->assertStringContainsString('Hi', $plain);
        $this->assertStringContainsString('One', $plain);
        $this->assertStringContainsString('Two', $plain);
    }
}
