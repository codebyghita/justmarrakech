<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\SiteSetting;
use App\Models\Translation;

$s = SiteSetting::where('key', 'footer_info_links')->first();
if ($s) {
    $t = Translation::where('translatable_type', get_class($s))
        ->where('translatable_id', $s->id)
        ->where('locale', 'ar')
        ->first();
    if ($t) {
        echo "Arabic Content: {$t->content}\n";
        $decoded = json_decode($t->content, true);
        if (json_last_error() === JSON_ERROR_NONE) {
            echo "✅ VALID JSON\n";
        } else {
            echo "❌ INVALID JSON: " . json_last_error_msg() . "\n";
        }
    }
}
