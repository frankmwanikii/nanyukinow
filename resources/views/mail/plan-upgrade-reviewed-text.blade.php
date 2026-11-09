{{ $headline }}

Hi {{ $greetingName }},

{{ $intro }}

Plan: {{ $planLabel }}@if ($periodLabel) ({{ $periodLabel }})@endif
@if ($paymentReference)
Payment reference: {{ $paymentReference }}
@endif
@if ($adminNotes)
Note from the team: {{ $adminNotes }}
@endif

{{ $supportLine }}

{{ $actionLabel }}:
{{ $actionUrl }}

Contact {{ $appName }}:
Website: {{ $appUrl }}
Email: {{ $contactEmail }}
Phone: {{ $contactPhone }}

Disclaimer: {{ $disclaimer }} Contact us at {{ $contactEmail }}.

— {{ $appName }}
