<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class BlogPostController extends Controller
{
    public function index()
    {
        return response()->json(BlogPost::latest()->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'excerpt' => 'nullable|string',
            'content' => 'nullable|string',
            'category' => 'nullable|string|max:255',
            'status' => 'required|string|in:draft,published',
            'translations' => 'nullable|string',
        ]);

        $validated['slug'] = Str::slug($validated['title']) . '-' . uniqid();
        
        if ($request->has('translations') && is_string($request->translations)) {
            $validated['translations'] = json_decode($request->translations, true);
        }

        if ($request->hasFile('images_files')) {
            $file = $request->file('images_files')[0];
            $path = $file->store('blog/' . date('Y/m/d'), 'public');
            $validated['image'] = '/storage/' . $path;
        }

        $post = BlogPost::create($validated);
        return response()->json($post, 201);
    }

    public function update(Request $request, $id)
    {
        $post = BlogPost::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'excerpt' => 'nullable|string',
            'content' => 'nullable|string',
            'category' => 'nullable|string|max:255',
            'status' => 'required|string|in:draft,published',
            'translations' => 'nullable|string',
            'existing_images' => 'nullable|string'
        ]);

        if (isset($validated['title']) && $post->title !== $validated['title']) {
            $validated['slug'] = Str::slug($validated['title']) . '-' . uniqid();
        }

        if ($request->has('translations') && is_string($request->translations)) {
            $validated['translations'] = json_decode($request->translations, true);
        }

        if ($request->hasFile('images_files')) {
            $file = $request->file('images_files')[0];
            $path = $file->store('blog/' . date('Y/m/d'), 'public');
            $validated['image'] = '/storage/' . $path;
        } else {
            if ($request->has('existing_images') && is_string($request->existing_images)) {
                $existing = json_decode($request->existing_images, true);
                if (empty($existing)) {
                    $validated['image'] = null;
                }
            }
        }

        $post->update($validated);
        return response()->json($post);
    }

    public function destroy($id)
    {
        $post = BlogPost::findOrFail($id);
        $post->delete();
        return response()->json(['message' => 'Post deleted successfully']);
    }
}
