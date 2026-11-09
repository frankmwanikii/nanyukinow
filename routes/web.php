<?php

use App\Http\Controllers\Account\AmenityController;
use App\Http\Controllers\Account\BillingController as AccountBillingController;
use App\Http\Controllers\Account\BookmarkController as AccountBookmarkController;
use App\Http\Controllers\Account\DashboardController as AccountDashboardController;
use App\Http\Controllers\Account\EditorMediaController;
use App\Http\Controllers\Account\ListingController as AccountListingController;
use App\Http\Controllers\Account\MessageController;
use App\Http\Controllers\Account\NotificationController;
use App\Http\Controllers\Account\PaypalReturnController;
use App\Http\Controllers\Account\PlaceSearchController;
use App\Http\Controllers\Account\UpgradeController as AccountUpgradeController;
use App\Http\Controllers\ListingClaimController;
use App\Http\Controllers\ListingContactController;
use App\Http\Controllers\ListingController;
use App\Http\Controllers\ListingReportController;
use App\Http\Controllers\ListingReviewController;
use App\Http\Controllers\NewsletterController;
use App\Http\Controllers\NyukiController;
use App\Http\Controllers\PricingPageController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Webhooks\PalplussWebhookController;
use App\Http\Controllers\Webhooks\PaypalWebhookController;
use App\Models\SitePage;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::post('/webhooks/palpluss', PalplussWebhookController::class)->name('webhooks.palpluss');
Route::post('/webhooks/paypal', PaypalWebhookController::class)->name('webhooks.paypal');
Route::get('/account/upgrade/paypal/return', PaypalReturnController::class)->name('account.upgrade.paypal.return');

Route::get('/', [ListingController::class, 'home'])->name('home');

Route::get('/explore', [ListingController::class, 'explore'])->name('explore');

Route::get('/listings/search', [ListingController::class, 'search'])
    ->middleware('throttle:60,1')
    ->name('listings.search');

Route::get('/pricing', PricingPageController::class)->name('pricing');

Route::get('/nyuki', NyukiController::class)->name('nyuki');

Route::get('/stories', function () {
    return Inertia::render('Stories/Index', [
        'category' => request()->string('category')->toString() ?: null,
        'q' => request()->string('q')->toString() ?: null,
        'page' => SitePage::findBySlug('stories')?->toPublicArray(),
    ]);
})->name('stories.index');

Route::get('/stories/{slug}', function (string $slug) {
    return Inertia::render('Stories/Show', [
        'slug' => $slug,
    ]);
})->name('stories.show');

Route::get('/listings/{slug}', [ListingController::class, 'show'])->name('listings.show');
Route::get('/listings/{slug}/visit', [ListingController::class, 'visit'])
    ->name('listings.visit');
Route::post('/listings/{listing:slug}/like', [ListingController::class, 'like'])
    ->middleware('throttle:30,1')
    ->name('listings.like');
Route::post('/listings/{listing:slug}/bookmark', [ListingController::class, 'bookmark'])
    ->middleware(['auth', 'throttle:30,1'])
    ->name('listings.bookmark');
Route::post('/listings/{listing:slug}/contact', [ListingContactController::class, 'store'])
    ->middleware('throttle:10,1')
    ->name('listings.contact');
Route::post('/newsletter', [NewsletterController::class, 'store'])
    ->middleware('throttle:10,1')
    ->name('newsletter.subscribe');
Route::post('/listings/{listing:slug}/claim', [ListingClaimController::class, 'store'])
    ->middleware('throttle:8,1')
    ->name('listings.claim');
Route::post('/listings/{listing:slug}/report', [ListingReportController::class, 'store'])
    ->middleware('throttle:8,1')
    ->name('listings.report');
Route::post('/listings/{listing:slug}/reviews', [ListingReviewController::class, 'store'])
    ->middleware(['auth', 'throttle:10,1'])
    ->name('listings.reviews.store');

Route::get('/terms', function () {
    return Inertia::render('Terms', [
        'page' => SitePage::findBySlug('terms')?->toPublicArray(),
    ]);
})->name('terms');

Route::get('/privacy', function () {
    return Inertia::render('Privacy', [
        'page' => SitePage::findBySlug('privacy')?->toPublicArray(),
    ]);
})->name('privacy');

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', function () {
        return redirect()->route('account.index');
    })->name('dashboard');

    Route::get('/account', AccountDashboardController::class)->name('account.index');
    Route::get('/account/bookmarks', AccountBookmarkController::class)->name('account.bookmarks');

    Route::get('/account/listings', [AccountListingController::class, 'index'])->name('account.listings.index');
    Route::get('/account/listings/create', [AccountListingController::class, 'create'])->name('account.listings.create');
    Route::post('/account/listings', [AccountListingController::class, 'store'])->name('account.listings.store');
    Route::post('/account/listings/draft', [AccountListingController::class, 'saveDraft'])
        ->middleware('throttle:60,1')
        ->name('account.listings.draft');
    Route::post('/account/listings/{listing:slug}/draft', [AccountListingController::class, 'saveDraft'])
        ->middleware('throttle:60,1')
        ->name('account.listings.draft.update');
    Route::get('/account/listings/{listing:slug}/edit', [AccountListingController::class, 'edit'])->name('account.listings.edit');
    Route::put('/account/listings/{listing:slug}', [AccountListingController::class, 'update'])->name('account.listings.update');
    Route::delete('/account/listings/{listing:slug}', [AccountListingController::class, 'destroy'])->name('account.listings.destroy');
    Route::post('/account/amenities', [AmenityController::class, 'store'])
        ->middleware('throttle:30,1')
        ->name('account.amenities.store');
    Route::post('/account/listings/editor-media', [EditorMediaController::class, 'store'])
        ->middleware('throttle:40,1')
        ->name('account.listings.editor-media');
    Route::get('/account/media/browse', [EditorMediaController::class, 'browse'])
        ->middleware('throttle:60,1')
        ->name('account.media.browse');
    Route::get('/account/places/search', [PlaceSearchController::class, 'search'])
        ->middleware('throttle:60,1')
        ->name('account.places.search');
    Route::get('/account/places/reverse', [PlaceSearchController::class, 'reverse'])
        ->middleware('throttle:60,1')
        ->name('account.places.reverse');

    Route::get('/account/billing', AccountBillingController::class)->name('account.billing');

    Route::get('/account/upgrade', [AccountUpgradeController::class, 'create'])->name('account.upgrade');
    Route::get('/account/upgrade/status', [AccountUpgradeController::class, 'status'])->name('account.upgrade.status');
    Route::post('/account/upgrade/pay', [AccountUpgradeController::class, 'initiate'])->name('account.upgrade.pay');
    Route::post('/account/upgrade', [AccountUpgradeController::class, 'store'])->name('account.upgrade.store');
    Route::post('/account/upgrade/{upgrade}/cancel', [AccountUpgradeController::class, 'cancel'])->name('account.upgrade.cancel');

    Route::get('/account/notifications', [NotificationController::class, 'index'])->name('account.notifications');
    Route::post('/account/notifications/read-all', [NotificationController::class, 'markAllRead'])->name('account.notifications.read-all');
    Route::post('/account/notifications/{id}/read', [NotificationController::class, 'markRead'])->name('account.notifications.read');

    Route::get('/account/messages', [MessageController::class, 'index'])->name('account.messages');
    Route::post('/account/messages/read-all', [MessageController::class, 'markAllRead'])->name('account.messages.read-all');
    Route::delete('/account/messages/alerts/{id}', [MessageController::class, 'destroyAlert'])->name('account.messages.alerts.destroy');
    Route::get('/account/messages/{conversation}', [MessageController::class, 'show'])->name('account.messages.show');
    Route::post('/account/messages/{conversation}', [MessageController::class, 'reply'])->name('account.messages.reply');
    Route::delete('/account/messages/{conversation}', [MessageController::class, 'destroy'])->name('account.messages.destroy');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
require __DIR__.'/admin.php';
