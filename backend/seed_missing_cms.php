<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\PageContent;

echo "=== CMS Synchronization Script ===\n\n";

// 1. Delete the redundant 'home-how-steps' slug (ID 22) - keep 'home-how-it-works-steps' (ID 3)
$old = PageContent::where('slug', 'home-how-steps')->first();
if ($old) {
    $old->delete();
    echo "✓ Deleted redundant slug: home-how-steps (ID {$old->id})\n";
} else {
    echo "- home-how-steps not found, skipping.\n";
}

// 2. Update 'home-how-it-works-steps' with clean, structured content
$steps = [
    "Vous nous donnez vos infos : budget, personnes, nuitées, dates et envies.",
    "Vous recevez des propositions personnalisées avec descriptions et photos.",
    "On affine ensemble jusqu'à ce que ce soit parfait.",
    "Vous recevez un planning clair et détaillé.",
    "Vous profitez de Marrakech, on s'occupe de tout !"
];

$block = PageContent::where('slug', 'home-how-it-works-steps')->first();
if ($block) {
    $block->content = json_encode($steps, JSON_UNESCAPED_UNICODE);
    $block->save();
    echo "✓ Updated home-how-it-works-steps with " . count($steps) . " steps\n";
} else {
    PageContent::create([
        'slug' => 'home-how-it-works-steps',
        'section' => 'home',
        'type' => 'json',
        'content' => json_encode($steps, JSON_UNESCAPED_UNICODE),
    ]);
    echo "✓ Created home-how-it-works-steps\n";
}

// 3. Ensure all home-how-it-works text blocks exist
$homeBlocks = [
    'home-how-it-works-label' => ['section' => 'home', 'type' => 'text', 'content' => 'NOTRE PROCESSUS'],
    'home-how-it-works-title' => ['section' => 'home', 'type' => 'text', 'content' => 'Comment nous créons votre voyage'],
    'home-how-it-works-desc'  => ['section' => 'home', 'type' => 'text', 'content' => 'Une approche personnalisée et testée pour garantir l\'excellence de chaque séjour.'],
    'home-how-it-works-cta'   => ['section' => 'home', 'type' => 'text', 'content' => 'Prêt à commencer l\'aventure ?'],
];

foreach ($homeBlocks as $slug => $data) {
    $b = PageContent::where('slug', $slug)->first();
    if (!$b) {
        PageContent::create(array_merge(['slug' => $slug], $data));
        echo "✓ Created missing block: $slug\n";
    } else {
        echo "- Block already exists: $slug\n";
    }
}

// 4. Create missing blocks for Activities page
$activitiesBlocks = [
    'activities-hero-title'       => ['section' => 'activities', 'type' => 'text', 'content' => 'Nos Activités'],
    'activities-hero-subtitle'    => ['section' => 'activities', 'type' => 'text', 'content' => 'Des expériences uniques sélectionnées et testées à Marrakech.'],
    'activities-category-title'   => ['section' => 'activities', 'type' => 'text', 'content' => 'Choisissez votre catégorie'],
    'activities-category-subtitle'=> ['section' => 'activities', 'type' => 'text', 'content' => 'Toutes nos expériences, classées par thème'],
    'activities-popular-title'    => ['section' => 'activities', 'type' => 'text', 'content' => 'Activités Populaires'],
    'activities-popular-subtitle' => ['section' => 'activities', 'type' => 'text', 'content' => 'Notre sélection des expériences les plus demandées à Marrakech.'],
    'activities-landing-badges'   => ['section' => 'activities', 'type' => 'json', 'content' => json_encode(['Sélection testée', 'Réservation WhatsApp', 'Guide local', '100% personnalisé'], JSON_UNESCAPED_UNICODE)],
];

foreach ($activitiesBlocks as $slug => $data) {
    $b = PageContent::where('slug', $slug)->first();
    if (!$b) {
        PageContent::create(array_merge(['slug' => $slug], $data));
        echo "✓ Created missing activities block: $slug\n";
    } else {
        echo "- Activities block already exists: $slug\n";
    }
}

// 5. Create missing blocks for Excursions page
$excursionsBlocks = [
    'excursions-hero-title'    => ['section' => 'excursions', 'type' => 'text', 'content' => 'Nos Excursions'],
    'excursions-hero-subtitle' => ['section' => 'excursions', 'type' => 'text', 'content' => 'Des escapades mémorables au-delà des remparts de Marrakech.'],
];

foreach ($excursionsBlocks as $slug => $data) {
    $b = PageContent::where('slug', $slug)->first();
    if (!$b) {
        PageContent::create(array_merge(['slug' => $slug], $data));
        echo "✓ Created missing excursions block: $slug\n";
    } else {
        echo "- Excursions block already exists: $slug\n";
    }
}

// 6. Create missing blocks for Blog page
$blogBlocks = [
    'blog-label'        => ['section' => 'blog', 'type' => 'text', 'content' => 'Journal de Voyage'],
    'blog-hero-title'   => ['section' => 'blog', 'type' => 'text', 'content' => 'Articles & Inspirations'],
    'blog-hero-subtitle'=> ['section' => 'blog', 'type' => 'text', 'content' => 'Découvrez nos conseils exclusifs et l\'actualité de Marrakech.'],
];

foreach ($blogBlocks as $slug => $data) {
    $b = PageContent::where('slug', $slug)->first();
    if (!$b) {
        PageContent::create(array_merge(['slug' => $slug], $data));
        echo "✓ Created missing blog block: $slug\n";
    } else {
        echo "- Blog block already exists: $slug\n";
    }
}

echo "\n=== Done! CMS is now synchronized. ===\n";
echo "\nBlocks summary:\n";
$allBlocks = PageContent::orderBy('section')->orderBy('slug')->get(['id', 'slug', 'section', 'type']);
foreach ($allBlocks as $b) {
    echo "  [{$b->section}] {$b->slug} ({$b->type})\n";
}
