<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\PageContent;
use App\Models\Translation;

echo "Regenerating all PageContent translations...\n";

$pages = PageContent::all();
foreach ($pages as $page) {
    echo "Processing: {$page->slug} (ID: {$page->id})\n";
    // Delete existing translations to force regeneration
    Translation::where('translatable_type', get_class($page))
        ->where('translatable_id', $page->id)
        ->delete();
    
    // Trigger regeneration
    $page->generateTranslations();
}

echo "Regenerating all Blog translations...\n";
$posts = \App\Models\BlogPost::all();
foreach ($posts as $post) {
    echo "Processing Post: {$post->title} (ID: {$post->id})\n";
    Translation::where('translatable_type', get_class($post))
        ->where('translatable_id', $post->id)
        ->delete();
    $post->generateTranslations();
}

echo "Done!\n";
