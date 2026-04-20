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

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'hero_title' => 'nullable|string',
            'hero_subtitle' => 'nullable|string',
            'hero_description' => 'nullable|string',
            'hero_support' => 'nullable|string',
            'image' => 'nullable|string',
            'badges' => 'nullable|array',
        ]);

        $category = ActivityCategory::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'hero_title' => $request->hero_title,
            'hero_subtitle' => $request->hero_subtitle,
            'hero_description' => $request->hero_description,
            'hero_support' => $request->hero_support,
            'image' => $request->image,
            'badges' => $request->badges,
            'status' => 'published',
        ]);

        return response()->json([
            'message' => 'Catégorie créée avec succès',
            'data' => $category
        ]);
    }

    public function update(Request $request, $id)
    {
        $category = ActivityCategory::findOrFail($id);

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

        $category->update($request->all());

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
