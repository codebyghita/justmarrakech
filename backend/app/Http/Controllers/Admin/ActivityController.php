<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ActivityController extends Controller
{
    public function index()
    {
        return response()->json(Activity::with('activityCategory')->get());
    }

    public function show(Activity $activity)
    {
        return response()->json($activity);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string',
            'description' => 'required|string',
            'full_description' => 'nullable|string',
            'price_from' => 'required|numeric',
            'duration' => 'nullable|string',
            'activity_category_id' => 'nullable|exists:activity_categories,id',
            'featured' => 'nullable|boolean',
            'images_files.*' => 'nullable|image|max:5120',
            'included' => 'nullable|string', // JSON string
            'not_included' => 'nullable|string', // JSON string
            'formulas' => 'nullable|string', // JSON string
            'faq' => 'nullable|string', // JSON string
            'practical_info_points' => 'nullable|string', // JSON string
            'location' => 'nullable|string',
            'group_size' => 'nullable|string',
            'status' => 'nullable|string',
        ]);

        $imagePaths = [];
        if ($request->hasFile('images_files')) {
            foreach ($request->file('images_files') as $file) {
                $path = $file->store('activities', 'public');
                $imagePaths[] = '/storage/' . $path;
            }
        }
        $validated['images'] = $imagePaths;

        if ($request->has('included')) $validated['included'] = json_decode($request->included, true);
        if ($request->has('not_included')) $validated['not_included'] = json_decode($request->not_included, true);
        if ($request->has('formulas')) $validated['formulas'] = json_decode($request->formulas, true);
        if ($request->has('faq')) $validated['faq'] = json_decode($request->faq, true);
        if ($request->has('practical_info_points')) $validated['practical_info_points'] = json_decode($request->practical_info_points, true);

        $validated['slug'] = Str::slug($validated['title']);

        $activity = Activity::create($validated);

        return response()->json($activity, 201);
    }

    public function update(Request $request, Activity $activity)
    {
        $validated = $request->validate([
            'title' => 'sometimes|string',
            'description' => 'sometimes|string',
            'full_description' => 'nullable|string',
            'price_from' => 'sometimes|numeric',
            'duration' => 'nullable|string',
            'activity_category_id' => 'nullable|exists:activity_categories,id',
            'featured' => 'nullable|boolean',
            'images_files.*' => 'nullable|image|max:5120',
            'existing_images' => 'nullable|string',
            'included' => 'nullable|string',
            'not_included' => 'nullable|string',
            'formulas' => 'nullable|string',
            'faq' => 'nullable|string',
            'practical_info_points' => 'nullable|string',
            'location' => 'nullable|string',
            'group_size' => 'nullable|string',
            'status' => 'nullable|string',
        ]);

        $currentImages = [];
        if ($request->has('existing_images')) {
            $currentImages = json_decode($request->existing_images, true);
        } else {
            $currentImages = $activity->images ?? [];
        }

        if ($request->hasFile('images_files')) {
            foreach ($request->file('images_files') as $file) {
                $path = $file->store('activities', 'public');
                $currentImages[] = '/storage/' . $path;
            }
        }
        $validated['images'] = $currentImages;

        if ($request->has('included')) $validated['included'] = json_decode($request->included, true);
        if ($request->has('not_included')) $validated['not_included'] = json_decode($request->not_included, true);
        if ($request->has('formulas')) $validated['formulas'] = json_decode($request->formulas, true);
        if ($request->has('faq')) $validated['faq'] = json_decode($request->faq, true);
        if ($request->has('practical_info_points')) $validated['practical_info_points'] = json_decode($request->practical_info_points, true);

        if (isset($validated['title'])) {
            $validated['slug'] = Str::slug($validated['title']);
        }

        $activity->update($validated);

        return response()->json($activity);
    }

    public function destroy(Activity $activity)
    {
        $activity->delete();
        return response()->json(null, 204);
    }
}
