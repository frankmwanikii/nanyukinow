<x-mail::message>
# New inquiry for {{ $listing->title }}

You received a message via {{ config('app.name') }}.

**From:** {{ $senderName }}  
**Email:** {{ $senderEmail }}
@if ($senderPhone)
**Phone:** {{ $senderPhone }}
@endif

---

{{ $messageBody }}

---

Reply to this email to respond to {{ $senderName }} — they are CC’d on this message.

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
