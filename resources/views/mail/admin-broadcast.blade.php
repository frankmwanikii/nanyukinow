<x-mail.branded
    :app-name="$appName"
    :app-url="$appUrl"
    :logo-url="$logoUrl"
    :contact-email="$contactEmail"
    :contact-phone="$contactPhone"
    :headline="$subjectLine"
    :title="$subjectLine"
    :disclaimer="'This message was sent by '.$appName.' to members on the platform. Never share passwords or payment PINs with anyone. If you have questions,'"
>
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
            <td style="padding:0;">
                <a class="cta" href="{{ $exploreUrl }}" style="display:inline-block;padding:14px 28px;background-color:#f2b82e;color:#1c1712;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;font-weight:700;line-height:1.2;border-radius:999px;white-space:nowrap;">
                    Explore Nanyuki
                </a>
            </td>
        </tr>
    </table>

    <p style="margin:28px 0 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:#4b533a;">
        If the button doesn’t work, copy and paste this link into your browser:
    </p>
    <p class="break-all" style="margin:10px 0 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:13px;line-height:1.55;color:#3d4430;">
        <a href="{{ $exploreUrl }}" style="color:#3d4430;text-decoration:underline;">{{ $exploreUrl }}</a>
    </p>
</x-mail.branded>
