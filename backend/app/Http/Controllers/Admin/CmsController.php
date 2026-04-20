<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PageContent;
use Illuminate\Http\Request;

class CmsController extends Controller
{
    public function index()
    {
        return response()->json(PageContent::with('translations')->get());
    }

    public function update(Request $request, $id)
    {
        $content = PageContent::findOrFail($id);

        $request->validate([
            'content' => 'nullable',
            'image_path' => 'nullable|string',
        ]);

        $content->update($request->only(['content', 'image_path']));

        return response()->json([
            'message' => 'Contenu mis à jour avec succès',
            'data' => $content->load('translations')
        ]);
    }

    public function getBySection($section)
    {
        return response()->json(
            PageContent::where('section', $section)->with('translations')->get()
        );
    }
}
