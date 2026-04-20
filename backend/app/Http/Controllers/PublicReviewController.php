<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\Activity;
use App\Models\Accommodation;
use Illuminate\Http\Request;

class PublicReviewController extends Controller
{
    public function index(Request $request)
    {
        $type = $request->query('type');
        $id = $request->query('id');

        $query = Review::where('status', 'approved');

        if ($type && $id) {
            $query->where('reviewable_type', $type)->where('reviewable_id', $id);
        }

        return response()->json($query->orderBy('created_at', 'desc')->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string',
            'reviewable_type' => 'required|string',
            'reviewable_id' => 'required|integer',
        ]);

        $type = $request->reviewable_type;
        if ($type === 'Activity') $type = 'App\\Models\\Activity';
        if ($type === 'Accommodation') $type = 'App\\Models\\Accommodation';

        $review = Review::create([
            'name' => $request->name,
            'rating' => $request->rating,
            'comment' => $request->comment,
            'reviewable_type' => $type,
            'reviewable_id' => $request->reviewable_id,
            'status' => 'pending', // Madame Celine must approve
        ]);

        return response()->json([
            'message' => 'Merci pour votre avis !',
            'data' => $review
        ]);
    }
}
