<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Receipt {{ $receiptNumber }}</title>
    <style>
        @page {
            margin: 36px 40px;
        }

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            color: #1c1712;
            font-family: Helvetica, Arial, sans-serif;
            font-size: 12px;
            line-height: 1.45;
            background: #ffffff;
        }

        .top {
            width: 100%;
            border-bottom: 1.5px solid #e8e2d6;
            padding-bottom: 18px;
            margin-bottom: 28px;
        }

        .top td {
            vertical-align: top;
        }

        .logo {
            height: 42px;
            width: auto;
        }

        .brand-fallback {
            font-size: 20px;
            font-weight: 700;
            letter-spacing: -0.02em;
            color: #1c1712;
        }

        .receipt-kicker {
            margin: 0 0 4px 0;
            font-size: 10px;
            letter-spacing: 0.16em;
            text-transform: uppercase;
            color: #6b7758;
            font-weight: 700;
            text-align: right;
        }

        .receipt-number {
            margin: 0;
            font-size: 16px;
            font-weight: 700;
            text-align: right;
            color: #1c1712;
        }

        .paid-label {
            margin: 0 0 6px 0;
            font-size: 10px;
            letter-spacing: 0.16em;
            text-transform: uppercase;
            color: #6b7758;
            font-weight: 700;
        }

        .amount {
            margin: 0 0 6px 0;
            font-size: 34px;
            line-height: 1.1;
            font-weight: 700;
            letter-spacing: -0.03em;
            color: #1c1712;
        }

        .paid-meta {
            margin: 0 0 28px 0;
            color: #4b533a;
            font-size: 12px;
        }

        .status {
            display: inline-block;
            padding: 3px 8px;
            border: 1px solid #c8d6a5;
            background: #f4f7ea;
            color: #3d4430;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
        }

        .meta {
            width: 100%;
            margin-bottom: 28px;
        }

        .meta td {
            width: 50%;
            vertical-align: top;
        }

        .meta-label {
            margin: 0 0 6px 0;
            font-size: 10px;
            letter-spacing: 0.14em;
            text-transform: uppercase;
            color: #6b7758;
            font-weight: 700;
        }

        .meta-value {
            margin: 0;
            font-size: 13px;
            font-weight: 700;
            color: #1c1712;
        }

        .meta-sub {
            margin: 3px 0 0 0;
            color: #4b533a;
            font-size: 12px;
        }

        .items {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
        }

        .items th {
            padding: 10px 0;
            border-bottom: 1.5px solid #1c1712;
            font-size: 10px;
            letter-spacing: 0.14em;
            text-transform: uppercase;
            color: #6b7758;
            text-align: left;
            font-weight: 700;
        }

        .items th.amount-col,
        .items td.amount-col {
            text-align: right;
        }

        .items td {
            padding: 14px 0;
            border-bottom: 1px solid #e8e2d6;
            vertical-align: top;
        }

        .item-title {
            margin: 0;
            font-size: 13px;
            font-weight: 700;
            color: #1c1712;
        }

        .item-sub {
            margin: 4px 0 0 0;
            color: #4b533a;
            font-size: 11px;
        }

        .totals {
            width: 100%;
            margin-top: 8px;
            margin-bottom: 28px;
        }

        .totals td {
            padding: 6px 0;
        }

        .totals .label {
            text-align: right;
            color: #4b533a;
            padding-right: 18px;
            width: 75%;
        }

        .totals .value {
            text-align: right;
            font-weight: 700;
            color: #1c1712;
            width: 25%;
        }

        .totals .grand .label,
        .totals .grand .value {
            padding-top: 10px;
            border-top: 1.5px solid #1c1712;
            font-size: 14px;
            color: #1c1712;
        }

        .payment-box {
            width: 100%;
            border: 1px solid #e8e2d6;
            background: #faf7f1;
            padding: 14px 16px;
            margin-bottom: 36px;
        }

        .payment-box table {
            width: 100%;
            border-collapse: collapse;
        }

        .payment-box td {
            vertical-align: top;
            width: 50%;
        }

        .footer {
            border-top: 1px solid #e8e2d6;
            padding-top: 16px;
            color: #4b533a;
            font-size: 11px;
        }

        .footer strong {
            color: #1c1712;
        }

        .thanks {
            margin: 0 0 8px 0;
            font-size: 13px;
            font-weight: 700;
            color: #1c1712;
        }
    </style>
</head>
<body>
    <table class="top" cellpadding="0" cellspacing="0">
        <tr>
            <td style="width: 55%;">
                @if ($logoPath)
                    <img class="logo" src="{{ $logoPath }}" alt="{{ $appName }}">
                @else
                    <div class="brand-fallback">{{ $appName }}</div>
                @endif
            </td>
            <td style="width: 45%;">
                <p class="receipt-kicker">Receipt</p>
                <p class="receipt-number">{{ $receiptNumber }}</p>
            </td>
        </tr>
    </table>

    <p class="paid-label">Amount paid</p>
    <p class="amount">{{ $currency }} {{ $amountFormatted }}</p>
    <p class="paid-meta">
        Paid on {{ $paidAt }}
        &nbsp;&nbsp;<span class="status">Paid</span>
    </p>

    <table class="meta" cellpadding="0" cellspacing="0">
        <tr>
            <td>
                <p class="meta-label">Billed to</p>
                <p class="meta-value">{{ $memberName }}</p>
                @if ($memberEmail !== '')
                    <p class="meta-sub">{{ $memberEmail }}</p>
                @endif
            </td>
            <td>
                <p class="meta-label">From</p>
                <p class="meta-value">{{ $appName }}</p>
                <p class="meta-sub">{{ $contactEmail }}</p>
                <p class="meta-sub">{{ $contactPhone }}</p>
            </td>
        </tr>
    </table>

    <table class="items" cellpadding="0" cellspacing="0">
        <thead>
            <tr>
                <th style="width: 70%;">Description</th>
                <th class="amount-col" style="width: 30%;">Amount</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>
                    <p class="item-title">{{ $description }}</p>
                    <p class="item-sub">Plan activation on {{ $appName }}</p>
                </td>
                <td class="amount-col">
                    <strong>{{ $currency }} {{ $amountFormatted }}</strong>
                </td>
            </tr>
        </tbody>
    </table>

    <table class="totals" cellpadding="0" cellspacing="0">
        <tr>
            <td class="label">Subtotal</td>
            <td class="value">{{ $currency }} {{ $amountFormatted }}</td>
        </tr>
        <tr>
            <td class="label">Tax</td>
            <td class="value">{{ $currency }} 0</td>
        </tr>
        <tr class="grand">
            <td class="label">Total paid</td>
            <td class="value">{{ $currency }} {{ $amountFormatted }}</td>
        </tr>
    </table>

    <div class="payment-box">
        <table cellpadding="0" cellspacing="0">
            <tr>
                <td>
                    <p class="meta-label">Payment method</p>
                    <p class="meta-value">{{ $paymentMethod }}</p>
                </td>
                <td>
                    <p class="meta-label">Payment reference</p>
                    <p class="meta-value">{{ $paymentReference ?: 'Confirmed' }}</p>
                </td>
            </tr>
        </table>
    </div>

    <div class="footer">
        <p class="thanks">Thank you for supporting local discovery in Nanyuki.</p>
        <p style="margin:0;">
            <strong>{{ $appName }}</strong>
            · {{ $appUrl }}
            · {{ $contactEmail }}
            · {{ $contactPhone }}
        </p>
        <p style="margin:8px 0 0 0;">
            Keep this receipt for your records. Questions about this payment?
            Reply to this email or write to {{ $contactEmail }}.
        </p>
    </div>
</body>
</html>
