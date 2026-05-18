<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Media;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MediaController extends Controller
{
    public function index()
    {
        return response()->json(Media::orderBy('created_at', 'desc')->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'files.*' => 'required|file|mimes:jpeg,png,jpg,gif,svg,webp,pdf|max:10240',
        ]);

        $uploaded = [];
        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $originalName = $file->getClientOriginalName();
                $path = $file->storeAs('media', uniqid() . '_' . $originalName, 'public');
                $media = Media::create([
                    'name' => $originalName,
                    'file_path' => $path,
                    'url' => Storage::url($path),
                    'type' => in_array($file->extension(), ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp']) ? 'image' : 'pdf',
                    'size' => $file->getSize(),
                    'alt' => pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME),
                    'title' => '',
                    'caption' => '',
                ]);
                $uploaded[] = $media;
            }
        }

        return response()->json([
            'message' => 'Files uploaded successfully',
            'files' => $uploaded
        ]);
    }

    public function update(Request $request, Media $media)
    {
        $request->validate([
            'alt' => 'nullable|string|max:500',
            'title' => 'nullable|string|max:500',
            'caption' => 'nullable|string|max:1000',
        ]);

        $media->update($request->only(['alt', 'title', 'caption']));

        return response()->json($media);
    }

    public function destroy(Request $request)
    {
        $path = $request->input('path');
        if (Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
        Media::where('file_path', $path)->delete();

        return response()->json(['message' => 'Fichier supprimé']);
    }
}
