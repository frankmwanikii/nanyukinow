<?php

namespace App\Providers;

use App\Models\Listing;
use App\Observers\ListingObserver;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Listing::observe(ListingObserver::class);
        Vite::prefetch(concurrency: 3);

        // Never let a local `public/hot` file point production at Vite dev.
        if ($this->app->environment('production')) {
            Vite::useHotFile(storage_path('framework/vite-hot-disabled'));
        }
    }
}
