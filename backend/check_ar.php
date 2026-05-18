<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Translation;

$pc = App\Models\PageContent::where('slug', 'sur-mesure-content')->first();
if ($pc) {
    $t = Translation::where('translatable_type', get_class($pc))
        ->where('translatable_id', $pc->id)
        ->where('locale', 'ar')
        ->first();
    if ($t) {
        echo "ID: {$t->id} | Field: {$t->field}\n";
        echo "Content: {$t->content}\n";
        $decoded = json_decode($t->content, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            echo "❌ INVALID JSON: " . json_last_error_msg() . "\n";
        } else {
            echo "✅ VALID JSON\n";
        }
    } else {
        echo "No Arabic translation for sur-mesure-content found.\n";
    }
}

