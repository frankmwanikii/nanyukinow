Hi {{ $senderName }},

We sent your message to {{ $listing->title }} via {{ $appName }}.

Your message:
{{ \App\Support\SafeHtml::toPlainText($messageBody) }}

Sent as: {{ $senderName }} <{{ $senderEmail }}>
@if ($senderPhone)
Phone: {{ $senderPhone }}
@endif

View listing: {{ $listingUrl }}

@if (count($recommended))
Recommended for you:
@foreach ($recommended as $item)
- {{ $item['title'] }}@if ($item['location']) ({{ $item['location'] }})@endif
  {{ $item['url'] }}
@endforeach

Explore more: {{ $exploreUrl }}
@endif

Contact {{ $appName }}:
Website: {{ $appUrl }}
Email: {{ $contactEmail }}
@if ($contactPhone)
Phone: {{ $contactPhone }}
@endif

Disclaimer: This email confirms a message you submitted through {{ $appName }}. We pass your inquiry to the listing contact, but we do not guarantee a reply, response time, or the accuracy of listing information. If you did not send this message, you can ignore this email.

— {{ $appName }}
