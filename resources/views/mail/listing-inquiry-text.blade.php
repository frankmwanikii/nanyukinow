New inquiry for {{ $listing->title }}

{{ $senderName }} reached out about {{ $listing->title }} via {{ $appName }}.

Message:
{{ \App\Support\SafeHtml::toPlainText($messageBody) }}
@if ($attachmentCount)

Attachments: {{ $attachmentCount }} {{ $attachmentCount === 1 ? 'file' : 'files' }} (see email attachments)
@endif

From: {{ $senderName }}
Email: {{ $senderEmail }}
@if ($senderPhone)
Phone: {{ $senderPhone }}
@endif

Reply to this email to respond directly to {{ $senderName }}.
View listing: {{ $listingUrl }}

Contact {{ $appName }}:
Website: {{ $appUrl }}
Email: {{ $contactEmail }}
Phone: {{ $contactPhone }}

Disclaimer: This inquiry was submitted through {{ $appName }} for your listing. Reply directly to the sender to continue the conversation. {{ $appName }} is not a party to your exchange and does not guarantee a booking, payment, or the accuracy of visitor details.

— {{ $appName }}
