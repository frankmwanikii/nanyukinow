{{ $headline }}

Hi {{ $greetingName }},

{{ $intro }}

Listing: {{ $listingTitle }}
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
