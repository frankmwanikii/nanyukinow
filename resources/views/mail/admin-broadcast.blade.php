<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $subjectLine }} — {{ $appName }}</title>
    <style>
        html, body { margin: 0 !important; padding: 0 !important; width: 100% !important; }
        img { border: 0; outline: none; text-decoration: none; display: block; max-width: 100%; height: auto; }
        a { text-decoration: none; }
        @media only screen and (max-width: 620px) {
            .pad-x { padding-left: 20px !important; padding-right: 20px !important; }
            .headline { font-size: 26px !important; line-height: 1.25 !important; }
        }
    </style>
</head>
<body style="margin:0;padding:0;width:100%;background-color:#1c1712;color:#1c1712;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;background-color:#1c1712;">
        <tr>
            <td style="height:6px;line-height:6px;font-size:0;background-color:#f2b82e;">&nbsp;</td>
        </tr>
        <tr>
            <td style="padding:28px 32px 12px 32px;background-color:#3d4430;" class="pad-x">
                <a href="{{ $appUrl }}">
                    <img src="{{ $logoUrl }}" alt="{{ $appName }}" width="168" style="height:48px;width:auto;">
                </a>
            </td>
        </tr>
        <tr>
            <td style="padding:8px 32px 28px 32px;background-color:#3d4430;" class="pad-x">
                <h1 class="headline" style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.2;font-weight:700;color:#ffffff;">
                    {{ $subjectLine }}
                </h1>
            </td>
        </tr>
        <tr>
            <td style="padding:36px 32px;background-color:#ebe4d6;" class="pad-x">
                <p style="margin:0 0 18px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.55;color:#1c1712;">
                    {{ $greeting }}
                </p>
                @foreach ($bodyParagraphs as $paragraph)
                    @if (trim((string) $paragraph) !== '')
                        <p style="margin:0 0 16px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.65;color:#4b533a;">
                            {{ $paragraph }}
                        </p>
                    @else
                        <div style="height:10px;line-height:10px;font-size:0;">&nbsp;</div>
                    @endif
                @endforeach
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:8px;border-collapse:collapse;">
                    <tr>
                        <td>
                            <a href="{{ $exploreUrl }}" style="display:inline-block;padding:14px 28px;background-color:#f2b82e;color:#1c1712;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;font-weight:700;line-height:1.2;border-radius:999px;">
                                Explore Nanyuki
                            </a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td style="padding:28px 32px;background-color:#161911;" class="pad-x">
                <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:13px;line-height:1.6;color:#a8b393;">
                    <strong style="color:#f2b82e;">{{ $appName }}</strong><br>
                    <a href="mailto:{{ $contactEmail }}" style="color:#ffffff;text-decoration:underline;">{{ $contactEmail }}</a>
                    ·
                    <a href="tel:{{ preg_replace('/\s+/', '', $contactPhone) }}" style="color:#ffffff;text-decoration:underline;">{{ $contactPhone }}</a>
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
