<?php

namespace Tests\Feature;

use App\Mail\NewsletterSubscriptionConfirmationMail;
use App\Models\NewsletterSubscriber;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class NewsletterSubscribeTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_subscribe_via_ajax(): void
    {
        Mail::fake();

        $this->postJson(route('newsletter.subscribe'), [
            'email' => 'insider@example.com',
        ])
            ->assertOk()
            ->assertJson([
                'success' => true,
            ]);

        $this->assertDatabaseHas('newsletter_subscribers', [
            'email' => 'insider@example.com',
        ]);

        Mail::assertSent(NewsletterSubscriptionConfirmationMail::class, function (NewsletterSubscriptionConfirmationMail $mail) {
            $mail->assertTo('insider@example.com');
            $mail->assertSeeInHtml('You’re in');
            $mail->assertSeeInHtml('insider@example.com');

            return $mail->subscriberEmail === 'insider@example.com';
        });
    }

    public function test_subscribe_is_idempotent_for_same_email(): void
    {
        Mail::fake();

        NewsletterSubscriber::query()->create([
            'email' => 'insider@example.com',
            'subscribed_at' => now()->subDay(),
        ]);

        $this->postJson(route('newsletter.subscribe'), [
            'email' => 'Insider@Example.com',
        ])->assertOk();

        $this->assertSame(1, NewsletterSubscriber::query()->count());

        Mail::assertSent(NewsletterSubscriptionConfirmationMail::class);
    }

    public function test_subscribe_requires_valid_email(): void
    {
        $this->postJson(route('newsletter.subscribe'), [
            'email' => 'not-an-email',
        ])->assertStatus(422);
    }
}
