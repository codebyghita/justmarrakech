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

    public function store(Request $request)
    {
        $validated = $request->validate([
            'slug' => 'required|string|unique:page_contents,slug',
            'section' => 'required|string',
            'type' => 'nullable|string',
            'content' => 'nullable',
            'image_path' => 'nullable|string',
        ]);

        PageContent::$skipTranslation = true;
        $content = PageContent::create($validated);
        
        register_shutdown_function(function () use ($content) {
            ignore_user_abort(true);
            set_time_limit(600);
            try {
                $content->generateTranslations();
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error("Translation error during PageContent creation: " . $e->getMessage());
            }
        });

        return response()->json([
            'message' => 'Contenu créé avec succès',
            'data' => $content->load('translations')
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $content = PageContent::findOrFail($id);

        $request->validate([
            'content' => 'nullable',
            'image_path' => 'nullable|string',
        ]);

        $oldContent = $content->content;

        PageContent::$skipTranslation = true;
        $content->update($request->only(['content', 'image_path']));

        register_shutdown_function(function () use ($content, $oldContent) {
            ignore_user_abort(true);
            set_time_limit(600);
            if (json_encode($oldContent) !== json_encode($content->content)) {
                try {
                    $content->generateTranslations();
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::error("Translation error during PageContent update: " . $e->getMessage());
                }
            }
        });

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
