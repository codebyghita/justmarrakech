<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\PageContent;

$blocks = [
    ['slug' => 'activities-category-title', 'type' => 'text', 'content' => 'Choisissez votre catégorie', 'section' => 'activities'],
    ['slug' => 'activities-category-subtitle', 'type' => 'text', 'content' => 'EXPLOREZ NOS ACTIVITÉS PAR THÈME', 'section' => 'activities'],
    ['slug' => 'activities-popular-title', 'type' => 'text', 'content' => 'Activités Populaires', 'section' => 'activities'],
    ['slug' => 'activities-popular-subtitle', 'type' => 'text', 'content' => 'Découvrez notre sélection des expériences les plus demandées à Marrakech.', 'section' => 'activities'],
];

foreach ($blocks as $b) {
    $existing = PageContent::where('slug', $b['slug'])->first();
    if (!$existing) {
        $pc = PageContent::create($b);
        $pc->generateTranslations();
        echo "Created: {$b['slug']}\n";
    } else {
        echo "Exists: {$b['slug']}\n";
    }
}

echo "Done!\n";
