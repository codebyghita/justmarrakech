<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\PageContent;
use App\Models\Translation;

$pc = PageContent::where('slug', 'home-how-it-works-steps')->first();
if ($pc) {
    echo "Slug: {$pc->slug} | Type: {$pc->type}\n";
    echo "Original Content (FR): " . json_encode($pc->content, JSON_UNESCAPED_UNICODE) . "\n";
    
    $t = Translation::where('translatable_type', get_class($pc))
        ->where('translatable_id', $pc->id)
        ->where('locale', 'ar')
        ->first();
        
    if ($t) {
        echo "Arabic Translation: {$t->content}\n";
    }
}
