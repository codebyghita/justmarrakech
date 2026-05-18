<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Translation;

$corrupted = Translation::where('content', 'like', '%،%')->get();
foreach ($corrupted as $t) {
    $content = $t->content;
    if (str_contains($content, 'label') || str_contains($content, 'url') || str_contains($content, '{') || str_contains($content, '[')) {
        echo "ID: {$t->id} | Locale: {$t->locale} | Field: {$t->field}\n";
        echo "Content: $content\n";
        echo "-------------------\n";
    }
}
