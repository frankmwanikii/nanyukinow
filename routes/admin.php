<?php

use App\Http\Controllers\Admin\AuthController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\ListingController;
use App\Http\Controllers\Admin\LocationController;
use App\Http\Controllers\Admin\PageController;
use App\Http\Controllers\Admin\PricingController;
use App\Http\Controllers\Admin\ProfileController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\StoryController;
use App\Http\Controllers\Admin\UpgradeController;
use App\Http\Controllers\Admin\UserController;
use Illuminate\Support\Facades\Route;

Route::prefix('admin')->name('admin.')->group(function () {
    Route::get('login', [AuthController::class, 'create'])->name('login');
    Route::post('login', [AuthController::class, 'store'])->name('login.store');

    Route::middleware(['auth', 'admin'])->group(function () {
        Route::post('logout', [AuthController::class, 'destroy'])->name('logout');
        Route::get('/', DashboardController::class)->name('dashboard');

        Route::get('profile', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::put('profile', [ProfileController::class, 'update'])->name('profile.update');
        Route::put('profile/password', [ProfileController::class, 'updatePassword'])->name('profile.password');

        Route::get('listings', [ListingController::class, 'index'])->name('listings.index');
        Route::get('listings/create', [ListingController::class, 'create'])->name('listings.create');
        Route::post('listings', [ListingController::class, 'store'])->name('listings.store');
        Route::get('listings/{listing}/edit', [ListingController::class, 'edit'])->name('listings.edit');
        Route::put('listings/{listing}', [ListingController::class, 'update'])->name('listings.update');
        Route::delete('listings/{listing}', [ListingController::class, 'destroy'])->name('listings.destroy');
        Route::post('listings/bulk', [ListingController::class, 'bulk'])->name('listings.bulk');

        Route::get('categories', [CategoryController::class, 'index'])->name('categories.index');
        Route::post('categories', [CategoryController::class, 'store'])->name('categories.store');
        Route::put('categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
        Route::delete('categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');
        Route::post('categories/reorder', [CategoryController::class, 'reorder'])->name('categories.reorder');

        Route::get('locations', [LocationController::class, 'index'])->name('locations.index');
        Route::post('locations', [LocationController::class, 'store'])->name('locations.store');
        Route::put('locations/{location}', [LocationController::class, 'update'])->name('locations.update');
        Route::delete('locations/{location}', [LocationController::class, 'destroy'])->name('locations.destroy');

        Route::get('users', [UserController::class, 'index'])->name('users.index');
        Route::post('users', [UserController::class, 'store'])->name('users.store');
        Route::put('users/{user}', [UserController::class, 'update'])->name('users.update');
        Route::delete('users/{user}', [UserController::class, 'destroy'])->name('users.destroy');

        Route::get('stories', [StoryController::class, 'index'])->name('stories.index');
        Route::get('stories/create', [StoryController::class, 'create'])->name('stories.create');
        Route::post('stories', [StoryController::class, 'store'])->name('stories.store');
        Route::get('stories/{story}/edit', [StoryController::class, 'edit'])->name('stories.edit');
        Route::put('stories/{story}', [StoryController::class, 'update'])->name('stories.update');
        Route::delete('stories/{story}', [StoryController::class, 'destroy'])->name('stories.destroy');

        Route::get('pricing', [PricingController::class, 'index'])->name('pricing.index');
        Route::put('pricing/{pricing}', [PricingController::class, 'update'])->name('pricing.update');
        Route::delete('pricing/{pricing}', [PricingController::class, 'destroy'])->name('pricing.destroy');

        Route::get('upgrades', [UpgradeController::class, 'index'])->name('upgrades.index');
        Route::post('upgrades/{upgrade}/approve', [UpgradeController::class, 'approve'])->name('upgrades.approve');
        Route::post('upgrades/{upgrade}/reject', [UpgradeController::class, 'reject'])->name('upgrades.reject');
        Route::post('upgrades/assign-plan', [UpgradeController::class, 'updateUserPlan'])->name('upgrades.assign');

        Route::get('pages', [PageController::class, 'index'])->name('pages.index');
        Route::get('pages/{page}/edit', [PageController::class, 'edit'])->name('pages.edit');
        Route::put('pages/{page}', [PageController::class, 'update'])->name('pages.update');

        Route::get('settings', [SettingController::class, 'index'])->name('settings.index');
        Route::put('settings', [SettingController::class, 'update'])->name('settings.update');
    });
});
