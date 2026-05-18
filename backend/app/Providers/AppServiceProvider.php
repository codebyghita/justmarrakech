<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton('translator.auto', function ($app) {
            return new \App\Services\AutoTranslationService();
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Translations are now handled by the HasTranslations trait on the models themselves
        // \App\Models\Activity::observe(\App\Observers\ActivityObserver::class);
        // \App\Models\Accommodation::observe(\App\Observers\AccommodationObserver::class);
        // \App\Models\BlogPost::observe(\App\Observers\BlogPostObserver::class);
        // \App\Models\PageContent::observe(\App\Observers\PageContentObserver::class);
    }
}
