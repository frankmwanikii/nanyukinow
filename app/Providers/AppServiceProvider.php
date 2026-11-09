<?php

namespace App\Providers;

use App\Http\Responses\PasskeyLoginResponse as AppPasskeyLoginResponse;
use App\Models\Listing;
use App\Models\User;
use App\Observers\ListingObserver;
use App\Passkeys\PreferClientDeviceVerificationOptions;
use App\Passkeys\PreferPlatformRegistrationOptions;
use App\Support\UserAvatar;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Laravel\Passkeys\Actions\GenerateRegistrationOptions;
use Laravel\Passkeys\Actions\GenerateVerificationOptions;
use Laravel\Passkeys\Contracts\PasskeyLoginResponse;
use Laravel\Passkeys\Events\PasskeyVerified;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(
            GenerateRegistrationOptions::class,
            PreferPlatformRegistrationOptions::class,
        );
        $this->app->bind(
            GenerateVerificationOptions::class,
            PreferClientDeviceVerificationOptions::class,
        );
        $this->app->singleton(PasskeyLoginResponse::class, AppPasskeyLoginResponse::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Listing::observe(ListingObserver::class);
        Vite::prefetch(concurrency: 3);

        Event::listen(PasskeyVerified::class, function (PasskeyVerified $event): void {
            if ($event->user instanceof User) {
                UserAvatar::clearUnusable($event->user);
            }
        });

        // Never let a local `public/hot` file point production at Vite dev.
        if ($this->app->environment('production')) {
            Vite::useHotFile(storage_path('framework/vite-hot-disabled'));
        }
    }
}
