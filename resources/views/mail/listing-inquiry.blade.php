<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="x-apple-disable-message-reformatting">
    <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
    <title>New inquiry — {{ $appName }}</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    <style>
        html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: 100% !important;
        }
        * {
            -ms-text-size-adjust: 100%;
            -webkit-text-size-adjust: 100%;
        }
        table, td {
            mso-table-lspace: 0pt !important;
            mso-table-rspace: 0pt !important;
        }
        table {
            border-spacing: 0 !important;
            border-collapse: collapse !important;
        }
        img {
            -ms-interpolation-mode: bicubic;
            border: 0;
            outline: none;
            text-decoration: none;
            display: block;
            max-width: 100%;
            height: auto;
        }
        a { text-decoration: none; }
        .message-copy {
            word-break: break-word;
        }
        .message-copy p {
            margin: 0 0 12px 0;
        }
        .message-copy p:last-child {
            margin-bottom: 0;
        }
        .message-copy h3 {
            margin: 0 0 10px 0;
            font-size: 18px;
            line-height: 1.3;
            font-weight: 700;
            color: #1c1712;
        }
        .message-copy ul,
        .message-copy ol {
            margin: 0 0 12px 0;
            padding-left: 22px;
        }
        .message-copy li {
            margin: 0 0 6px 0;
        }
        .message-copy a {
            color: #3d4430;
            text-decoration: underline;
        }
        .message-copy strong,
        .message-copy b {
            font-weight: 700;
        }
        @media only screen and (max-width: 620px) {
            .pad-x {
                padding-left: 20px !important;
                padding-right: 20px !important;
            }
            .pad-y {
                padding-top: 24px !important;
                padding-bottom: 24px !important;
            }
            .headline {
                font-size: 26px !important;
                line-height: 1.25 !important;
            }
            .logo-img {
                height: 40px !important;
                width: auto !important;
            }
            .cta {
                display: block !important;
                width: 100% !important;
                text-align: center !important;
                box-sizing: border-box !important;
            }
            .cta-cell {
                display: block !important;
                width: 100% !important;
                padding-right: 0 !important;
                padding-bottom: 10px !important;
            }
        }
    </style>
</head>
<body style="margin:0;padding:0;width:100%;background-color:#1c1712;color:#1c1712;">
    <div role="article" aria-roledescription="email" lang="en" style="width:100%;margin:0;padding:0;background-color:#1c1712;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;background-color:#1c1712;">
            <tr>
                <td style="padding:0;margin:0;">

                    {{-- Accent --}}
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;">
                        <tr>
                            <td style="height:6px;line-height:6px;font-size:0;background-color:#f2b82e;">&nbsp;</td>
                        </tr>
                    </table>

                    {{-- Header with logo --}}
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;background-color:#3d4430;">
                        <tr>
                            <td class="pad-x" style="padding:28px 32px 12px 32px;">
                                <a href="{{ $appUrl }}" style="display:inline-block;">
                                    <img
                                        class="logo-img"
                                        src="{{ $logoUrl }}"
                                        alt="{{ $appName }}"
                                        width="168"
                                        height="94"
                                        style="display:block;height:48px;width:auto;border:0;outline:none;"
                                    >
                                </a>
                            </td>
                        </tr>
                        <tr>
                            <td class="pad-x" style="padding:8px 32px 28px 32px;">
                                <h1 class="headline" style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:32px;line-height:1.2;font-weight:700;color:#ffffff;">
                                    New inquiry
                                </h1>
                            </td>
                        </tr>
                    </table>

                    {{-- Body --}}
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;background-color:#ebe4d6;">
                        <tr>
                            <td class="pad-x pad-y" style="padding:36px 32px;">

                                <p style="margin:0 0 24px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.55;color:#1c1712;">
                                    <strong>{{ $senderName }}</strong> reached out about <strong>{{ $listing->title }}</strong>.
                                </p>

                                <p style="margin:0 0 8px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#6b7758;font-weight:700;">
                                    Message
                                </p>
                                <div class="message-copy" style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.65;color:#1c1712;">{!! $messageBody !!}</div>

                                @if ($attachmentCount)
                                    <p style="margin:16px 0 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;line-height:1.5;color:#4b533a;">
                                        <strong style="color:#1c1712;">Attachments:</strong>
                                        {{ $attachmentCount }} {{ $attachmentCount === 1 ? 'file' : 'files' }} attached to this email.
                                    </p>
                                @endif

                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;margin-top:28px;">
                                    <tr>
                                        <td style="height:1px;line-height:1px;font-size:0;background-color:#c9d0bb;">&nbsp;</td>
                                    </tr>
                                </table>

                                <p style="margin:24px 0 8px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#6b7758;font-weight:700;">
                                    From
                                </p>
                                <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.55;color:#1c1712;">
                                    <strong>{{ $senderName }}</strong><br>
                                    <a href="mailto:{{ $senderEmail }}" style="color:#3d4430;text-decoration:underline;">{{ $senderEmail }}</a>
                                    @if ($senderPhone)
                                        <br>
                                        <a href="tel:{{ preg_replace('/\s+/', '', $senderPhone) }}" style="color:#3d4430;text-decoration:underline;">{{ $senderPhone }}</a>
                                    @endif
                                </p>

                                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-top:28px;">
                                    <tr>
                                        <td class="cta-cell" valign="middle" style="padding:0 10px 0 0;">
                                            <a class="cta" href="mailto:{{ $senderEmail }}?subject={{ rawurlencode('Re: Inquiry about '.$listing->title) }}" style="display:inline-block;padding:14px 28px;background-color:#3d4430;color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;font-weight:700;line-height:1.2;border-radius:999px;white-space:nowrap;">
                                                Reply to {{ $senderName }}
                                            </a>
                                        </td>
                                        <td class="cta-cell" valign="middle" style="padding:0;">
                                            <a class="cta" href="{{ $listingUrl }}" style="display:inline-block;padding:14px 28px;background-color:#f2b82e;color:#1c1712;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;font-weight:700;line-height:1.2;border-radius:999px;white-space:nowrap;">
                                                View listing
                                            </a>
                                        </td>
                                    </tr>
                                </table>

                                <p style="margin:28px 0 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:#4b533a;">
                                    Tip: you can also hit Reply in your email app — responses go straight to {{ $senderName }}.
                                </p>
                            </td>
                        </tr>
                    </table>

                    {{-- Footer --}}
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;background-color:#161911;">
                        <tr>
                            <td class="pad-x" style="padding:28px 32px 12px 32px;">
                                <a href="{{ $appUrl }}" style="display:inline-block;">
                                    <img
                                        src="{{ $logoUrl }}"
                                        alt="{{ $appName }}"
                                        width="120"
                                        style="display:block;height:34px;width:auto;border:0;opacity:0.95;"
                                    >
                                </a>
                            </td>
                        </tr>
                        <tr>
                            <td class="pad-x" style="padding:8px 32px 0 32px;">
                                <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:13px;line-height:1.6;color:#a8b393;">
                                    <strong style="color:#f2b82e;">{{ $appName }}</strong><br>
                                    Website:
                                    <a href="{{ $appUrl }}" style="color:#ffffff;text-decoration:underline;">{{ parse_url($appUrl, PHP_URL_HOST) ?: $appUrl }}</a><br>
                                    Email:
                                    <a href="mailto:{{ $contactEmail }}" style="color:#ffffff;text-decoration:underline;">{{ $contactEmail }}</a><br>
                                    Phone:
                                    <a href="tel:{{ preg_replace('/\s+/', '', $contactPhone) }}" style="color:#ffffff;text-decoration:underline;">{{ $contactPhone }}</a>
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <td class="pad-x" style="padding:20px 32px 32px 32px;">
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;">
                                    <tr>
                                        <td style="height:1px;line-height:1px;font-size:0;background-color:#323728;">&nbsp;</td>
                                    </tr>
                                </table>
                                <p style="margin:16px 0 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;line-height:1.6;color:#889571;">
                                    <strong style="color:#a8b393;">Disclaimer:</strong>
                                    This inquiry was submitted through {{ $appName }} for your listing.
                                    Reply directly to the sender to continue the conversation.
                                    {{ $appName }} is not a party to your exchange and does not guarantee a booking, payment, or the accuracy of visitor details.
                                    Never share passwords or payment PINs in reply to unsolicited requests.
                                </p>
                                <p style="margin:14px 0 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:11px;line-height:1.5;color:#6b7758;">
                                    © {{ date('Y') }} {{ $appName }}. Discover Nanyuki — eat, stay, explore.
                                </p>
                            </td>
                        </tr>
                    </table>

                </td>
            </tr>
        </table>
    </div>
</body>
</html>
