<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\PageContent;
use App\Models\SiteSetting;

echo "Targeted JSON Translation Fix...\n";

$jsonPc = PageContent::where('type', 'json')->orWhere('slug', 'sur-mesure-content')->get();
foreach ($jsonPc as $pc) {
    echo "  Fixing PageContent: {$pc->slug}...\n";
    $pc->generateTranslations();
}

$jsonSettings = ['footer_menu', 'footer_info_links', 'social_links'];
foreach ($jsonSettings as $key) {
    $s = SiteSetting::where('key', $key)->first();
    if ($s) {
        echo "  Fixing SiteSetting: {$key}...\n";
        $s->generateTranslations();
    }
}

echo "Done!\n";
