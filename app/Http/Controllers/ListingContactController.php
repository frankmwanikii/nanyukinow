<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Listing;
use App\Models\Message;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ListingContactController extends Controller
{
    public function store(Request $request, Listing $listing): RedirectResponse
    {
        $data = $request->validate([
            'first_name' => ['required', 'string', 'max:80'],
            'last_name' => ['required', 'string', 'max:80'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:40'],
            'message' => ['required', 'string', 'max:5000'],
            'g-recaptcha-response' => ['nullable', 'string'],
        ]);

        $owner = $listing->user;
        if (! $owner) {
            return back()->with('error', 'This listing can’t receive messages right now.');
        }

        $sender = $request->user();
        if ($sender && $sender->id === $owner->id) {
            return back()->with('error', 'You can’t message your own listing.');
        }

        $guestName = trim($data['first_name'].' '.$data['last_name']);
        $body = trim($data['message']);

        $conversation = null;

        if ($sender) {
            $conversation = Conversation::query()
                ->where('listing_id', $listing->id)
                ->whereHas('participants', fn ($q) => $q->where('users.id', $sender->id))
                ->whereHas('participants', fn ($q) => $q->where('users.id', $owner->id))
                ->first();
        }

        if (! $conversation) {
            $conversation = Conversation::query()->create([
                'listing_id' => $listing->id,
                'subject' => 'Inquiry about '.$listing->title,
                'last_message_at' => now(),
            ]);

            $conversation->participants()->attach($owner->id, ['last_read_at' => null]);

            if ($sender) {
                $conversation->participants()->attach($sender->id, ['last_read_at' => now()]);
            }
        }

        /** @var Message $message */
        $message = $conversation->messages()->create([
            'user_id' => $sender?->id,
            'guest_name' => $sender ? null : $guestName,
            'guest_email' => $sender?->email ?: ($data['email'] ?? null),
            'guest_phone' => $data['phone'] ?? null,
            'body' => $body,
        ]);

        // If guest used a different display name while logged in, keep body only.
        if ($sender && $guestName !== '' && $guestName !== $sender->name) {
            $message->forceFill([
                'guest_name' => $guestName,
                'guest_email' => $data['email'] ?? $sender->email,
                'guest_phone' => $data['phone'] ?? null,
            ])->save();
        }

        $conversation->forceFill(['last_message_at' => $message->created_at])->save();

        return back()->with('success', 'Your message was sent.');
    }
}
