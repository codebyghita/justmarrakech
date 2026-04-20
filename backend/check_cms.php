<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$block = \App\Models\PageContent::where('slug', 'sur-mesure-content')->first();
if ($block) {
    echo "FOUND\n";
    $content = is_string($block->content) ? json_decode($block->content, true) : $block->content;
    echo json_encode($content, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
} else {
    echo "NOT FOUND - La table PageContent ne contient pas de bloc sur-mesure-content\n";
    $all = \App\Models\PageContent::pluck('slug')->toArray();
    echo "Blocs existants: " . implode(', ', $all) . "\n";
}
