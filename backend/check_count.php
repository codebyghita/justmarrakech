<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Accommodations: " . App\Models\Accommodation::count() . "\n";
echo "Activities: " . App\Models\Activity::count() . "\n";
echo "ActivityCategories: " . App\Models\ActivityCategory::count() . "\n";
echo "PageContents: " . App\Models\PageContent::count() . "\n";
echo "BlogPosts: " . App\Models\BlogPost::count() . "\n";
