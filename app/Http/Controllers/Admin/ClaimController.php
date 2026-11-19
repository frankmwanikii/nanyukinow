<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Listing;
use App\Models\ListingClaim;
use App\Models\User;
use App\Notifications\ClaimReviewedNotification;
use App\Support\AdminPagination;
use App\Support\ClaimPlanGrace;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ClaimController extends Controller
{
    public function index(Request $request): Response
    {
        $status = $request->string('status')->toString() ?: 'pending';
        if (! in_array($status, ['all', 'pending', 'approved', 'rejected'], true)) {
            $status = 'pending';
        }

        $q = $request->string('q')->toString();
        $perPage = AdminPagination::perPage($request, 15);

        $query = ListingClaim::query()
            ->with([
                'listing:id,title,slug,image_url,claim_status,location,user_id',
                'user:id,name,email,username',
                'reviewer:id,name',
            ])
            ->latest();

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        if ($q !== '') {
            $like = '%'.$q.'%';
            $query->where(function ($inner) use ($like) {
                $inner->where('first_name', 'like', $like)
                    ->orWhere('last_name', 'like', $like)
                    ->orWhere('email', 'like', $like)
                    ->orWhere('phone', 'like', $like)
                    ->orWhere('reason', 'like', $like)
                    ->orWhereHas('listing', function ($listing) use ($like) {
                        $listing->where('title', 'like', $like)
                            ->orWhere('slug', 'like', $like);
                    });
            });
        }

        $claims = $query
            ->paginate($perPage)
            ->withQueryString()
            ->through(fn (ListingClaim $claim) => $claim->toAdminArray());

        return Inertia::render('Admin/Claims/Index', [
            'claims' => $claims,
            'filters' => [
                'status' => $status,
                'q' => $q,
                'per_page' => $perPage,
            ],
            'counts' => $this->counts(),
        ]);
    }

    public function show(ListingClaim $claim): Response
    {
        $claim->load([
            'listing:id,title,slug,image_url,claim_status,location,user_id,address',
            'user:id,name,email,username',
            'reviewer:id,name',
        ]);

        $suggestedOwners = User::query()
            ->where(function ($q) use ($claim) {
                $q->where('email', $claim->email);
                if ($claim->phone) {
                    $q->orWhere('phone', $claim->phone);
                }
                if ($claim->user_id) {
                    $q->orWhere('id', $claim->user_id);
                }
            })
            ->orderBy('name')
            ->limit(12)
            ->get(['id', 'name', 'email', 'username'])
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'username' => $user->username,
            ])
            ->values()
            ->all();

        return Inertia::render('Admin/Claims/Show', [
            'claim' => $claim->toAdminArray(),
            'suggestedOwners' => $suggestedOwners,
            'counts' => $this->counts(),
        ]);
    }

    public function approve(Request $request, ListingClaim $claim): RedirectResponse
    {
        abort_unless($claim->status === ListingClaim::STATUS_PENDING, 422);

        $data = $request->validate([
            'admin_notes' => ['nullable', 'string', 'max:1000'],
            'assign_to_user_id' => ['nullable', 'integer', 'exists:users,id'],
            'create_account' => ['nullable', 'boolean'],
            'notify_claimant' => ['nullable', 'boolean'],
        ]);

        $createAccount = $request->boolean('create_account', true);

        $listing = null;

        DB::transaction(function () use ($request, $claim, $data, $createAccount, &$listing): void {
            $listing = Listing::query()->lockForUpdate()->findOrFail($claim->listing_id);

            $owner = $this->resolveClaimOwner($claim, $data['assign_to_user_id'] ?? null, $createAccount);
            abort_unless($owner !== null, 422, 'Could not assign ownership. The claimant needs a valid email or account.');

            $listing->user_id = $owner->id;
            $listing->claim_status = 'claimed';
            $listing->is_verified = true;
            ClaimPlanGrace::startIfNeeded($listing);
            $listing->save();

            $claim->update([
                'status' => ListingClaim::STATUS_APPROVED,
                'user_id' => $owner->id,
                'admin_notes' => $data['admin_notes'] ?? null,
                'reviewed_by' => $request->user()->id,
                'reviewed_at' => now(),
            ]);

            ListingClaim::query()
                ->where('listing_id', $listing->id)
                ->where('id', '!=', $claim->id)
                ->where('status', ListingClaim::STATUS_PENDING)
                ->update([
                    'status' => ListingClaim::STATUS_REJECTED,
                    'admin_notes' => 'Automatically rejected — another claim was approved.',
                    'reviewed_by' => $request->user()->id,
                    'reviewed_at' => now(),
                ]);
        });

        $claim->refresh();
        if ($request->boolean('notify_claimant', true) && $listing) {
            $this->notifyClaimant($claim, $listing, 'approved');
        }

        return redirect()
            ->route('admin.claims.index', ['status' => 'pending'])
            ->with('success', 'Claim approved — listing marked as claimed.');
    }

    public function reject(Request $request, ListingClaim $claim): RedirectResponse
    {
        abort_unless($claim->status === ListingClaim::STATUS_PENDING, 422);

        $data = $request->validate([
            'admin_notes' => ['required', 'string', 'max:1000'],
            'notify_claimant' => ['nullable', 'boolean'],
        ]);

        DB::transaction(function () use ($request, $claim, $data): void {
            $claim->update([
                'status' => ListingClaim::STATUS_REJECTED,
                'admin_notes' => $data['admin_notes'],
                'reviewed_by' => $request->user()->id,
                'reviewed_at' => now(),
            ]);

            $stillPending = ListingClaim::query()
                ->where('listing_id', $claim->listing_id)
                ->where('status', ListingClaim::STATUS_PENDING)
                ->exists();

            if (! $stillPending) {
                Listing::query()
                    ->where('id', $claim->listing_id)
                    ->where('claim_status', 'pending')
                    ->update(['claim_status' => 'unclaimed']);
            }
        });

        $claim->refresh();
        $listing = Listing::query()->find($claim->listing_id);
        if ($request->boolean('notify_claimant', true) && $listing) {
            $this->notifyClaimant($claim, $listing, 'rejected');
        }

        return redirect()
            ->route('admin.claims.index', ['status' => 'pending'])
            ->with('success', 'Claim rejected.');
    }

    public function reopen(Request $request, ListingClaim $claim): RedirectResponse
    {
        abort_unless(in_array($claim->status, [
            ListingClaim::STATUS_REJECTED,
            ListingClaim::STATUS_APPROVED,
        ], true), 422);

        DB::transaction(function () use ($claim): void {
            $claim->update([
                'status' => ListingClaim::STATUS_PENDING,
                'admin_notes' => trim(($claim->admin_notes ? $claim->admin_notes."\n" : '').'Reopened by admin.'),
                'reviewed_by' => null,
                'reviewed_at' => null,
            ]);

            Listing::query()
                ->where('id', $claim->listing_id)
                ->update(['claim_status' => 'pending']);
        });

        return back()->with('success', 'Claim reopened and set back to pending.');
    }

    public function destroy(ListingClaim $claim): RedirectResponse
    {
        DB::transaction(function () use ($claim): void {
            $listingId = $claim->listing_id;
            $wasPending = $claim->status === ListingClaim::STATUS_PENDING;

            $claim->delete();

            if ($wasPending) {
                $stillPending = ListingClaim::query()
                    ->where('listing_id', $listingId)
                    ->where('status', ListingClaim::STATUS_PENDING)
                    ->exists();

                if (! $stillPending) {
                    Listing::query()
                        ->where('id', $listingId)
                        ->where('claim_status', 'pending')
                        ->update(['claim_status' => 'unclaimed']);
                }
            }
        });

        return redirect()
            ->route('admin.claims.index', ['status' => request()->string('status')->toString() ?: 'pending'])
            ->with('success', 'Claim deleted.');
    }

    /**
     * @return array{all: int, pending: int, approved: int, rejected: int}
     */
    private function counts(): array
    {
        $rows = ListingClaim::query()
            ->selectRaw('status, count(*) as aggregate')
            ->groupBy('status')
            ->pluck('aggregate', 'status');

        return [
            'all' => (int) $rows->sum(),
            'pending' => (int) ($rows[ListingClaim::STATUS_PENDING] ?? 0),
            'approved' => (int) ($rows[ListingClaim::STATUS_APPROVED] ?? 0),
            'rejected' => (int) ($rows[ListingClaim::STATUS_REJECTED] ?? 0),
        ];
    }

    private function notifyClaimant(ListingClaim $claim, Listing $listing, string $outcome): void
    {
        $claim->loadMissing('user');

        $notification = new ClaimReviewedNotification($claim, $listing, $outcome);

        try {
            if ($claim->user) {
                $claim->user->notify($notification);

                return;
            }

            $email = Str::lower(trim((string) $claim->email));
            if ($email === '') {
                return;
            }

            Notification::route('mail', $email)->notify($notification);
        } catch (\Throwable $e) {
            report($e);
        }
    }

    private function resolveClaimOwner(ListingClaim $claim, ?int $assignToUserId, bool $createAccount): ?User
    {
        if ($assignToUserId) {
            return User::query()->find($assignToUserId);
        }

        if ($claim->user_id) {
            $claim->loadMissing('user');

            if ($claim->user) {
                return $claim->user;
            }
        }

        return $this->resolveOrCreateClaimantUser($claim, $createAccount);
    }

    private function resolveOrCreateClaimantUser(ListingClaim $claim, bool $createAccount = true): ?User
    {
        $email = Str::lower(trim((string) $claim->email));
        if ($email === '') {
            return null;
        }

        $existing = User::query()->where('email', $email)->first();
        if ($existing) {
            return $existing;
        }

        if (! $createAccount) {
            return null;
        }

        $base = Str::slug(Str::before($email, '@')) ?: 'member';
        $username = $base;
        $i = 1;
        while (User::query()->where('username', $username)->exists()) {
            $username = $base.$i;
            $i++;
        }

        return User::query()->create([
            'name' => $claim->fullName() ?: 'Claimant',
            'username' => $username,
            'email' => $email,
            'phone' => $claim->phone,
            'password' => bcrypt(Str::random(32)),
            'email_verified_at' => now(),
        ]);
    }
}
