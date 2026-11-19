<x-mail.branded
    :app-name="$appName"
    :app-url="$appUrl"
    :logo-url="$logoUrl"
    :contact-email="$contactEmail"
    :contact-phone="$contactPhone"
    headline="Verify your email"
    title="Verify your email"
    :disclaimer="'This email was sent to confirm your '.$appName.' account. Never share this code, your password, or payment PINs with anyone. If you did not create an account,'"
>
    <p style="margin:0 0 20px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.55;color:#1c1712;">
        Hi {{ $greetingName }}, use this code to verify <a href="mailto:{{ $userEmail }}" style="color:#3d4430;text-decoration:underline;font-weight:700;">{{ $userEmail }}</a> on {{ $appName }}.
    </p>

    <p style="margin:0 0 8px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#6b7758;font-weight:700;">
        Verification code
    </p>
    <p style="margin:0 0 24px 0;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono','Courier New',monospace;font-size:32px;line-height:1.2;letter-spacing:0.28em;font-weight:700;color:#1c1712;">
        {{ $code }}
    </p>

    <p style="margin:0 0 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.65;color:#4b533a;">
        This code expires in <strong>{{ $expiresMinutes }} minutes</strong>. If you did not create an account, you can ignore this email.
    </p>
</x-mail.branded>
