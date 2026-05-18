<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\SiteSetting;
use App\Models\Translation;

$s = SiteSetting::where('key', 'footer_info_links')->first();
if ($s) {
    echo "Raw French Content: " . $s->getRawOriginal('value') . "\n";
    $t = Translation::where('translatable_type', get_class($s))
        ->where('translatable_id', $s->id)
        ->where('locale', 'ar')
        ->first();
    if ($t) {
        echo "Arabic Content: {$t->content}\n";
    }
}
