<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

$blocks = [
    // HOME - HOW IT WORKS
    [
        'slug' => 'home-how-steps',
        'section' => 'home',
        'type' => 'json',
        'content' => json_encode([
            'Vous nous donnez vos infos : budget + personnes + nuitées + dates + envies.',
            'Vous recevez des propositions personnalisées (descriptions + photos).',
            'On affine ensemble jusqu\'à ce que ce soit parfait.',
            'Vous recevez un planning clair.',
            'On s\'occupe des réservations selon votre validation.'
        ])
    ],
    [
        'slug' => 'home-how-it-works-label',
        'section' => 'home',
        'type' => 'text',
        'content' => json_encode('NOTRE PROCESSUS')
    ],
    [
        'slug' => 'home-how-it-works-title',
        'section' => 'home',
        'type' => 'text',
        'content' => json_encode('Comment nous créons votre voyage')
    ],
    [
        'slug' => 'home-how-it-works-desc',
        'section' => 'home',
        'type' => 'text',
        'content' => json_encode('Une approche personnalisée et testée pour garantir l\'excellence.')
    ],
    [
        'slug' => 'home-how-it-works-cta',
        'section' => 'home',
        'type' => 'text',
        'content' => json_encode('Prêt à commencer l\'aventure ?')
    ],
    
    // HOME - QUOTE
    [
        'slug' => 'home-vogue-quote',
        'section' => 'home',
        'type' => 'text',
        'content' => json_encode('Just Marrakech a transformé mon voyage en une expérience cinématographique.')
    ],
    [
        'slug' => 'home-vogue-subtitle',
        'section' => 'home',
        'type' => 'text',
        'content' => json_encode('Vogue Travel Journal')
    ],

    // HOME - FEATURED
    [
        'slug' => 'home-featured-subtitle',
        'section' => 'home',
        'type' => 'text',
        'content' => json_encode('LA SÉLECTION')
    ],
    [
        'slug' => 'home-featured-title',
        'section' => 'home',
        'type' => 'text',
        'content' => json_encode('Aventures Exceptionnelles')
    ],
    [
        'slug' => 'home-view-collection',
        'section' => 'home',
        'type' => 'text',
        'content' => json_encode('Voir toute la collection')
    ],
];

foreach ($blocks as $b) {
    $exists = DB::table('page_contents')->where('slug', $b['slug'])->exists();
    if ($exists) {
        DB::table('page_contents')->where('slug', $b['slug'])->update([
            'section' => $b['section'],
            'type' => $b['type'],
            'content' => $b['content'],
            'updated_at' => now()
        ]);
    } else {
        DB::table('page_contents')->insert([
            'slug' => $b['slug'],
            'section' => $b['section'],
            'type' => $b['type'],
            'content' => $b['content'],
            'created_at' => now(),
            'updated_at' => now()
        ]);
    }
    echo "Block processed: {$b['slug']}\n";
}

echo "Seeding completed successfully via direct DB.\n";
