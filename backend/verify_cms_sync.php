<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\PageContent;

echo "=== Verifying CMS Sync ===\n\n";

// Check the steps block
$block = PageContent::where('slug', 'home-how-it-works-steps')->first();
if ($block) {
    $content = is_string($block->content) ? json_decode($block->content, true) : $block->content;
    echo "home-how-it-works-steps: " . count($content) . " steps\n";
    foreach ($content as $i => $step) {
        echo "  " . ($i+1) . ". $step\n";
    }
} else {
    echo "Block NOT FOUND!\n";
}

echo "\n";

// Simulate the API response: /api/public/content/home
$homeBlocks = PageContent::where('section', 'home')->get()->keyBy('slug');
echo "Home section blocks in API:\n";
foreach ($homeBlocks as $slug => $b) {
    $preview = is_string($b->content) ? substr($b->content, 0, 80) : json_encode($b->content);
    echo "  [$slug] => " . $preview . "\n";
}

echo "\n=== Done ===\n";
