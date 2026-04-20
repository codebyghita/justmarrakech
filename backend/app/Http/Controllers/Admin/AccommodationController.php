<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Accommodation;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AccommodationController extends Controller
{
    public function index()
    {
        return response()->json(Accommodation::all());
    }

    public function show(Accommodation $accommodation)
    {
        return response()->json($accommodation);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string',
            'description' => 'required|string',
            'price_per_night' => 'required|numeric',
            'type' => 'required|string',
            'images_files.*' => 'nullable|image|max:5120',
            'location' => 'nullable|string',
            'status' => 'nullable|string',
        ]);

        $imagePaths = [];
        if ($request->hasFile('images_files')) {
            foreach ($request->file('images_files') as $file) {
                $path = $file->store('accommodations', 'public');
                $imagePaths[] = '/storage/' . $path;
            }
        }
        $validated['images'] = $imagePaths;

        $validated['slug'] = Str::slug($validated['title']);

        $accommodation = Accommodation::create($validated);

        return response()->json($accommodation, 201);
    }

    public function update(Request $request, Accommodation $accommodation)
    {
        $validated = $request->validate([
            'title' => 'sometimes|string',
            'description' => 'sometimes|string',
            'price_per_night' => 'sometimes|numeric',
            'type' => 'sometimes|string',
            'images_files.*' => 'nullable|image|max:5120',
            'existing_images' => 'nullable|string', // JSON of remaining images
            'location' => 'nullable|string',
            'status' => 'nullable|string',
        ]);

        $currentImages = [];
        if ($request->has('existing_images')) {
            $currentImages = json_decode($request->existing_images, true);
        } else {
            $currentImages = $accommodation->images ?? [];
        }

        if ($request->hasFile('images_files')) {
            foreach ($request->file('images_files') as $file) {
                $path = $file->store('accommodations', 'public');
                $currentImages[] = '/storage/' . $path;
            }
        }
        $validated['images'] = $currentImages;

        if (isset($validated['title'])) {
            $validated['slug'] = Str::slug($validated['title']);
        }

        $accommodation->update($validated);

        return response()->json($accommodation);
    }

    public function destroy(Accommodation $accommodation)
    {
        $accommodation->delete();
        return response()->json(null, 204);
    }
}
