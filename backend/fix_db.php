<?php

use App\Models\Translation;
use App\Models\PageContent;
use App\Models\Activity;
use Illuminate\Support\Facades\DB;

echo "Starting DB Cleanup...\n";

// 1. Fix Translations table
$count = Translation::where('content', 'Array')->delete();
echo "Deleted $count corrupted 'Array' translations.\n";

// 2. Fix PageContent table
$pageContents = PageContent::all();
foreach ($pageContents as $pc) {
    if ($pc->content === 'Array') {
        $pc->content = ($pc->type === 'json' || $pc->type === 'image_list') ? [] : "";
        $pc->save();
        echo "Fixed PageContent ID: {$pc->id} (Slug: {$pc->slug})\n";
    }
}

// 3. Fix Activities table
$activities = Activity::all();
foreach ($activities as $activity) {
    $changed = false;
    $fields = ['included', 'not_included', 'formulas', 'faq', 'practical_info_points'];
    foreach ($fields as $field) {
        if ($activity->{$field} === 'Array' || $activity->{$field} === ['Array']) {
            $activity->{$field} = [];
            $changed = true;
        }
    }
    if ($changed) {
        $activity->save();
        echo "Fixed Activity ID: {$activity->id} (Title: {$activity->title})\n";
    }
}

// 4. Fix truncated JSON in PageContent (specifically home-how-steps)
$pc = PageContent::where('slug', 'home-how-steps')->first();
if ($pc && is_string($pc->content) && str_contains($pc->content, 'selon votre val')) {
    $pc->content = [
        "Vous nous donnez vos infos : budget + personnes + nuitées + dates + envies.",
        "Vous recevez des propositions personnalisées (descriptions + photos).",
        "On affine ensemble jusqu'à ce que ce soit parfait.",
        "Vous recevez un planning clair.",
        "On s'occupe des réservations selon vos envies."
    ];
    $pc->save();
    echo "Fixed truncated 'home-how-steps'.\n";
}

echo "Cleanup finished!\n";
