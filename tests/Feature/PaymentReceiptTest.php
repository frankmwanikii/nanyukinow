<?php

namespace Tests\Feature;

use App\Mail\PlanUpgradeReviewedMail;
use App\Models\PlanUpgrade;
use App\Models\User;
use App\Support\Membership;
use App\Support\PaymentMethods;
use App\Support\PaymentReceipt;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentReceiptTest extends TestCase
{
    use RefreshDatabase;

    public function test_approved_payment_builds_pdf_receipt_with_branding(): void
    {
        $user = User::factory()->create([
            'name' => 'Amina Njeri',
            'email' => 'amina@example.com',
        ]);

        $upgrade = PlanUpgrade::query()->create([
            'user_id' => $user->id,
            'from_plan' => Membership::FREE,
            'to_plan' => Membership::PREMIUM,
            'amount' => 5500,
            'currency' => 'KES',
            'billing_period' => 'month',
            'status' => PlanUpgrade::STATUS_APPROVED,
            'payment_method' => PaymentMethods::MPESA,
            'payment_reference' => 'QK7X9M2ABC',
            'reviewed_at' => now(),
        ]);

        $data = PaymentReceipt::data($upgrade);
        $pdf = PaymentReceipt::pdf($upgrade);

        $this->assertSame('Premium', $data['planLabel']);
        $this->assertSame('Monthly', $data['periodLabel']);
        $this->assertSame('5,500', $data['amountFormatted']);
        $this->assertSame('KES', $data['currency']);
        $this->assertSame('M-Pesa', $data['paymentMethod']);
        $this->assertSame('QK7X9M2ABC', $data['paymentReference']);
        $this->assertSame('Amina Njeri', $data['memberName']);
        $this->assertStringStartsWith('NN-', $data['receiptNumber']);
        $this->assertStringStartsWith('%PDF', $pdf);
        $this->assertGreaterThan(1000, strlen($pdf));
        $this->assertStringEndsWith('.pdf', PaymentReceipt::filename($upgrade));
    }

    public function test_approved_mail_attaches_pdf_receipt_and_rejected_mail_does_not(): void
    {
        $user = User::factory()->create([
            'name' => 'Receipt Member',
            'email' => 'receipt@example.com',
        ]);

        $approved = PlanUpgrade::query()->create([
            'user_id' => $user->id,
            'from_plan' => Membership::FREE,
            'to_plan' => Membership::STANDARD,
            'amount' => 2500,
            'currency' => 'KES',
            'billing_period' => 'year',
            'status' => PlanUpgrade::STATUS_APPROVED,
            'payment_method' => PaymentMethods::PAYPAL,
            'payment_reference' => 'PAYPAL-REF-9',
            'reviewed_at' => now(),
        ]);

        $rejected = PlanUpgrade::query()->create([
            'user_id' => $user->id,
            'from_plan' => Membership::FREE,
            'to_plan' => Membership::PREMIUM,
            'amount' => 5500,
            'currency' => 'KES',
            'billing_period' => 'month',
            'status' => PlanUpgrade::STATUS_REJECTED,
            'payment_method' => PaymentMethods::MPESA,
            'payment_reference' => 'BADREF',
            'admin_notes' => 'Could not verify.',
            'reviewed_at' => now(),
        ]);

        $approvedMail = new PlanUpgradeReviewedMail($approved, $user->name);
        $rejectedMail = new PlanUpgradeReviewedMail($rejected, $user->name);

        $this->assertCount(1, $approvedMail->attachments());
        $this->assertSame(
            PaymentReceipt::filename($approved),
            $approvedMail->attachments()[0]->as,
        );
        $this->assertCount(0, $rejectedMail->attachments());
    }
}
