<?php

namespace App\Support;

use App\Models\PlanUpgrade;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Str;

class PaymentReceipt
{
    /**
     * @return array{
     *     receiptNumber: string,
     *     paidAt: string,
     *     appName: string,
     *     appUrl: string,
     *     logoPath: string|null,
     *     contactEmail: string,
     *     contactPhone: string,
     *     memberName: string,
     *     memberEmail: string,
     *     planLabel: string,
     *     periodLabel: string|null,
     *     description: string,
     *     amountFormatted: string,
     *     currency: string,
     *     paymentMethod: string,
     *     paymentReference: string|null
     * }
     */
    public static function data(PlanUpgrade $upgrade): array
    {
        $brand = MailBranding::context();
        $upgrade->loadMissing('user');

        $periodLabel = match ($upgrade->billing_period) {
            'month' => 'Monthly',
            'year' => 'Yearly',
            'one_time' => 'One-time',
            default => null,
        };

        $planLabel = Membership::label($upgrade->to_plan);
        $currency = strtoupper((string) ($upgrade->currency ?: 'KES'));
        $amount = max(0, (int) $upgrade->amount);
        $paidAt = ($upgrade->reviewed_at ?? $upgrade->created_at ?? now())
            ->timezone(config('app.timezone'))
            ->format('j M Y · H:i');

        $logoPath = null;
        foreach (['logo-on-light.png', 'logo.png'] as $filename) {
            $candidate = public_path('images/'.$filename);
            if (is_file($candidate)) {
                $logoPath = $candidate;
                break;
            }
        }

        return [
            'receiptNumber' => self::number($upgrade),
            'paidAt' => $paidAt,
            'appName' => $brand['appName'],
            'appUrl' => $brand['appUrl'],
            'logoPath' => $logoPath,
            'contactEmail' => $brand['contactEmail'],
            'contactPhone' => $brand['contactPhone'],
            'memberName' => (string) ($upgrade->user?->name ?: 'Member'),
            'memberEmail' => (string) ($upgrade->user?->email ?: ''),
            'planLabel' => $planLabel,
            'periodLabel' => $periodLabel,
            'description' => $periodLabel
                ? "{$planLabel} membership ({$periodLabel})"
                : "{$planLabel} membership",
            'amountFormatted' => number_format($amount),
            'currency' => $currency,
            'paymentMethod' => self::paymentMethodLabel($upgrade->payment_method),
            'paymentReference' => self::memberReference($upgrade),
        ];
    }

    public static function number(PlanUpgrade $upgrade): string
    {
        $date = ($upgrade->reviewed_at ?? $upgrade->created_at ?? now())
            ->timezone(config('app.timezone'))
            ->format('Ymd');

        return 'NN-'.$date.'-'.str_pad((string) $upgrade->id, 5, '0', STR_PAD_LEFT);
    }

    public static function filename(PlanUpgrade $upgrade): string
    {
        return 'nanyuki-now-receipt-'.self::number($upgrade).'.pdf';
    }

    public static function pdf(PlanUpgrade $upgrade): string
    {
        return Pdf::loadView('receipts.payment', self::data($upgrade))
            ->setPaper('a4')
            ->setOption([
                // Core fonts keep the attachment small enough for SMTP.
                'defaultFont' => 'Helvetica',
                'isFontSubsettingEnabled' => true,
                'dpi' => 96,
            ])
            ->output();
    }

    /**
     * Build the PDF when possible. Returns null if rendering fails so mail can still send.
     */
    public static function pdfOrNull(PlanUpgrade $upgrade): ?string
    {
        try {
            $pdf = self::pdf($upgrade);

            return is_string($pdf) && str_starts_with($pdf, '%PDF') ? $pdf : null;
        } catch (\Throwable $e) {
            report($e);

            return null;
        }
    }

    private static function paymentMethodLabel(?string $method): string
    {
        $method = strtolower(trim((string) $method));

        foreach (PaymentMethods::options() as $option) {
            if ($option['value'] === $method) {
                return $option['label'];
            }
        }

        return $method !== '' ? Str::headline($method) : 'Card or mobile money';
    }

    private static function memberReference(PlanUpgrade $upgrade): ?string
    {
        $reference = trim((string) $upgrade->payment_reference);

        if ($reference === '') {
            return null;
        }

        if (
            $upgrade->payment_method === PaymentMethods::MPESA
            && PalplussFulfillment::isPalplussReference($reference)
        ) {
            return null;
        }

        return $reference;
    }
}
