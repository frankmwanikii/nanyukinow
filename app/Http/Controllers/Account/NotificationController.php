<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(): RedirectResponse
    {
        return redirect()->route('account.messages', ['tab' => 'alerts']);
    }

    public function markRead(Request $request, string $id): RedirectResponse
    {
        $notification = $request->user()
            ->notifications()
            ->whereKey($id)
            ->firstOrFail();

        $notification->markAsRead();

        return redirect()->route('account.messages', [
            'tab' => 'alerts',
            'n' => $notification->id,
        ]);
    }

    public function markAllRead(Request $request): RedirectResponse
    {
        $request->user()->unreadNotifications->markAsRead();

        return redirect()
            ->route('account.messages', ['tab' => 'alerts'])
            ->with('success', 'All notifications marked as read.');
    }
}
