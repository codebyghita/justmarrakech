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
        // Pre-process numeric and ID fields to handle empty strings or 'null' strings from frontend
        $numericFields = ['max_persons', 'activity_category_id', 'price_from'];
        foreach ($numericFields as $field) {
            if ($request->{$field} === '' || $request->{$field} === 'null' || $request->{$field} === 'undefined') {
                $request->merge([$field => ($field === 'price_from' ? 0 : null)]);
            } else if ($request->has($field)) {
                $val = str_replace(',', '.', (string) $request->{$field});
                $request->merge([$field => is_numeric($val) ? (float) $val : $val]);
            }
        }

        // Sanitize all string fields: never save literal "null"/"undefined" strings from frontend
        $stringFields = ['title', 'description', 'full_description', 'duration', 'location',
            'group_size', 'status', 'meta_description', 'location_address', 'google_maps_url',
            'highlights', 'whatsapp_link', 'experience_details', 'detailed_info'];
        foreach ($stringFields as $field) {
            if ($request->{$field} === 'null' || $request->{$field} === 'undefined') {
                $request->merge([$field => '']);
            }
        }

        // Pre-process booleans
        $boolFields = ['featured', 'is_blocking_enabled', 'is_active'];
        foreach ($boolFields as $field) {
            if ($request->has($field)) {
                $request->merge([$field => filter_var($request->{$field}, FILTER_VALIDATE_BOOLEAN)]);
            }
        }

        $validated = $request->validate([
            'title' => 'required|string',
            'description' => 'required|string',
            'full_description' => 'nullable|string',
            'price_from' => 'required|numeric',
            'duration' => 'nullable|string',
            'activity_category_id' => 'nullable',
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
            'price_type' => 'nullable|in:person,group',
            'max_persons' => 'nullable|numeric',
            'meta_description' => 'nullable|string',
            'location_address' => 'nullable|string',
            'google_maps_url' => 'nullable|string',
            'is_blocking_enabled' => 'nullable|boolean',
            'pricing_details' => 'nullable|string',
            'experience_details' => 'nullable|string',
            'detailed_info' => 'nullable|string',
            'timeline' => 'nullable|string',
        ]);

        $imagePaths = [];
        if ($request->has('existing_images')) {
            $imagePaths = json_decode($request->existing_images, true);
        }

        if ($request->hasFile('images_files')) {
            foreach ($request->file('images_files') as $file) {
                $path = $file->store('activities', 'public');
                $imagePaths[] = [
                    'url' => '/storage/' . $path,
                    'alt' => pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME),
                    'title' => '',
                    'caption' => ''
                ];
            }
        }
        $validated['images'] = $imagePaths;

        if ($request->has('included'))
            $validated['included'] = json_decode($request->included, true);
        if ($request->has('not_included'))
            $validated['not_included'] = json_decode($request->not_included, true);
        if ($request->has('formulas'))
            $validated['formulas'] = json_decode($request->formulas, true);
        if ($request->has('faq'))
            $validated['faq'] = json_decode($request->faq, true);
        if ($request->has('practical_info_points'))
            $validated['practical_info_points'] = json_decode($request->practical_info_points, true);
        if ($request->has('pricing_details'))
            $validated['pricing_details'] = json_decode($request->pricing_details, true);
        if ($request->has('timeline'))
            $validated['timeline'] = json_decode($request->timeline, true);

        $validated['slug'] = Str::slug($validated['title']);

        $activity = Activity::create($validated);

        return response()->json($activity, 201);
    }

    public function update(Request $request, Activity $activity)
    {
        // Pre-process numeric and ID fields to handle empty strings or 'null' strings from frontend
        $numericFields = ['max_persons', 'activity_category_id', 'price_from'];
        foreach ($numericFields as $field) {
            if ($request->{$field} === '' || $request->{$field} === 'null' || $request->{$field} === 'undefined') {
                $request->merge([$field => ($field === 'price_from' ? 0 : null)]);
            } else if ($request->has($field)) {
                $val = str_replace(',', '.', (string) $request->{$field});
                $request->merge([$field => is_numeric($val) ? (float) $val : $val]);
            }
        }

        // Sanitize all string fields: never save literal "null"/"undefined" strings from frontend
        $stringFields = ['title', 'description', 'full_description', 'duration', 'location',
            'group_size', 'status', 'meta_description', 'location_address', 'google_maps_url',
            'highlights', 'whatsapp_link', 'experience_details', 'detailed_info'];
        foreach ($stringFields as $field) {
            if ($request->{$field} === 'null' || $request->{$field} === 'undefined') {
                $request->merge([$field => '']);
            }
        }

        // Pre-process booleans which might come as strings "true"/"false" in multipart/form-data
        $boolFields = ['featured', 'is_blocking_enabled', 'is_active'];
        foreach ($boolFields as $field) {
            if ($request->has($field)) {
                $request->merge([$field => filter_var($request->{$field}, FILTER_VALIDATE_BOOLEAN)]);
            }
        }

        $validated = $request->validate([
            'title' => 'sometimes|string',
            'description' => 'sometimes|string',
            'full_description' => 'nullable|string',
            'price_from' => 'sometimes|numeric',
            'duration' => 'nullable|string',
            'activity_category_id' => 'nullable',
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
            'price_type' => 'nullable|in:person,group',
            'max_persons' => 'nullable|numeric',
            'meta_description' => 'nullable|string',
            'location_address' => 'nullable|string',
            'google_maps_url' => 'nullable|string',
            'is_blocking_enabled' => 'nullable|boolean',
            'pricing_details' => 'nullable|string',
            'experience_details' => 'nullable|string',
            'detailed_info' => 'nullable|string',
            'timeline' => 'nullable|string',
        ]);

        $currentImages = [];
        if ($request->has('existing_images')) {
            $currentImages = json_decode($request->existing_images, true);
        } else {
            $currentImages = $activity->images ?? [];
        }

        // Normalize currentImages to always be objects
        $currentImages = array_map(function ($img) {
            if (is_string($img)) {
                return [
                    'url' => $img,
                    'alt' => '',
                    'title' => '',
                    'caption' => ''
                ];
            }
            return $img;
        }, $currentImages);

        if ($request->hasFile('images_files')) {
            foreach ($request->file('images_files') as $file) {
                $path = $file->store('activities', 'public');
                $currentImages[] = [
                    'url' => '/storage/' . $path,
                    'alt' => pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME),
                    'title' => '',
                    'caption' => ''
                ];
            }
        }
        $validated['images'] = $currentImages;

        if ($request->has('included'))
            $validated['included'] = json_decode($request->included, true);
        if ($request->has('not_included'))
            $validated['not_included'] = json_decode($request->not_included, true);
        if ($request->has('formulas'))
            $validated['formulas'] = json_decode($request->formulas, true);
        if ($request->has('faq'))
            $validated['faq'] = json_decode($request->faq, true);
        if ($request->has('practical_info_points'))
            $validated['practical_info_points'] = json_decode($request->practical_info_points, true);
        if ($request->has('pricing_details'))
            $validated['pricing_details'] = json_decode($request->pricing_details, true);
        if ($request->has('timeline'))
            $validated['timeline'] = json_decode($request->timeline, true);
        if ($request->has('experience_details'))
            $validated['experience_details'] = $request->experience_details;
        if ($request->has('detailed_info'))
            $validated['detailed_info'] = $request->detailed_info;

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
