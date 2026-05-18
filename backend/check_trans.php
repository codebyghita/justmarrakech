<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$slugs = \App\Models\PageContent::pluck('slug')->toArray();
echo "Available slugs: " . implode(", ", $slugs) . "\n";

$p = \App\Models\PageContent::where('slug', 'sur-mesure-content')->first();
if ($p) {
    echo "Sur Mesure ID: {$p->id}\n";
    $trans = \App\Models\Translation::where('translatable_type', 'App\Models\PageContent')
        ->where('translatable_id', $p->id)
        ->where('locale', 'en')
        ->get();
    foreach($trans as $t) {
        echo "Field: {$t->field} | Content: " . substr($t->content, 0, 500) . "\n";
    }
}
