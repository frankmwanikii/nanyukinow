<x-mail.branded
    :app-name="$appName"
    :app-url="$appUrl"
    :logo-url="$logoUrl"
    :contact-email="$contactEmail"
    :contact-phone="$contactPhone"
    headline="Reset your password"
    title="Reset your password"
    :disclaimer="'This email was sent because a password reset was requested for your '.$appName.' account. Never share this link, your password, or payment PINs with anyone. If you did not request a reset,'"
>
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
</x-mail.branded>
