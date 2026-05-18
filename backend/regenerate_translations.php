<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Translation;
use App\Models\PageContent;
use App\Models\BlogPost;
use App\Models\Activity;
use App\Models\SiteSetting;

echo "Truncating old translations...\n";
Translation::truncate();

echo "Translating PageContent...\n";
foreach(PageContent::all() as $item) {
    echo "Translating PageContent ID: {$item->id}\n";
    $item->generateTranslations();
}

echo "Translating BlogPosts...\n";
foreach(BlogPost::all() as $item) {
    echo "Translating BlogPost ID: {$item->id}\n";
    $item->generateTranslations();
}

echo "Translating Activities...\n";
foreach(Activity::all() as $item) {
    echo "Translating Activity ID: {$item->id}\n";
    $item->generateTranslations();
}

echo "Translating SiteSettings...\n";
foreach(SiteSetting::all() as $item) {
    echo "Translating SiteSetting: {$item->key}\n";
    $item->generateTranslations();
}

echo "Translations completed successfully!\n";
