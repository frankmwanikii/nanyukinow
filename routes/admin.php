<?php

use App\Http\Controllers\Account\EditorMediaController;
use App\Http\Controllers\Admin\AuthController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\CategorySubcategoryController;
use App\Http\Controllers\Admin\ClaimController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\FinanceController;
use App\Http\Controllers\Admin\GalleryController;
use App\Http\Controllers\Admin\HeroSliderController;
use App\Http\Controllers\Admin\ListingController;
use App\Http\Controllers\Admin\ListingEditLockController;
use App\Http\Controllers\Admin\LocationController;
use App\Http\Controllers\Admin\MessageController;
use App\Http\Controllers\Admin\PageController;
use App\Http\Controllers\Admin\PricingController;
use App\Http\Controllers\Admin\ProfileController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\SearchController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\StoryCategoryController;
use App\Http\Controllers\Admin\StoryController;
use App\Http\Controllers\Admin\SupportTicketController;
use App\Http\Controllers\Admin\UserController;
use Illuminate\Support\Facades\Route;

Route::prefix('admin')->name('admin.')->group(function () {
    Route::get('login', [AuthController::class, 'create'])->name('login');
    Route::post('login', [AuthController::class, 'store'])->name('login.store');

    Route::middleware(['auth', 'admin'])->group(function () {
        Route::post('logout', [AuthController::class, 'destroy'])->name('logout');
        Route::get('/', DashboardController::class)->name('dashboard');

        Route::get('search', [SearchController::class, 'index'])->name('search');
        Route::get('search/suggest', [SearchController::class, 'suggest'])
            ->middleware('throttle:60,1')
            ->name('search.suggest');

        Route::get('profile', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::put('profile', [ProfileController::class, 'update'])->name('profile.update');
        Route::put('profile/password', [ProfileController::class, 'updatePassword'])->name('profile.password');

        Route::get('listings', [ListingController::class, 'index'])->name('listings.index');
        Route::get('listings/create', [ListingController::class, 'create'])->name('listings.create');
        Route::post('listings/draft', [ListingController::class, 'saveDraft'])->name('listings.draft');
        Route::post('listings/{listing:slug}/draft', [ListingController::class, 'saveDraft'])->name('listings.draft.update');
        Route::post('listings', [ListingController::class, 'store'])->name('listings.store');
        Route::get('listings/{listing:slug}/edit', [ListingController::class, 'edit'])->name('listings.edit');
        Route::put('listings/{listing:slug}', [ListingController::class, 'update'])->name('listings.update');
        Route::delete('listings/{listing:slug}', [ListingController::class, 'destroy'])->name('listings.destroy');
        Route::post('listings/{listing:slug}/edit-lock', [ListingEditLockController::class, 'store'])
            ->middleware('throttle:60,1')
            ->name('listings.edit-lock');
        Route::post('listings/{listing:slug}/edit-lock/release', [ListingEditLockController::class, 'destroy'])
            ->middleware('throttle:60,1')
            ->name('listings.edit-lock.release');
        Route::post('listings/bulk', [ListingController::class, 'bulk'])->name('listings.bulk');
        Route::post('listings/editor-media', [EditorMediaController::class, 'store'])
            ->middleware('throttle:40,1')
            ->name('listings.editor-media');
        Route::post('listings/editor-video', [EditorMediaController::class, 'storeVideo'])
            ->middleware('throttle:20,1')
            ->name('listings.editor-video');

        Route::get('claims', [ClaimController::class, 'index'])->name('claims.index');
        Route::get('claims/{claim}', [ClaimController::class, 'show'])->name('claims.show');
        Route::post('claims/{claim}/approve', [ClaimController::class, 'approve'])->name('claims.approve');
        Route::post('claims/{claim}/reject', [ClaimController::class, 'reject'])->name('claims.reject');
        Route::post('claims/{claim}/reopen', [ClaimController::class, 'reopen'])->name('claims.reopen');
        Route::delete('claims/{claim}', [ClaimController::class, 'destroy'])->name('claims.destroy');

        Route::get('reports', [ReportController::class, 'index'])->name('reports.index');
        Route::get('reports/{report}', [ReportController::class, 'show'])->name('reports.show');
        Route::post('reports/{report}/resolve', [ReportController::class, 'resolve'])->name('reports.resolve');
        Route::delete('reports/{report}', [ReportController::class, 'destroy'])->name('reports.destroy');

        Route::get('categories', [CategoryController::class, 'index'])->name('categories.index');
        Route::get('categories/create', [CategoryController::class, 'create'])->name('categories.create');
        Route::post('categories', [CategoryController::class, 'store'])->name('categories.store');
        Route::get('categories/{category}/edit', [CategoryController::class, 'edit'])->name('categories.edit');
        Route::get('categories/{category}/listings', [CategoryController::class, 'listings'])->name('categories.listings');
        Route::get('categories/{category}/subcategories', [CategorySubcategoryController::class, 'index'])->name('categories.subcategories.index');
        Route::post('categories/{category}/subcategories', [CategorySubcategoryController::class, 'store'])->name('categories.subcategories.store');
        Route::put('categories/{category}/subcategories/{subcategory}', [CategorySubcategoryController::class, 'update'])->name('categories.subcategories.update');
        Route::delete('categories/{category}/subcategories/{subcategory}', [CategorySubcategoryController::class, 'destroy'])->name('categories.subcategories.destroy');
        Route::put('categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
        Route::delete('categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');
        Route::post('categories/reorder', [CategoryController::class, 'reorder'])->name('categories.reorder');

        Route::get('locations', [LocationController::class, 'index'])->name('locations.index');
        Route::post('locations', [LocationController::class, 'store'])->name('locations.store');
        Route::get('locations/{location}/listings', [LocationController::class, 'listings'])->name('locations.listings');
        Route::put('locations/{location}', [LocationController::class, 'update'])->name('locations.update');
        Route::delete('locations/{location}', [LocationController::class, 'destroy'])->name('locations.destroy');

        Route::get('users', [UserController::class, 'index'])->name('users.index');
        Route::post('users', [UserController::class, 'store'])->name('users.store');
        Route::get('users/{user}', [UserController::class, 'show'])->name('users.show');
        Route::put('users/{user}', [UserController::class, 'update'])->name('users.update');
        Route::delete('users/{user}', [UserController::class, 'destroy'])->name('users.destroy');

        Route::get('messages', [MessageController::class, 'index'])->name('messages.index');
        Route::post('messages', [MessageController::class, 'store'])->name('messages.store');
        Route::post('messages/read-all', [MessageController::class, 'readAll'])->name('messages.read-all');
        Route::post('messages/star', [MessageController::class, 'star'])->name('messages.star');
        Route::post('messages/label', [MessageController::class, 'label'])->name('messages.label');
        Route::post('messages/delete', [MessageController::class, 'destroy'])->name('messages.destroy');

        Route::get('tickets', [SupportTicketController::class, 'index'])->name('tickets.index');
        Route::get('tickets/{ticket}', [SupportTicketController::class, 'show'])->name('tickets.show');
        Route::post('tickets/{ticket}/reply', [SupportTicketController::class, 'reply'])->name('tickets.reply');
        Route::post('tickets/{ticket}/close', [SupportTicketController::class, 'close'])->name('tickets.close');
        Route::post('tickets/{ticket}/reopen', [SupportTicketController::class, 'reopen'])->name('tickets.reopen');
        Route::delete('tickets/{ticket}', [SupportTicketController::class, 'destroy'])->name('tickets.destroy');
        Route::get('tickets/{ticket}/attachment', [SupportTicketController::class, 'downloadAttachment'])
            ->name('tickets.attachment');

        Route::get('stories', [StoryController::class, 'index'])->name('stories.index');
        Route::get('stories/create', [StoryController::class, 'create'])->name('stories.create');
        Route::post('stories', [StoryController::class, 'store'])->name('stories.store');
        Route::post('stories/upload', [StoryController::class, 'upload'])
            ->middleware('throttle:40,1')
            ->name('stories.upload');
        Route::get('stories/{story}/edit', [StoryController::class, 'edit'])->name('stories.edit');
        Route::put('stories/{story}', [StoryController::class, 'update'])->name('stories.update');
        Route::delete('stories/{story}', [StoryController::class, 'destroy'])->name('stories.destroy');

        Route::get('story-categories', [StoryCategoryController::class, 'index'])->name('story-categories.index');
        Route::post('story-categories', [StoryCategoryController::class, 'store'])->name('story-categories.store');
        Route::put('story-categories/{storyCategory}', [StoryCategoryController::class, 'update'])->name('story-categories.update');
        Route::delete('story-categories/{storyCategory}', [StoryCategoryController::class, 'destroy'])->name('story-categories.destroy');
        Route::post('story-categories/reorder', [StoryCategoryController::class, 'reorder'])->name('story-categories.reorder');

        Route::get('gallery', [GalleryController::class, 'index'])->name('gallery.index');
        Route::get('gallery/browse', [GalleryController::class, 'browse'])->name('gallery.browse');
        Route::post('gallery', [GalleryController::class, 'store'])->name('gallery.store');
        Route::delete('gallery', [GalleryController::class, 'destroy'])->name('gallery.destroy');
        Route::post('gallery/bulk-delete', [GalleryController::class, 'bulkDestroy'])->name('gallery.bulk-destroy');

        Route::get('hero-slider', [HeroSliderController::class, 'index'])->name('hero-slider.index');
        Route::put('hero-slider', [HeroSliderController::class, 'update'])->name('hero-slider.update');
        Route::post('hero-slider/upload', [HeroSliderController::class, 'upload'])
            ->middleware('throttle:40,1')
            ->name('hero-slider.upload');

        Route::get('pricing', [PricingController::class, 'index'])->name('pricing.index');
        Route::get('pricing/{pricing}/edit', [PricingController::class, 'edit'])->name('pricing.edit');
        Route::put('pricing/{pricing}', [PricingController::class, 'update'])->name('pricing.update');
        Route::delete('pricing/{pricing}', [PricingController::class, 'destroy'])->name('pricing.destroy');

        Route::get('finance', [FinanceController::class, 'index'])->name('finance.index');
        Route::post('finance/{upgrade}/approve', [FinanceController::class, 'approve'])->name('finance.approve');
        Route::post('finance/{upgrade}/reject', [FinanceController::class, 'reject'])->name('finance.reject');
        Route::post('finance/assign-plan', [FinanceController::class, 'updateUserPlan'])->name('finance.assign');

        // Legacy upgrade URLs / names (tests + bookmarks)
        Route::redirect('upgrades', '/admin/finance');
        Route::post('upgrades/{upgrade}/approve', [FinanceController::class, 'approve'])->name('upgrades.approve');
        Route::post('upgrades/{upgrade}/reject', [FinanceController::class, 'reject'])->name('upgrades.reject');
        Route::post('upgrades/assign-plan', [FinanceController::class, 'updateUserPlan'])->name('upgrades.assign');

        Route::get('pages', [PageController::class, 'index'])->name('pages.index');
        Route::get('pages/{page}/edit', [PageController::class, 'edit'])->name('pages.edit');
        Route::put('pages/{page}', [PageController::class, 'update'])->name('pages.update');

        Route::get('settings', [SettingController::class, 'index'])->name('settings.index');
        Route::put('settings', [SettingController::class, 'update'])->name('settings.update');
    });
});
