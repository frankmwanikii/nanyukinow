<?php

use App\Http\Controllers\Account\BillingController as AccountBillingController;
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

Route::get('/listings/search', [ListingController::class, 'search'])
    ->middleware('throttle:60,1')
    ->name('listings.search');

Route::get('/pricing', PricingPageController::class)->name('pricing');

Route::get('/stories', function () {
    return Inertia::render('Stories/Index', [
        'category' => request()->string('category')->toString() ?: null,
        'q' => request()->string('q')->toString() ?: null,
        'page' => \App\Models\SitePage::findBySlug('stories')?->toPublicArray(),
    ]);
})->name('stories.index');

Route::get('/stories/{slug}', function (string $slug) {
    return Inertia::render('Stories/Show', [
        'slug' => $slug,
    ]);
})->name('stories.show');

Route::get('/listings/{slug}', [ListingController::class, 'show'])->name('listings.show');
Route::post('/listings/{listing:slug}/contact', [\App\Http\Controllers\ListingContactController::class, 'store'])
    ->middleware('throttle:10,1')
    ->name('listings.contact');
Route::post('/listings/{listing:slug}/claim', [\App\Http\Controllers\ListingClaimController::class, 'store'])
    ->middleware('throttle:8,1')
    ->name('listings.claim');

Route::get('/terms', function () {
    return Inertia::render('Terms', [
        'page' => \App\Models\SitePage::findBySlug('terms')?->toPublicArray(),
    ]);
})->name('terms');

Route::get('/privacy', function () {
    return Inertia::render('Privacy', [
        'page' => \App\Models\SitePage::findBySlug('privacy')?->toPublicArray(),
    ]);
})->name('privacy');

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', function () {
        return redirect()->route('account.index');
    })->name('dashboard');

    Route::get('/account', AccountDashboardController::class)->name('account.index');

    Route::get('/account/listings/create', [AccountListingController::class, 'create'])->name('account.listings.create');
    Route::post('/account/listings', [AccountListingController::class, 'store'])->name('account.listings.store');
    Route::post('/account/listings/draft', [AccountListingController::class, 'saveDraft'])
        ->middleware('throttle:60,1')
        ->name('account.listings.draft');
    Route::post('/account/listings/{listing}/draft', [AccountListingController::class, 'saveDraft'])
        ->middleware('throttle:60,1')
        ->name('account.listings.draft.update');
    Route::get('/account/listings/{listing}/edit', [AccountListingController::class, 'edit'])->name('account.listings.edit');
    Route::put('/account/listings/{listing}', [AccountListingController::class, 'update'])->name('account.listings.update');
    Route::delete('/account/listings/{listing}', [AccountListingController::class, 'destroy'])->name('account.listings.destroy');
    Route::post('/account/amenities', [\App\Http\Controllers\Account\AmenityController::class, 'store'])
        ->middleware('throttle:30,1')
        ->name('account.amenities.store');
    Route::post('/account/listings/editor-media', [\App\Http\Controllers\Account\EditorMediaController::class, 'store'])
        ->middleware('throttle:40,1')
        ->name('account.listings.editor-media');
    Route::get('/account/media/browse', [\App\Http\Controllers\Account\EditorMediaController::class, 'browse'])
        ->middleware('throttle:60,1')
        ->name('account.media.browse');
    Route::get('/account/places/search', [\App\Http\Controllers\Account\PlaceSearchController::class, 'search'])
        ->middleware('throttle:60,1')
        ->name('account.places.search');
    Route::get('/account/places/reverse', [\App\Http\Controllers\Account\PlaceSearchController::class, 'reverse'])
        ->middleware('throttle:60,1')
        ->name('account.places.reverse');

    Route::get('/account/billing', AccountBillingController::class)->name('account.billing');

    Route::get('/account/upgrade', [AccountUpgradeController::class, 'create'])->name('account.upgrade');
    Route::post('/account/upgrade/pay', [AccountUpgradeController::class, 'initiate'])->name('account.upgrade.pay');
    Route::post('/account/upgrade', [AccountUpgradeController::class, 'store'])->name('account.upgrade.store');
    Route::post('/account/upgrade/{upgrade}/cancel', [AccountUpgradeController::class, 'cancel'])->name('account.upgrade.cancel');

    Route::get('/account/notifications', [\App\Http\Controllers\Account\NotificationController::class, 'index'])->name('account.notifications');
    Route::post('/account/notifications/read-all', [\App\Http\Controllers\Account\NotificationController::class, 'markAllRead'])->name('account.notifications.read-all');
    Route::post('/account/notifications/{id}/read', [\App\Http\Controllers\Account\NotificationController::class, 'markRead'])->name('account.notifications.read');

    Route::get('/account/messages', [\App\Http\Controllers\Account\MessageController::class, 'index'])->name('account.messages');
    Route::post('/account/messages/read-all', [\App\Http\Controllers\Account\MessageController::class, 'markAllRead'])->name('account.messages.read-all');
    Route::delete('/account/messages/alerts/{id}', [\App\Http\Controllers\Account\MessageController::class, 'destroyAlert'])->name('account.messages.alerts.destroy');
    Route::get('/account/messages/{conversation}', [\App\Http\Controllers\Account\MessageController::class, 'show'])->name('account.messages.show');
    Route::post('/account/messages/{conversation}', [\App\Http\Controllers\Account\MessageController::class, 'reply'])->name('account.messages.reply');
    Route::delete('/account/messages/{conversation}', [\App\Http\Controllers\Account\MessageController::class, 'destroy'])->name('account.messages.destroy');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
require __DIR__.'/admin.php';
