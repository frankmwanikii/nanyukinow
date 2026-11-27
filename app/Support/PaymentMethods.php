<?php

namespace App\Support;

use App\Models\SiteSetting;

class PaymentMethods
{
    public const MPESA = 'mpesa';

    public const INTASEND = 'intasend';

    public const PAYPAL = 'paypal';

    public const PAYSTACK = 'paystack';

    /**
     * @return list<string>
     */
    public static function keys(): array
    {
        return [self::MPESA, self::INTASEND, self::PAYPAL, self::PAYSTACK];
    }

    /**
     * Live checkout methods members can start from the upgrade modal.
     *
     * @return list<string>
     */
    public static function liveKeys(): array
    {
        return [self::MPESA, self::PAYPAL, self::PAYSTACK];
    }

    /**
     * Methods shown to members at checkout.
     * Admin enables the combination via Settings → Payment gateways.
     *
     * @return list<array{value: string, label: string, short: string, description: string}>
     */
    public static function memberOptions(): array
    {
        $enabled = self::enabledCheckoutKeys();

        return array_values(array_filter(
            self::options(),
            fn (array $option): bool => in_array($option['value'], $enabled, true),
        ));
    }

    /**
     * @return list<string>
     */
    public static function enabledCheckoutKeys(): array
    {
        $raw = trim((string) SiteSetting::getValue(
            'enabled_checkout_methods',
            implode(',', self::liveKeys()),
        ));

        $keys = array_values(array_filter(array_map(
            static fn (string $key): string => strtolower(trim($key)),
            $raw === '' ? [] : explode(',', $raw),
        )));

        $allowed = array_values(array_intersect($keys, self::liveKeys()));

        return $allowed !== [] ? $allowed : [self::MPESA];
    }

    /**
     * @return list<array{value: string, label: string, short: string, description: string}>
     */
    public static function options(): array
    {
        return [
            [
                'value' => self::MPESA,
                'label' => 'M-Pesa',
                'short' => 'M-Pesa',
                'description' => 'Paybill / Till — instant mobile money',
            ],
            [
                'value' => self::INTASEND,
                'label' => 'IntaSend',
                'short' => 'IntaSend',
                'description' => 'Card & mobile money via IntaSend',
            ],
            [
                'value' => self::PAYPAL,
                'label' => 'PayPal',
                'short' => 'PayPal',
                'description' => 'International cards & PayPal balance',
            ],
            [
                'value' => self::PAYSTACK,
                'label' => 'Paystack',
                'short' => 'Paystack',
                'description' => 'Cards, bank, USSD, and mobile money',
            ],
        ];
    }
}
