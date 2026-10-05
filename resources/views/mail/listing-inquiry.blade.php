<x-mail::message>
# New inquiry for {{ $listing->title }}

You received a message via {{ config('app.name') }}.

**From:** {{ $senderName }}  
**Email:** {{ $senderEmail }}
@if ($senderPhone)
**Phone:** {{ $senderPhone }}
@endif
@if ($attachmentCount)
**Attachments:** {{ $attachmentCount }} {{ $attachmentCount === 1 ? 'file' : 'files' }} (see email attachments)
@endif

---

{{ $messageBody }}

---

Reply to this email to respond directly to {{ $senderName }}.

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
