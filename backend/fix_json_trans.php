<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\PageContent;
use App\Models\SiteSetting;

echo "Fixing JSON translations (SiteSetting and PageContent)...\n";

foreach (PageContent::all() as $pc) {
    echo "  PageContent: {$pc->slug}\n";
    $pc->generateTranslations();
}

foreach (SiteSetting::all() as $s) {
    echo "  SiteSetting: {$s->key}\n";
    $s->generateTranslations();
}

echo "Done!\n";
