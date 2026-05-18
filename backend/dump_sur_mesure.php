<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
use App\Models\PageContent;
$block = PageContent::where('slug', 'sur-mesure-content')->first();
if ($block) {
    echo json_encode($block->content, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
} else {
    echo 'Not found';
}
