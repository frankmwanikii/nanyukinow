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
use App\Http\Controllers\Account\PremiumTrialController;
use App\Http\Controllers\Account\StayGallerySpaceController;
use App\Http\Controllers\Account\SupportTicketController as AccountSupportTicketController;
use App\Http\Controllers\Account\UpgradeController as AccountUpgradeController;
use App\Http\Controllers\ListingClaimController;
use App\Http\Controllers\ListingContactController;
use App\Http\Controllers\ListingController;
use App\Http\Controllers\ListingReportController;
use App\Http\Controllers\ListingReviewController;
use App\Http\Controllers\NewsletterController;
use App\Http\Controllers\NyukiChatController;
use App\Http\Controllers\NyukiController;
use App\Http\Controllers\PricingPageController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SitePreviewController;
use App\Http\Controllers\StoryController;
use App\Http\Controllers\Webhooks\PalplussWebhookController;
use App\Http\Controllers\Webhooks\PaypalWebhookController;
use App\Models\SitePage;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::post('/webhooks/palpluss', PalplussWebhookController::class)->name('webhooks.palpluss');
Route::post('/webhooks/paypal', PaypalWebhookController::class)->name('webhooks.paypal');
Route::get('/account/upgrade/paypal/return', PaypalReturnController::class)->name('account.upgrade.paypal.return');

Route::get('/'.trim((string) config('site.preview_path'), '/'), SitePreviewController::class)
    ->middleware('throttle:20,1')
    ->name('site.preview');

Route::get('/', [ListingController::class, 'home'])->name('home');

Route::get('/explore', [ListingController::class, 'explore'])->name('explore');

Route::get('/listings/search', [ListingController::class, 'search'])
    ->middleware('throttle:60,1')
    ->name('listings.search');

Route::get('/pricing', PricingPageController::class)->name('pricing');

Route::get('/nyuki', NyukiController::class)->name('nyuki');
Route::post('/nyuki/chat', NyukiChatController::class)
    ->middleware('throttle:12,1')
    ->name('nyuki.chat');

Route::get('/stories', [StoryController::class, 'index'])->name('stories.index');
Route::get('/stories/{slug}', [StoryController::class, 'show'])->name('stories.show');

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
    ->middleware(['auth', 'verified', 'throttle:10,1'])
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
    Route::post('/account/premium-trial/claim', [PremiumTrialController::class, 'claim'])
        ->name('account.premium-trial.claim');
    Route::post('/account/premium-trial/dismiss', [PremiumTrialController::class, 'dismiss'])
        ->name('account.premium-trial.dismiss');
    Route::get('/account/bookmarks', [AccountBookmarkController::class, 'index'])->name('account.bookmarks');
    Route::delete('/account/bookmarks', [AccountBookmarkController::class, 'destroyAll'])
        ->name('account.bookmarks.destroy-all');

    Route::get('/account/listings', [AccountListingController::class, 'index'])->name('account.listings.index');
    Route::middleware('verified')->group(function () {
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
        Route::post('/account/stay-gallery-spaces', [StayGallerySpaceController::class, 'store'])
            ->middleware('throttle:30,1')
            ->name('account.stay-gallery-spaces.store');
        Route::post('/account/listings/editor-media', [EditorMediaController::class, 'store'])
            ->middleware('throttle:40,1')
            ->name('account.listings.editor-media');
        Route::post('/account/listings/editor-video', [EditorMediaController::class, 'storeVideo'])
            ->middleware('throttle:20,1')
            ->name('account.listings.editor-video');
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
    });

    Route::get('/account/notifications', [NotificationController::class, 'index'])->name('account.notifications');
    Route::post('/account/notifications/read-all', [NotificationController::class, 'markAllRead'])->name('account.notifications.read-all');
    Route::post('/account/notifications/{id}/read', [NotificationController::class, 'markRead'])->name('account.notifications.read');

    Route::get('/account/messages', [MessageController::class, 'index'])->name('account.messages');
    Route::post('/account/messages/read-all', [MessageController::class, 'markAllRead'])->name('account.messages.read-all');
    Route::delete('/account/messages/alerts/{id}', [MessageController::class, 'destroyAlert'])->name('account.messages.alerts.destroy');
    Route::get('/account/messages/{conversation}', [MessageController::class, 'show'])->name('account.messages.show');
    Route::post('/account/messages/{conversation}', [MessageController::class, 'reply'])
        ->middleware('verified')
        ->name('account.messages.reply');
    Route::get('/account/messages/{conversation}/{message}/attachments/{index}', [MessageController::class, 'downloadAttachment'])
        ->whereNumber('index')
        ->name('account.messages.attachment');
    Route::delete('/account/messages/{conversation}', [MessageController::class, 'destroy'])->name('account.messages.destroy');

    Route::get('/account/tickets', [AccountSupportTicketController::class, 'index'])->name('account.tickets.index');
    Route::post('/account/tickets', [AccountSupportTicketController::class, 'store'])
        ->middleware('throttle:20,1')
        ->name('account.tickets.store');
    Route::get('/account/tickets/{ticket}', [AccountSupportTicketController::class, 'show'])->name('account.tickets.show');
    Route::get('/account/tickets/{ticket}/attachment', [AccountSupportTicketController::class, 'downloadAttachment'])
        ->name('account.tickets.attachment');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
require __DIR__.'/admin.php';
