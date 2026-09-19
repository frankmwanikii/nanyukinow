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
