<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index()
    {
        return response()->json(ActivityCategory::orderBy('sort_order')->get());
    }

    public function show($id)
    {
        return response()->json(ActivityCategory::findOrFail($id));
    }

    public function store(Request $request)
    {
        // Handle badges if sent as string (JSON) from FormData
        if ($request->has('badges') && is_string($request->badges)) {
            $request->merge(['badges' => json_decode($request->badges, true)]);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'hero_title' => 'nullable|string',
            'hero_subtitle' => 'nullable|string',
            'hero_description' => 'nullable|string',
            'hero_support' => 'nullable|string',
            'image' => 'nullable|string',
            'badges' => 'nullable|array',
        ]);

        $data = $request->all();
        $data['slug'] = Str::slug($request->name);
        $data['status'] = 'published';

        // Handle Image Upload for new category
        if ($request->hasFile('images_files')) {
            $file = $request->file('images_files')[0] ?? $request->file('images_files');
            $path = $file->store('categories', 'public');
            $data['image'] = [
                'url' => '/storage/' . $path,
                'alt' => pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME),
                'title' => '',
                'caption' => ''
            ];
        } else if ($request->has('image') && is_array($request->image)) {
            $data['image'] = $request->image;
        }

        $category = ActivityCategory::create($data);

        return response()->json([
            'message' => 'Catégorie créée avec succès',
            'data' => $category
        ]);
    }

    public function update(Request $request, $id)
    {
        $category = ActivityCategory::findOrFail($id);

        // Pre-process numeric and ID fields
        if ($request->has('sort_order')) {
            $request->merge(['sort_order' => (int)$request->sort_order]);
        }

        // Handle badges if sent as string (JSON) from FormData
        if ($request->has('badges') && is_string($request->badges)) {
            $request->merge(['badges' => json_decode($request->badges, true)]);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'hero_title' => 'nullable|string|max:255',
            'hero_subtitle' => 'nullable|string|max:255',
            'hero_description' => 'nullable|string',
            'hero_support' => 'nullable|string',
            'image' => 'nullable|string',
            'badges' => 'nullable|array',
            'status' => 'required|in:draft,published',
            'sort_order' => 'required|integer',
        ]);

        $data = $request->all();

        // Handle Image Upload
        if ($request->hasFile('images_files')) {
            $file = $request->file('images_files')[0] ?? $request->file('images_files');
            $path = $file->store('categories', 'public');
            $data['image'] = [
                'url' => '/storage/' . $path,
                'alt' => pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME),
                'title' => '',
                'caption' => ''
            ];
        } else if ($request->has('image') && is_array($request->image)) {
            $data['image'] = $request->image;
        } else if ($request->has('existing_images')) {
            $existing = json_decode($request->existing_images, true);
            if (!empty($existing)) {
                $data['image'] = is_string($existing[0]) ? ['url' => $existing[0], 'alt' => '', 'title' => '', 'caption' => ''] : $existing[0];
            }
        }

        $category->update($data);

        return response()->json([
            'message' => 'Catégorie mise à jour avec succès',
            'data' => $category
        ]);
    }

    public function destroy($id)
    {
        $category = ActivityCategory::findOrFail($id);
        $category->delete();
        return response()->json(['message' => 'Catégorie supprimée']);
    }
}
