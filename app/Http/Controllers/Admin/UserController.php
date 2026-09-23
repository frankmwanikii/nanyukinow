<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Listing;
use App\Models\PlanUpgrade;
use App\Models\User;
use App\Support\AdminPagination;
use App\Support\ListingPayload;
use App\Support\Membership;
use App\Support\UserAvatar;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $perPage = AdminPagination::perPage($request, 20);

        $users = User::query()
            ->withCount('listings')
            ->when($request->filled('q'), function ($query) use ($request) {
                $q = '%'.$request->string('q').'%';
                $query->where(function ($inner) use ($q) {
                    $inner->where('name', 'like', $q)
                        ->orWhere('email', 'like', $q)
                        ->orWhere('username', 'like', $q)
                        ->orWhere('phone', 'like', $q);
                });
            })
            ->when($request->string('role')->toString() === 'admin', fn ($q) => $q->where('is_admin', true))
            ->when($request->string('role')->toString() === 'user', fn ($q) => $q->where('is_admin', false))
            ->latest()
            ->paginate($perPage)
            ->withQueryString()
            ->through(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'phone' => $user->phone,
                'avatar_url' => UserAvatar::normalize($user->avatar_url),
                'is_admin' => $user->is_admin,
                'plan' => $user->effectivePlan(),
                'plan_label' => Membership::label($user->effectivePlan()),
                'plan_expires_at' => $user->plan_expires_at?->toIso8601String(),
                'listings_count' => $user->listings_count,
                'email_verified_at' => $user->email_verified_at?->toIso8601String(),
                'created_at' => $user->created_at?->toIso8601String(),
            ]);

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'filters' => [
                'q' => $request->string('q')->toString(),
                'role' => $request->string('role')->toString(),
                'per_page' => $perPage,
            ],
        ]);
    }

    public function show(Request $request, User $user): Response
    {
        $tab = $request->string('tab')->toString() ?: 'profile';
        if (! in_array($tab, ['profile', 'listings', 'payments'], true)) {
            $tab = 'profile';
        }

        $perPage = AdminPagination::perPage($request, 15);
        $user->loadCount(['listings', 'planUpgrades']);

        $payload = [
            'user' => $this->memberPayload($user),
            'membership' => Membership::planSummary($user),
            'tab' => $tab,
            'filters' => [
                'per_page' => $perPage,
            ],
            'stats' => [
                'listings' => $user->listings_count,
                'payments' => $user->plan_upgrades_count,
                'approved_spend' => (int) PlanUpgrade::query()
                    ->where('user_id', $user->id)
                    ->where('status', PlanUpgrade::STATUS_APPROVED)
                    ->sum('amount'),
            ],
            'listings' => null,
            'payments' => null,
        ];

        if ($tab === 'listings') {
            $payload['listings'] = Listing::query()
                ->with(['category:id,name,slug'])
                ->where('user_id', $user->id)
                ->latest('updated_at')
                ->paginate($perPage)
                ->withQueryString()
                ->through(function (Listing $listing) {
                    $public = ListingPayload::fromModel($listing);

                    return array_merge($public, [
                        'image_url' => $public['image'],
                        'status' => $listing->status,
                        'views_count' => $listing->views_count,
                        'is_published' => $listing->is_published,
                        'expires_at' => $listing->expires_at?->toIso8601String(),
                        'expiry_label' => $listing->expiryLabel(),
                        'is_expired' => $listing->isExpired(),
                        'updated_at' => $listing->updated_at?->toIso8601String(),
                        'edit_href' => route('admin.listings.edit', $listing->slug),
                        'public_href' => route('listings.show', $listing->slug),
                    ]);
                });
        }

        if ($tab === 'payments') {
            $payload['payments'] = PlanUpgrade::query()
                ->with(['reviewer:id,name'])
                ->where('user_id', $user->id)
                ->latest()
                ->paginate($perPage)
                ->withQueryString()
                ->through(fn (PlanUpgrade $upgrade) => $upgrade->toAdminArray());
        }

        return Inertia::render('Admin/Users/Show', $payload);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'username' => ['nullable', 'string', 'max:50', 'alpha_dash', 'unique:users,username'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:40'],
            'password' => ['required', Password::defaults()],
            'is_admin' => ['boolean'],
        ]);

        User::query()->create([
            ...$data,
            'password' => $data['password'],
            'is_admin' => (bool) ($data['is_admin'] ?? false),
            'email_verified_at' => now(),
        ]);

        return back()->with('success', 'User created.');
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'username' => ['nullable', 'string', 'max:50', 'alpha_dash', Rule::unique('users', 'username')->ignore($user->id)],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'phone' => ['nullable', 'string', 'max:40'],
            'password' => ['nullable', Password::defaults()],
            'is_admin' => ['boolean'],
            'avatar' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp,gif', 'max:15360'],
            'remove_avatar' => ['sometimes', 'boolean'],
        ]);

        if ($user->id === $request->user()->id && ! ($data['is_admin'] ?? $user->is_admin)) {
            return back()->with('error', 'You cannot remove your own admin access.');
        }

        $payload = [
            'name' => $data['name'],
            'username' => filled($data['username'] ?? null) ? $data['username'] : $user->username,
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'is_admin' => (bool) ($data['is_admin'] ?? false),
        ];

        if (! empty($data['password'])) {
            $payload['password'] = $data['password'];
        }

        if ($request->boolean('remove_avatar')) {
            UserAvatar::delete($user->avatar_url);
            $payload['avatar_url'] = null;
        }

        if ($request->hasFile('avatar')) {
            UserAvatar::delete($user->avatar_url);
            $payload['avatar_url'] = UserAvatar::store($request->file('avatar'));
        }

        $emailChanged = $user->email !== $payload['email'];
        $user->update($payload);

        if ($emailChanged) {
            $user->forceFill(['email_verified_at' => null])->save();
        }

        return redirect()
            ->route('admin.users.show', $user)
            ->with('success', 'Member profile updated.');
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        if ($user->id === $request->user()->id) {
            return back()->with('error', 'You cannot delete your own account.');
        }

        $user->delete();

        return redirect()
            ->route('admin.users.index')
            ->with('success', 'User deleted.');
    }

    /**
     * @return array<string, mixed>
     */
    private function memberPayload(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'username' => $user->username,
            'email' => $user->email,
            'phone' => $user->phone,
            'avatar_url' => UserAvatar::normalize($user->avatar_url),
            'is_admin' => $user->is_admin,
            'plan' => $user->plan,
            'plan_started_at' => $user->plan_started_at?->toIso8601String(),
            'plan_expires_at' => $user->plan_expires_at?->toIso8601String(),
            'email_verified_at' => $user->email_verified_at?->toIso8601String(),
            'created_at' => $user->created_at?->toIso8601String(),
            'updated_at' => $user->updated_at?->toIso8601String(),
            'listings_count' => $user->listings_count,
            'payments_count' => $user->plan_upgrades_count,
        ];
    }
}
