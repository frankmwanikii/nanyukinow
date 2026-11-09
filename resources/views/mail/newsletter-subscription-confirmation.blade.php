<x-mail.branded
    :app-name="$appName"
    :app-url="$appUrl"
    :logo-url="$logoUrl"
    :contact-email="$contactEmail"
    :contact-phone="$contactPhone"
    headline="You’re in"
    title="Newsletter confirmation"
    :disclaimer="'This email confirms your subscription to '.$appName.' Insider. If you did not sign up, you can ignore this message or'"
>
    <p style="margin:0 0 20px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.55;color:#1c1712;">
        Welcome to <strong>{{ $appName }} Insider</strong>. Mambo kwa ground, straight to your inbox.
    </p>

    <p style="margin:0 0 8px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#6b7758;font-weight:700;">
        Subscribed as
    </p>
    <p style="margin:0 0 24px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.55;color:#1c1712;">
        <a href="mailto:{{ $subscriberEmail }}" style="color:#3d4430;text-decoration:underline;font-weight:700;">{{ $subscriberEmail }}</a>
    </p>

    <p style="margin:0 0 24px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.65;color:#4b533a;">
        Expect weekend offers from top stays, new menus at local eateries, and essential service updates around Nanyuki, plus stories and picks from the team.
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr>
            <td class="cta-cell" valign="middle" style="padding:0 10px 0 0;">
                <a class="cta" href="{{ $exploreUrl }}" style="display:inline-block;padding:14px 28px;background-color:#3d4430;color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;font-weight:700;line-height:1.2;border-radius:999px;white-space:nowrap;">
                    Explore Nanyuki
                </a>
            </td>
            <td class="cta-cell" valign="middle" style="padding:0;">
                <a class="cta" href="{{ $storiesUrl }}" style="display:inline-block;padding:14px 28px;background-color:#f2b82e;color:#1c1712;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;font-weight:700;line-height:1.2;border-radius:999px;white-space:nowrap;">
                    Read stories
                </a>
            </td>
        </tr>
    </table>

    <p style="margin:28px 0 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:#4b533a;">
        Thanks for joining. We’re glad you’re here.
    </p>
</x-mail.branded>
