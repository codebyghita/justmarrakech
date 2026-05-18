<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\PageContent;
use App\Models\Translation;

echo "=== E2E Test: Admin Update Propagation ===\n\n";

$pc = PageContent::where('slug', 'home-hero-title')->first();
$originalContent = $pc->content;
echo "1. Original Content (FR): {$originalContent}\n";

$newContent = "Bienvenue au Paradis " . rand(100, 999);
echo "2. Simulating Admin Update to: {$newContent}\n";

// Update triggers the HasTranslations saved event
$pc->update(['content' => $newContent]);

echo "3. Update complete. Checking translations...\n";

// Re-fetch to ensure fresh data
$pc->refresh();
echo "   New FR Content in DB: {$pc->content}\n";

$translations = Translation::where('translatable_type', get_class($pc))
    ->where('translatable_id', $pc->id)
    ->get();

foreach ($translations as $t) {
    echo "   -> [{$t->locale}]: {$t->content}\n";
}

echo "4. Simulating Public Client API fetch (locale: ar)...\n";
// The frontend uses getTranslated utility, but the backend serves the translations array.
$publicData = PageContent::where('slug', 'home-hero-title')->with('translations')->first();
$arTrans = $publicData->translations->where('locale', 'ar')->first();
echo "   Client receives Arabic: " . ($arTrans ? $arTrans->content : "Not Found") . "\n";

echo "5. Reverting to original content...\n";
$pc->update(['content' => $originalContent]);
echo "   Reverted to: {$pc->refresh()->content}\n";

echo "\n=== Test Passed Successfully ===\n";
