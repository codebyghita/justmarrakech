<?php

use Illuminate\Support\Facades\Route;
use App\Models\Testimonial;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Admin\ActivityController;
use App\Http\Controllers\Admin\AccommodationController;
use App\Http\Controllers\Admin\CalendarController;
use App\Http\Controllers\PublicCmsController;
use App\Http\Controllers\PublicReviewController;
use App\Http\Controllers\Admin\CmsController;
use App\Http\Controllers\Admin\ReviewController;
use App\Http\Controllers\Admin\SiteSettingController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\BlogPostController;
use App\Http\Controllers\PublicBlogController;
use App\Http\Controllers\Admin\MediaController;

// Public Endpoints (Consumed by React Frontend)
Route::get('/public/activities', function() {
    return response()->json(App\Models\Activity::with(['translations', 'activityCategory'])->get());
});

Route::get('/public/activities/{id}', function($id) {
    return response()->json(
        App\Models\Activity::with(['translations', 'activityCategory'])
            ->where('id', $id)
            ->orWhere('slug', $id)
            ->firstOrFail()
    );
});

Route::get('/public/accommodations', function() {
    return response()->json(App\Models\Accommodation::with('translations')->get());
});

Route::get('/public/accommodations/{id}', function($id) {
    return response()->json(
        App\Models\Accommodation::with('translations')
            ->where('id', $id)
            ->orWhere('slug', $id)
            ->firstOrFail()
    );
});

Route::get('/public/testimonials', function() {
    return response()->json(Testimonial::all());
});

Route::get('/public/unavailable_dates', [CalendarController::class, 'index']);

// CMS & Settings Public
Route::get('/public/settings', [PublicCmsController::class, 'getSettings']);
Route::get('/public/categories', [PublicCmsController::class, 'getCategories']);
Route::get('/public/content/{section}', [PublicCmsController::class, 'getPageContent']);

// Reviews Public
Route::get('/public/reviews', [PublicReviewController::class, 'index']);
Route::post('/public/reviews', [PublicReviewController::class, 'store']);

// Blog & Newsletter Public
Route::get('/public/blog', [PublicBlogController::class, 'index']);
Route::get('/public/blog/{slug}', [PublicBlogController::class, 'show']);
Route::post('/public/newsletter', [\App\Http\Controllers\NewsletterSubscriberController::class, 'subscribe']);

// Authentication
Route::post('/login', [AuthController::class, 'login']);

// Protected Admin Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/admin/update-account', [AuthController::class, 'updateAccount']);
    
    // CRUD APIS
    Route::apiResource('admin/activities', ActivityController::class);
    Route::apiResource('admin/accommodations', AccommodationController::class);
    Route::apiResource('admin/categories', CategoryController::class);
    Route::apiResource('admin/blog', BlogPostController::class);
    
    // CMS & Settings Admin
    Route::get('admin/settings', [SiteSettingController::class, 'index']);
    Route::post('admin/settings', [SiteSettingController::class, 'update']);
    Route::get('admin/cms', [CmsController::class, 'index']);
    Route::post('admin/cms', [CmsController::class, 'store']);
    Route::put('admin/cms/{id}', [CmsController::class, 'update']);
    
    // Reviews Admin
    Route::get('admin/reviews', [ReviewController::class, 'index']);
    Route::put('admin/reviews/{id}/status', [ReviewController::class, 'updateStatus']);
    Route::delete('admin/reviews/{id}', [ReviewController::class, 'destroy']);
    
    // Calendar Management
    Route::get('admin/calendar', [CalendarController::class, 'index']);
    Route::post('admin/calendar', [CalendarController::class, 'store']);
    Route::delete('admin/calendar/{id}', [CalendarController::class, 'destroy']);

    // Media Library
    Route::get('admin/media', [MediaController::class, 'index']);
    Route::post('admin/media', [MediaController::class, 'store']);
    Route::post('admin/translate-all', [SiteSettingController::class, 'translateAll']);
    Route::put('admin/media/{media}', [MediaController::class, 'update']);
    Route::delete('admin/media', [MediaController::class, 'destroy']);

    // Generic Image Upload (Sur Mesure gallery, cards, etc.)
    Route::post('admin/upload-image', function (\Illuminate\Http\Request $request) {
        $request->validate(['images_files.*' => 'required|image|max:8192']);
        $paths = [];
        if ($request->hasFile('images_files')) {
            foreach ($request->file('images_files') as $file) {
                $path = $file->store('sur_mesure', 'public');
                $paths[] = '/storage/' . $path;
            }
        }
        // Also handle single file
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('sur_mesure', 'public');
            $paths[] = '/storage/' . $path;
        }
        return response()->json([
            'paths' => $paths,
            'path'  => $paths[0] ?? null,
        ]);
    });

});

