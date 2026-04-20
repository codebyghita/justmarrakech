<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\UnavailableDate;
use Illuminate\Http\Request;

class CalendarController extends Controller
{
    /**
     * Get unavailable dates. Optionally filter by type and id.
     */
    public function index(Request $request)
    {
        $query = UnavailableDate::query();
        
        if ($request->has('type') && $request->has('id')) {
            $query->where('unavailable_type', $request->type)
                  ->where('unavailable_id', $request->id);
        }

        return response()->json($query->get());
    }

    /**
     * Mark a date as unavailable.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'unavailable_type' => 'required|string',
            'unavailable_id' => 'required|integer',
            'date' => 'required|date',
        ]);

        $unavailable = UnavailableDate::firstOrCreate($validated);

        return response()->json($unavailable, 201);
    }

    /**
     * Remove an unavailable date (make it available).
     */
    public function destroy($id)
    {
        UnavailableDate::findOrFail($id)->delete();
        return response()->json(null, 204);
    }
}
