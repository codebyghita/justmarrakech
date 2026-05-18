<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$p = \App\Models\PageContent::where('slug', 'sur-mesure-content')->first();
$locales = ['en', 'ar', 'es', 'de', 'it'];

echo "Original Content Keys: " . implode(', ', array_keys($p->content)) . "\n";

foreach($locales as $l) {
    $t = \App\Models\Translation::where('translatable_id', $p->id)
        ->where('translatable_type', 'App\\Models\\PageContent')
        ->where('locale', $l)
        ->first();
    
    if ($t) {
        $content = json_decode($t->translated_data, true)['content'] ?? [];
        echo "Locale [$l] Keys: " . implode(', ', array_keys($content)) . "\n";
        if (isset($content['sejourCards'])) {
            echo "Locale [$l] has sejourCards: YES (" . count($content['sejourCards']) . " items)\n";
        } else {
            echo "Locale [$l] has sejourCards: NO ❌\n";
        }
    } else {
        echo "Locale [$l]: No translation found.\n";
    }
}
