<x-mail.branded
    :app-name="$appName"
    :app-url="$appUrl"
    :logo-url="$logoUrl"
    :contact-email="$contactEmail"
    :contact-phone="$contactPhone"
    headline="Message on its way"
    title="Message confirmation"
    :disclaimer="'This email confirms a message you submitted through '.$appName.'. We pass your inquiry to the listing contact, but we do not guarantee a reply, response time, or the accuracy of listing information. If you did not send this message, you can ignore this email. Never share passwords or payment PINs in reply to unsolicited requests. If you need help,'"
>
    <p style="margin:0 0 24px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.55;color:#1c1712;">
        Hi {{ $senderName }}, we passed your note to <strong>{{ $listing->title }}</strong>.
    </p>

    <p style="margin:0 0 8px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#6b7758;font-weight:700;">
        Your message
    </p>
    <div class="message-copy" style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.65;color:#1c1712;">{!! $messageBody !!}</div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;margin-top:28px;">
        <tr>
            <td style="height:1px;line-height:1px;font-size:0;background-color:#c9d0bb;">&nbsp;</td>
        </tr>
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;margin-top:24px;">
        <tr>
            <td style="padding:0 0 10px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#6b7758;font-weight:700;">
                Sent as
            </td>
        </tr>
        <tr>
            <td style="padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.5;color:#1c1712;">
                <strong>{{ $senderName }}</strong><br>
                <a href="mailto:{{ $senderEmail }}" style="color:#3d4430;text-decoration:underline;">{{ $senderEmail }}</a>
                @if ($senderPhone)
                    <br>{{ $senderPhone }}
                @endif
            </td>
        </tr>
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;margin-top:28px;">
        <tr>
            <td style="padding:0;">
                <a class="cta" href="{{ $listingUrl }}" style="display:inline-block;padding:14px 28px;background-color:#f2b82e;color:#1c1712;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;font-weight:700;line-height:1.2;border-radius:999px;white-space:nowrap;">
                    View listing
                </a>
            </td>
        </tr>
    </table>

    <p style="margin:28px 0 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:#4b533a;">
        If they reply, it will come to this inbox. No further action needed from you.
    </p>

    <x-slot:after>
        @if (count($recommended))
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;background-color:#f4f5f1;">
                <tr>
                    <td class="pad-x" style="padding:32px 32px 8px 32px;">
                        <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#6b7758;font-weight:700;">
                            Recommended for you
                        </p>
                        <h2 style="margin:8px 0 0 0;font-family:Georgia,'Times New Roman',serif;font-size:24px;line-height:1.25;font-weight:700;color:#1c1712;">
                            More to discover nearby
                        </h2>
                    </td>
                </tr>
                <tr>
                    <td class="pad-x" style="padding:20px 32px 36px 32px;">
                        @foreach ($recommended as $item)
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;background-color:#ffffff;margin-bottom:14px;">
                                <tr>
                                    <td width="132" valign="top" style="width:132px;padding:0;">
                                        <a href="{{ $item['url'] }}" style="display:block;">
                                            @if ($item['image'])
                                                <img
                                                    src="{{ $item['image'] }}"
                                                    alt="{{ $item['title'] }}"
                                                    width="132"
                                                    height="104"
                                                    style="display:block;width:132px;height:104px;object-fit:cover;border:0;"
                                                >
                                            @else
                                                <div style="width:132px;height:104px;background-color:#c9d0bb;">&nbsp;</div>
                                            @endif
                                        </a>
                                    </td>
                                    <td valign="middle" style="padding:14px 16px;">
                                        <a href="{{ $item['url'] }}" style="display:block;color:#1c1712;">
                                            <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.35;font-weight:700;color:#1c1712;">
                                                {{ $item['title'] }}
                                            </p>
                                            @if ($item['location'])
                                                <p style="margin:6px 0 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:13px;line-height:1.4;color:#6b7758;">
                                                    {{ $item['location'] }}
                                                </p>
                                            @endif
                                            <p style="margin:10px 0 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:13px;font-weight:700;color:#3d4430;">
                                                View listing →
                                            </p>
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        @endforeach

                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;margin-top:8px;">
                            <tr>
                                <td style="padding:0;">
                                    <a class="cta" href="{{ $exploreUrl }}" style="display:inline-block;padding:12px 24px;background-color:#f2b82e;color:#1c1712;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;font-weight:700;line-height:1.2;border-radius:999px;white-space:nowrap;">
                                        Explore more
                                    </a>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        @endif
    </x-slot:after>
</x-mail.branded>
