<?php

namespace App\Support;

class PaymentMethods
{
    public const MPESA = 'mpesa';

    public const INTASEND = 'intasend';

    public const PAYPAL = 'paypal';

    /**
     * @return list<string>
     */
    public static function keys(): array
    {
        return [self::MPESA, self::INTASEND, self::PAYPAL];
    }

    /**
     * Methods shown to members at checkout (admin may still use IntaSend behind the scenes).
     *
     * @return list<array{value: string, label: string, short: string, description: string}>
     */
    public static function memberOptions(): array
    {
        return array_values(array_filter(
            self::options(),
            fn (array $option): bool => in_array($option['value'], [self::MPESA, self::PAYPAL], true),
        ));
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
        ];
    }
}
