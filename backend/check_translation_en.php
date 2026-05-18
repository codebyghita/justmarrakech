<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$t = \App\Models\Translation::where('translatable_id', 10)
    ->where('translatable_type', 'App\Models\PageContent')
    ->where('locale', 'en')
    ->first();

if ($t) {
    echo "ID: " . $t->id . "\n";
    echo "Locale: " . $t->locale . "\n";
    echo "Content Length: " . strlen($t->content) . "\n";
    echo "Content Preview: " . substr($t->content, 0, 100) . "...\n";
    
    $data = json_decode($t->content, true);
    if (is_array($data)) {
        echo "Keys: " . implode(', ', array_keys($data)) . "\n";
        if (isset($data['sejourCards'])) {
            echo "sejourCards count: " . count($data['sejourCards']) . "\n";
        } else {
            echo "sejourCards MISSING ❌\n";
        }
    } else {
        echo "Content is NOT JSON ❌\n";
    }
} else {
    echo "No translation found for EN.\n";
}
