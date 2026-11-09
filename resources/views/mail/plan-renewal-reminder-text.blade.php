{{ $headline }}

Hi {{ $greetingName }},

{{ $intro }}

Plan: {{ $planLabel }}@if ($periodLabel) ({{ $periodLabel }})@endif
Days left: {{ $daysLeft }}@if ($expiresAtLabel) (expires {{ $expiresAtLabel }})@endif

If the plan is not renewed, your account moves to Free and your listings are hidden from the website. Your content is kept, and it goes live again automatically after you renew.

{{ $actionLabel }}:
{{ $actionUrl }}

Contact {{ $appName }}:
Website: {{ $appUrl }}
Email: {{ $contactEmail }}
Phone: {{ $contactPhone }}

Disclaimer: {{ $disclaimer }} Contact us at {{ $contactEmail }}.

— {{ $appName }}
