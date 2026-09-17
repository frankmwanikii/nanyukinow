<?php

use App\Http\Controllers\ListingController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [ListingController::class, 'home'])->name('home');

Route::get('/explore', [ListingController::class, 'explore'])->name('explore');

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

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
