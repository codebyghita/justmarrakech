<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

// --- DÉBUT DE LA SOLUTION HOSTINGER POUR LES IMAGES ---
Route::get('/storage/{path}', function ($path) {
    $absolutePath = storage_path('app/public/' . $path);
    if (!\Illuminate\Support\Facades\File::exists($absolutePath)) {
        abort(404);
    }
    $file = \Illuminate\Support\Facades\File::get($absolutePath);
    $type = \Illuminate\Support\Facades\File::mimeType($absolutePath);
    return response($file, 200)
        ->header("Content-Type", $type)
        ->header("Cache-Control", "max-age=2592000, public");
})->where('path', '.*');
// --- FIN DE LA SOLUTION ---

Route::get('/', function () {
    return response(file_get_contents(public_path('index.html')))->header('Content-Type', 'text/html');
});

Route::fallback(function (Request $request) {
    if ($request->is('api/*')) {
        return response()->json(['message' => 'Not Found'], 404);
    }
    return response(file_get_contents(public_path('index.html')))->header('Content-Type', 'text/html');
});
