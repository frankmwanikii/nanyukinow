<?php

use App\Http\Controllers\Account\DashboardController as AccountDashboardController;
use App\Http\Controllers\Account\ListingController as AccountListingController;
use App\Http\Controllers\Account\UpgradeController as AccountUpgradeController;
use App\Http\Controllers\ListingController;
use App\Http\Controllers\PricingPageController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [ListingController::class, 'home'])->name('home');

Route::get('/explore', [ListingController::class, 'explore'])->name('explore');

Route::get('/pricing', PricingPageController::class)->name('pricing');

Route::get('/stories', function () {
    return Inertia::render('Stories/Index', [
        'category' => request()->string('category')->toString() ?: null,
        'q' => request()->string('q')->toString() ?: null,
    ]);
})->name('stories.index');

Route::get('/stories/{slug}', function (string $slug) {
    return Inertia::render('Stories/Show', [
        'slug' => $slug,
    ]);
})->name('stories.show');

Route::get('/listings/{slug}', [ListingController::class, 'show'])->name('listings.show');

Route::get('/terms', function () {
    return Inertia::render('Terms');
})->name('terms');

Route::get('/privacy', function () {
    return Inertia::render('Privacy');
})->name('privacy');

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', function () {
        return redirect()->route('account.index');
    })->name('dashboard');

    Route::get('/account', AccountDashboardController::class)->name('account.index');

    Route::get('/account/listings/create', [AccountListingController::class, 'create'])->name('account.listings.create');
    Route::post('/account/listings', [AccountListingController::class, 'store'])->name('account.listings.store');
    Route::get('/account/listings/{listing}/edit', [AccountListingController::class, 'edit'])->name('account.listings.edit');
    Route::put('/account/listings/{listing}', [AccountListingController::class, 'update'])->name('account.listings.update');
    Route::delete('/account/listings/{listing}', [AccountListingController::class, 'destroy'])->name('account.listings.destroy');

    Route::get('/account/upgrade', [AccountUpgradeController::class, 'create'])->name('account.upgrade');
    Route::post('/account/upgrade', [AccountUpgradeController::class, 'store'])->name('account.upgrade.store');
    Route::post('/account/upgrade/{upgrade}/cancel', [AccountUpgradeController::class, 'cancel'])->name('account.upgrade.cancel');

    Route::get('/account/notifications', [\App\Http\Controllers\Account\NotificationController::class, 'index'])->name('account.notifications');
    Route::post('/account/notifications/read-all', [\App\Http\Controllers\Account\NotificationController::class, 'markAllRead'])->name('account.notifications.read-all');
    Route::post('/account/notifications/{id}/read', [\App\Http\Controllers\Account\NotificationController::class, 'markRead'])->name('account.notifications.read');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
require __DIR__.'/admin.php';
