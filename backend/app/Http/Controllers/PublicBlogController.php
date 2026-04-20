<?php

namespace App\Http\Controllers;

use App\Models\BlogPost;
use Illuminate\Http\Request;

class PublicBlogController extends Controller
{
    public function index()
    {
        return response()->json(BlogPost::with('translations')->where('status', 'published')->latest()->get());
    }

    public function show($slug)
    {
        $post = BlogPost::with('translations')->where('slug', $slug)->firstOrFail();
        return response()->json($post);
    }
}
