<?php

namespace App\Http\Controllers;

use App\Models\PageContent;
use App\Models\SiteSetting;
use App\Models\ActivityCategory;
use Illuminate\Http\Request;

class PublicCmsController extends Controller
{
    public function getPageContent($section)
    {
        return response()->json(
            PageContent::where('section', $section)->with('translations')->get()->keyBy('slug')
        );
    }

    public function getSettings()
    {
        return response()->json(SiteSetting::with('translations')->get()->keyBy('key'));
    }

    public function getCategories()
    {
        return response()->json(
            ActivityCategory::with('translations')->orderBy('sort_order')->where('status', 'published')->get()
        );
    }
}
