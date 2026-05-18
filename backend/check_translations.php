<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Translation;
use App\Models\PageContent;
use App\Models\BlogPost;

echo "--- Translations Summary ---\n";
$count = Translation::count();
echo "Total translations: $count\n\n";

echo "--- Sample Translations for PageContent ---\n";
$pcTrans = Translation::where('translatable_type', PageContent::class)->get();
foreach($pcTrans as $t) {
    echo "ID: {$t->translatable_id} | Field: {$t->field} | Locale: {$t->locale} | Content Snippet: " . substr($t->content, 0, 50) . "...\n";
}

echo "\n--- Sample Translations for BlogPosts ---\n";
$bpTrans = Translation::where('translatable_type', BlogPost::class)->get();
foreach($bpTrans as $t) {
    echo "ID: {$t->translatable_id} | Field: {$t->field} | Locale: {$t->locale} | Content Snippet: " . substr($t->content, 0, 50) . "...\n";
}
