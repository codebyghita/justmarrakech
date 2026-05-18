<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Translation;

echo "Finding corrupted Arabic translations...\n";

// Find all Arabic translations that contain Arabic comma and look like JSON
$corrupted = Translation::where('locale', 'ar')
    ->where('content', 'like', '%،%')
    ->get();

foreach ($corrupted as $t) {
    if (str_contains($t->content, '{') || str_contains($t->content, '[')) {
        echo "Fixing ID: {$t->id} ({$t->translatable_type} #{$t->translatable_id})...\n";
        $model = $t->translatable;
        if ($model) {
            $model->generateTranslations([$t->field]);
        }
    }
}

echo "Done!\n";
