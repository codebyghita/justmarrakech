<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$p = \App\Models\PageContent::where('slug', 'sur-mesure-content')->first();
$t = \App\Models\Translation::where('translatable_id', $p->id)->where('locale', 'en')->where('field', 'content')->first();

if ($t) {
    $data = json_decode($t->content, true);
    echo "Keys in translated JSON: " . implode(", ", array_keys($data)) . "\n";
    if (isset($data['sejourCards'])) {
        echo "sejourCards key exists! Count: " . count($data['sejourCards']) . "\n";
    } else {
        echo "sejourCards key MISSING!\n";
    }
} else {
    echo "Translation not found.\n";
}
