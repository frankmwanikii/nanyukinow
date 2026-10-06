{{ $greeting }}

@foreach ($bodyParagraphs as $paragraph)
@if (trim((string) $paragraph) !== '')
{{ $paragraph }}

@endif
@endforeach
Explore: {{ $exploreUrl }}

— {{ $appName }}
{{ $contactEmail }} · {{ $contactPhone }}
{{ $appUrl }}
