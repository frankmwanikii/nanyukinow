Hi {{ $senderName }},

We sent your message to {{ $listing->title }} via {{ $appName }}.

Your message:
{{ $messageBody }}

Sent as: {{ $senderName }} <{{ $senderEmail }}>
@if ($senderPhone)
Phone: {{ $senderPhone }}
@endif

View listing: {{ $listingUrl }}

If they reply, it will come to this inbox.

— {{ $appName }}
{{ $appUrl }}
