<x-mail.branded
    :app-name="$appName"
    :app-url="$appUrl"
    :logo-url="$logoUrl"
    :contact-email="$contactEmail"
    :contact-phone="$contactPhone"
    headline="Reply about your inquiry"
    title="Reply about your inquiry"
    :disclaimer="'This reply was sent through '.$appName.' about a listing inquiry. '.$appName.' is not a party to your exchange. Never share passwords or payment PINs. If you need help,'"
>
    <p style="margin:0 0 20px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.55;color:#1c1712;">
        Hi {{ $guestName }}, <strong>{{ $ownerName }}</strong> replied about <strong>{{ $listingTitle }}</strong>.
    </p>

    <p style="margin:0 0 8px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#6b7758;font-weight:700;">
        Message
    </p>
    <div class="message-copy" style="margin:0 0 24px 0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.65;color:#1c1712;">{!! $messageBody !!}</div>

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr>
            <td class="cta-cell" valign="middle" style="padding:0 10px 0 0;">
                <a class="cta" href="mailto:{{ $ownerEmail }}?subject={{ rawurlencode('Re: '.$listingTitle) }}" style="display:inline-block;padding:14px 28px;background-color:#3d4430;color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;font-weight:700;line-height:1.2;border-radius:999px;white-space:nowrap;">
                    Reply to {{ $ownerName }}
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
        Tip: you can also hit Reply in your email app. Responses go straight to {{ $ownerName }}.
    </p>
</x-mail.branded>
