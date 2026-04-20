<?php
require __DIR__.'/vendor/autoload.php';
$app = require __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$excCat = App\Models\ActivityCategory::where('slug', 'excursions')->first();
if (!$excCat) {
    echo "Excursions category not found!\n";
    exit(1);
}
echo "Excursions category id: {$excCat->id}\n";

// Activities that are clearly excursions (day trips, multi-day circuits, destinations outside Marrakech)
$excursionIds = [44, 47, 50, 51, 55, 56, 58, 61];
// Activity names for reference:
// 44 = EVJF Marrakech séjour sur mesure
// 47 = Séjour sur mesure à Marrakech
// 50 = Circuit Marrakech Merzouga 5 Jours
// 51 = Marrakech en Side Car Vintage
// 55 = Excursion Ouarzazate
// 56 = Essaouira Journée Détente
// 58 = Vallée de l'Ourika
// 61 = Cascades d'Ouzoud

$actualExcursions = [55, 56, 58, 61, 50]; // Clear excursions (day trips outside Marrakech)

$updated = App\Models\Activity::whereIn('id', $actualExcursions)->update([
    'activity_category_id' => $excCat->id
]);

echo "Updated {$updated} activities to excursions category (id={$excCat->id})\n";

// Verify
$excursionsList = App\Models\Activity::where('activity_category_id', $excCat->id)->get(['id', 'title', 'activity_category_id']);
echo "\nExcursions in DB now:\n";
foreach ($excursionsList as $e) {
    echo "  [{$e->id}] {$e->title}\n";
}
