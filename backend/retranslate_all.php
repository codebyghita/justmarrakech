<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Activity;
use App\Models\PageContent;
use App\Models\SiteSetting;
use App\Models\BlogPost;
use App\Models\ActivityCategory;
use App\Models\Accommodation;

echo "▶ Generating translations for all models...\n\n";

// Only translate newly added fields — existing translations are unchanged
$newFields = ['experience_details', 'timeline', 'detailed_info'];

$models = [
    Activity::class       => 'Activities (incl. excursions)',
    Accommodation::class  => 'Accommodations',
    ActivityCategory::class => 'ActivityCategories',
];

foreach ($models as $modelClass => $label) {
    echo "▶ $label...\n";
    $items = $modelClass::all();
    $count = 0;
    foreach ($items as $item) {
        try {
            $item->generateTranslations($newFields);
            $count++;
            echo "  ✓ ID {$item->id}\n";
        } catch (\Throwable $e) {
            echo "  ⚠ ID {$item->id}: {$e->getMessage()}\n";
        }
    }
    echo "  ✅ $count traductions générées pour $label\n\n";
}

echo "✅ ALL DONE!\n";
