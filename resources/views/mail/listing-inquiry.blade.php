<x-mail.branded
    :app-name="$appName"
    :app-url="$appUrl"
    :logo-url="$logoUrl"
    :contact-email="$contactEmail"
    :contact-phone="$contactPhone"
    headline="New inquiry"
    title="New inquiry"
    :disclaimer="'This inquiry was submitted through '.$appName.' for your listing. Reply directly to the sender to continue the conversation. '.$appName.' is not a party to your exchange and does not guarantee a booking, payment, or the accuracy of visitor details. Never share passwords or payment PINs in reply to unsolicited requests. If you need help,'"
>
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
        Tip: you can also hit Reply in your email app. Responses go straight to {{ $senderName }}.
    </p>
</x-mail.branded>
