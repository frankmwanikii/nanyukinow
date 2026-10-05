<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="x-apple-disable-message-reformatting">
    <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
    <title>Reset your password — {{ $appName }}</title>
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
        .break-all {
            word-break: break-all;
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
        }
    </style>
</head>
<body style="margin:0;padding:0;width:100%;background-color:#1c1712;color:#1c1712;">
    <div role="article" aria-roledescription="email" lang="en" style="width:100%;margin:0;padding:0;background-color:#1c1712;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;background-color:#1c1712;">
            <tr>
                <td style="padding:0;margin:0;">

                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;">
                        <tr>
                            <td style="height:6px;line-height:6px;font-size:0;background-color:#f2b82e;">&nbsp;</td>
                        </tr>
                    </table>

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
                                    Reset your password
                                </h1>
                            </td>
                        </tr>
                    </table>

                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;background-color:#ebe4d6;">
                        <tr>
                            <td class="pad-x pad-y" style="padding:36px 32px;">

                                <p style="margin:0 0 20px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.55;color:#1c1712;">
                                    Hi {{ $greetingName }}, we received a request to reset the password for your {{ $appName }} account.
                                </p>

                                <p style="margin:0 0 8px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#6b7758;font-weight:700;">
                                    Account email
                                </p>
                                <p style="margin:0 0 24px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.55;color:#1c1712;">
                                    <a href="mailto:{{ $userEmail }}" style="color:#3d4430;text-decoration:underline;font-weight:700;">{{ $userEmail }}</a>
                                </p>

                                <p style="margin:0 0 24px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.65;color:#4b533a;">
                                    Click the button below to choose a new password. This link expires in <strong>{{ $expiresMinutes }} minutes</strong>.
                                </p>

                                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                                    <tr>
                                        <td style="padding:0;">
                                            <a class="cta" href="{{ $resetUrl }}" style="display:inline-block;padding:14px 28px;background-color:#f2b82e;color:#1c1712;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;font-weight:700;line-height:1.2;border-radius:999px;white-space:nowrap;">
                                                Reset password
                                            </a>
                                        </td>
                                    </tr>
                                </table>

                                <p style="margin:28px 0 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:#4b533a;">
                                    If the button doesn’t work, copy and paste this link into your browser:
                                </p>
                                <p class="break-all" style="margin:10px 0 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:13px;line-height:1.55;color:#3d4430;">
                                    <a href="{{ $resetUrl }}" style="color:#3d4430;text-decoration:underline;">{{ $resetUrl }}</a>
                                </p>

                                <p style="margin:28px 0 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:#4b533a;">
                                    If you didn’t ask for a reset, you can ignore this email. Your password will stay the same.
                                    Already sorted? <a href="{{ $loginUrl }}" style="color:#3d4430;text-decoration:underline;font-weight:700;">Sign in</a>
                                </p>
                            </td>
                        </tr>
                    </table>

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
                                    This email was sent because a password reset was requested for your {{ $appName }} account.
                                    Never share this link, your password, or payment PINs with anyone.
                                    If you did not request a reset, contact us at
                                    <a href="mailto:{{ $contactEmail }}" style="color:#a8b393;text-decoration:underline;">{{ $contactEmail }}</a>.
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
