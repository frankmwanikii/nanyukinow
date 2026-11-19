<?php

namespace App\Support;

class TicketOptions
{
    /**
     * @return list<array{name: string, amount: int|null}>
     */
    public static function normalize(mixed $value): array
    {
        if (! is_array($value)) {
            return [];
        }

        $rows = [];
        foreach ($value as $row) {
            if (! is_array($row)) {
                continue;
            }

            $name = trim((string) ($row['name'] ?? ''));
            $amount = self::coerceAmount($row['amount'] ?? null);

            $rows[] = [
                'name' => $name,
                'amount' => $amount,
            ];
        }

        return $rows;
    }

    /**
     * Drop blank rows. Keep rows that have a name and/or amount.
     *
     * @return list<array{name: string, amount: int|null}>
     */
    public static function compact(mixed $value): array
    {
        return array_values(array_filter(
            self::normalize($value),
            static fn (array $row) => $row['name'] !== '' || $row['amount'] !== null,
        ));
    }

    /**
     * @param  list<array{name: string, amount: int|null}>  $options
     */
    public static function summary(array $options): ?string
    {
        $amounts = [];
        foreach ($options as $row) {
            if ($row['amount'] !== null) {
                $amounts[] = (int) $row['amount'];
            }
        }

        if ($amounts === []) {
            return $options === [] ? null : 'See tickets';
        }

        $min = min($amounts);

        if (count($amounts) === 1) {
            return self::formatAmount($min);
        }

        if ($min === 0) {
            return 'From free';
        }

        return 'From '.self::formatAmount($min);
    }

    public static function formatAmount(int $amount): string
    {
        if ($amount === 0) {
            return 'Free';
        }

        return 'KES '.number_format($amount);
    }

    /**
     * Build form rows from stored options, falling back to legacy price fields.
     *
     * @return list<array{name: string, amount: int|null}>
     */
    public static function forForm(
        mixed $options,
        ?string $ticketPrice = null,
        ?string $earlyBirdPrice = null,
        ?string $gatePrice = null,
    ): array {
        $compact = self::compact($options);

        if ($compact !== []) {
            return $compact;
        }

        return self::fromLegacy($ticketPrice, $earlyBirdPrice, $gatePrice);
    }

    /**
     * @return list<array{name: string, amount: int|null}>
     */
    public static function fromLegacy(
        ?string $ticketPrice = null,
        ?string $earlyBirdPrice = null,
        ?string $gatePrice = null,
    ): array {
        $rows = [];

        $earlyAmount = self::parseAmount($earlyBirdPrice);
        if ($earlyBirdPrice !== null && trim($earlyBirdPrice) !== '') {
            $rows[] = [
                'name' => 'Early bird',
                'amount' => $earlyAmount,
            ];
        }

        $gateAmount = self::parseAmount($gatePrice);
        if ($gatePrice !== null && trim($gatePrice) !== '') {
            $rows[] = [
                'name' => 'Gate ticket',
                'amount' => $gateAmount,
            ];
        }

        if ($rows === [] && $ticketPrice !== null && trim($ticketPrice) !== '') {
            $rows[] = [
                'name' => 'General admission',
                'amount' => self::parseAmount($ticketPrice),
            ];
        }

        return self::compact($rows);
    }

    /**
     * Normalize ticket_options on a listing payload and sync legacy summary fields.
     *
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public static function applyToListingPayload(array $data): array
    {
        $options = self::compact($data['ticket_options'] ?? null);

        if ($options === []) {
            $options = self::fromLegacy(
                isset($data['ticket_price']) ? (string) $data['ticket_price'] : null,
                isset($data['early_bird_price']) ? (string) $data['early_bird_price'] : null,
                isset($data['gate_price']) ? (string) $data['gate_price'] : null,
            );
        }

        $data['ticket_options'] = $options === [] ? null : $options;
        $data['ticket_price'] = self::summary($options);
        $data['early_bird_price'] = null;
        $data['gate_price'] = null;

        return $data;
    }

    /**
     * Public listing payload rows with display labels.
     *
     * @return list<array{name: string, amount: int|null, priceLabel: string}>
     */
    public static function forPublic(mixed $options, ?string $ticketPrice = null, ?string $earlyBirdPrice = null, ?string $gatePrice = null): array
    {
        $rows = self::forForm($options, $ticketPrice, $earlyBirdPrice, $gatePrice);

        return array_map(static function (array $row) {
            $amount = $row['amount'];

            return [
                'name' => $row['name'] !== '' ? $row['name'] : 'Ticket',
                'amount' => $amount,
                'priceLabel' => $amount === null ? 'On request' : self::formatAmount($amount),
            ];
        }, $rows);
    }

    public static function parseAmount(?string $value): ?int
    {
        if ($value === null) {
            return null;
        }

        $value = trim($value);
        if ($value === '') {
            return null;
        }

        if (preg_match('/(\d[\d,]*)/', $value, $matches) !== 1) {
            return null;
        }

        return (int) str_replace(',', '', $matches[1]);
    }

    private static function coerceAmount(mixed $value): ?int
    {
        if ($value === null || $value === '') {
            return null;
        }

        if (is_int($value)) {
            return max(0, $value);
        }

        if (is_float($value)) {
            return max(0, (int) $value);
        }

        if (is_string($value)) {
            return self::parseAmount($value);
        }

        if (is_numeric($value)) {
            return max(0, (int) $value);
        }

        return null;
    }
}
