<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Home');
})->name('home');

Route::get('/explore', function () {
    $location = request()->string('location')->toString() ?: null;
    $allowed = ['Nanyuki', 'Timau', 'Naromoru'];

    return Inertia::render('Explore', [
        'category' => request()->string('category')->toString() ?: null,
        'subcategory' => request()->string('subcategory')->toString() ?: null,
        'propertyType' => request()->string('propertyType')->toString() ?: null,
        'q' => request()->string('q')->toString() ?: null,
        'location' => in_array($location, $allowed, true) ? $location : null,
    ]);
})->name('explore');

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

Route::get('/listings/{slug}', function (string $slug) {
    return Inertia::render('Listings/Show', [
        'slug' => $slug,
    ]);
})->name('listings.show');

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
