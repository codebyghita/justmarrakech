<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\PageContent;

$blocks = PageContent::all();
foreach ($blocks as $block) {
    if ($block->id == 3 || $block->id == 22) {
        echo "ID: {$block->id} | Slug: {$block->slug} | Section: {$block->section} | Type: {$block->type}\n";
        if ($block->type === 'json' || is_array($block->content)) {
            echo "Content: " . json_encode($block->content, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";
        } else {
            echo "Content Snippet: " . substr($block->content, 0, 100) . "...\n";
        }
        echo "-------------------\n";
    }
}
