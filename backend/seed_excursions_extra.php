<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
use App\Models\PageContent;

$blocks = [
    'excursions-hero-desc' => ['section' => 'excursions', 'type' => 'text', 'content' => "Quittez l'agitation de la ville pour une journée ou plus. Nous avons sélectionné pour vous les plus belles échappées: désert d'Agafay, vallée de l'Ourika, cascades d'Ouzoud ou encore Essaouira."],
    'excursions-hero-badges' => ['section' => 'excursions', 'type' => 'json', 'content' => json_encode(['SÉLECTION TESTÉE', 'CHAUFFEUR PRIVÉ', 'CLIMATISATION', 'TOUT INCLUS'], JSON_UNESCAPED_UNICODE)],
];

foreach ($blocks as $slug => $data) {
    PageContent::updateOrCreate(['slug' => $slug], $data);
    echo "✓ Processed $slug\n";
}
