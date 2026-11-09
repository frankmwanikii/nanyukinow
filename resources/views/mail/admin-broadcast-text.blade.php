{{ $subjectLine }}

{{ $greeting }}

@foreach ($bodyParagraphs as $paragraph)
@if (trim((string) $paragraph) !== '')
{{ $paragraph }}

@endif
@endforeach
Explore: {{ $exploreUrl }}

Contact {{ $appName }}:
Website: {{ $appUrl }}
Email: {{ $contactEmail }}
Phone: {{ $contactPhone }}

— {{ $appName }}
