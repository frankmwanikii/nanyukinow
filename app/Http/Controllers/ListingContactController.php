<?php

namespace App\Http\Controllers;

use App\Mail\ListingInquiryConfirmationMail;
use App\Mail\ListingInquiryMail;
use App\Models\Conversation;
use App\Models\Listing;
use App\Models\Message;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

class ListingContactController extends Controller
{
    public function store(Request $request, Listing $listing): JsonResponse|RedirectResponse
    {
        $data = $request->validate([
            'first_name' => ['required', 'string', 'max:80'],
            'last_name' => ['required', 'string', 'max:80'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:40'],
            'message' => ['required', 'string', 'max:5000'],
            'g-recaptcha-response' => ['nullable', 'string'],
            'attachments' => ['nullable', 'array', 'max:5'],
            'attachments.*' => [
                'file',
                'max:8192',
                'mimes:jpg,jpeg,png,webp,gif,pdf,doc,docx',
            ],
        ]);

        $owner = $listing->user;
        if (! $owner) {
            return $this->fail($request, 'This listing can’t receive messages right now.');
        }

        $recipientEmail = filled($listing->email)
            ? $listing->email
            : $owner->email;

        if (! filled($recipientEmail)) {
            return $this->fail($request, 'This listing can’t receive messages right now.');
        }

        $sender = $request->user();
        if ($sender && $sender->id === $owner->id) {
            return $this->fail($request, 'You can’t message your own listing.');
        }

        $guestName = trim($data['first_name'].' '.$data['last_name']);
        $senderEmail = strtolower(trim($data['email']));
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
            'guest_email' => $sender?->email ?: $senderEmail,
            'guest_phone' => $data['phone'] ?? null,
            'body' => $body,
        ]);

        // If guest used a different display name while logged in, keep body only.
        if ($sender && $guestName !== '' && $guestName !== $sender->name) {
            $message->forceFill([
                'guest_name' => $guestName,
                'guest_email' => $senderEmail,
                'guest_phone' => $data['phone'] ?? null,
            ])->save();
        }

        $conversation->forceFill(['last_message_at' => $message->created_at])->save();

        try {
            $storedFiles = $this->storeAttachments($request->file('attachments', []));
        } catch (\Throwable $e) {
            report($e);
            $storedFiles = [];
        }

        $mailable = new ListingInquiryMail(
            listing: $listing,
            senderName: $guestName,
            senderEmail: $senderEmail,
            senderPhone: $data['phone'] ?? null,
            messageBody: $body,
            files: $storedFiles,
        );

        $confirmation = new ListingInquiryConfirmationMail(
            listing: $listing,
            senderName: $guestName,
            senderEmail: $senderEmail,
            senderPhone: $data['phone'] ?? null,
            messageBody: $body,
        );

        try {
            // Notify the listing (Reply-To = sender so they can respond directly).
            Mail::to($recipientEmail)->send($mailable);

            // Confirm to the visitor with a full-width branded email.
            Mail::to($senderEmail, $guestName)->send($confirmation);
        } catch (\Throwable $e) {
            report($e);
            // Message is already saved — still confirm to the visitor in-app.
        } finally {
            $this->forgetAttachments($storedFiles);
        }

        $success = 'Message sent successfully.';

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => $success,
            ]);
        }

        return back()->with('success', $success);
    }

    /**
     * @param  array<int, UploadedFile>|null  $uploads
     * @return list<array{path: string, name: string, mime: string|null, disk_path: string|null}>
     */
    private function storeAttachments(?array $uploads): array
    {
        $stored = [];

        if ($uploads) {
            Storage::disk('local')->makeDirectory('contact-attachments/tmp');
        }

        foreach ($uploads ?? [] as $upload) {
            if (! $upload instanceof UploadedFile || ! $upload->isValid()) {
                continue;
            }

            $originalName = $upload->getClientOriginalName() ?: 'attachment';
            $mime = $upload->getMimeType();

            try {
                $diskPath = $upload->store('contact-attachments/tmp', 'local');
                if (! $diskPath) {
                    throw new \RuntimeException('Unable to store upload.');
                }

                $absolute = Storage::disk('local')->path($diskPath);
                if (! is_file($absolute)) {
                    throw new \RuntimeException('Stored upload missing on disk.');
                }

                $stored[] = [
                    'path' => $absolute,
                    'name' => $originalName,
                    'mime' => $mime,
                    'disk_path' => $diskPath,
                ];
            } catch (\Throwable $e) {
                report($e);

                // Fallback: keep a copy in the system temp dir for this request.
                $fallback = tempnam(sys_get_temp_dir(), 'nn-contact-');
                if ($fallback === false) {
                    continue;
                }

                $target = $fallback.'.'.pathinfo($originalName, PATHINFO_EXTENSION);
                @rename($fallback, $target);
                if (! @copy($upload->getRealPath(), $target)) {
                    @unlink($target);
                    continue;
                }

                $stored[] = [
                    'path' => $target,
                    'name' => $originalName,
                    'mime' => $mime,
                    'disk_path' => null,
                ];
            }
        }

        return $stored;
    }

    /**
     * @param  list<array{path?: string, disk_path?: string|null}>  $storedFiles
     */
    private function forgetAttachments(array $storedFiles): void
    {
        foreach ($storedFiles as $file) {
            if (! empty($file['disk_path'])) {
                Storage::disk('local')->delete($file['disk_path']);
                continue;
            }

            if (! empty($file['path']) && is_file($file['path'])) {
                @unlink($file['path']);
            }
        }
    }

    private function fail(Request $request, string $message): JsonResponse|RedirectResponse
    {
        if ($request->expectsJson()) {
            return response()->json(['message' => $message], 422);
        }

        return back()->with('error', $message);
    }
}
