<?php

use Illuminate\Support\Facades\Artisan;

// Sécurité : Optionnel mais recommandé, tu pourras supprimer ce fichier après utilisation.
define('LARAVEL_START', microtime(true));

// 1. Charger l'autoloader de Laravel
require __DIR__.'/../vendor/autoload.php';

// 2. Démarrer l'application Laravel
$app = require_once __DIR__.'/../bootstrap/app.php';

// 3. Exécuter la commande dans le noyau de Laravel
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

echo "<h1>--- Démarrage de la Migration Just Marrakech ---</h1>";

try {
    // Exécuter les migrations de la base de données
    echo "<p>Exécution de 'php artisan migrate'...</p>";
    $exitCode = Artisan::call('migrate', ['--force' => true]);
    $output = Artisan::output();
    echo "<pre style='background: #f4f4f4; padding: 15px; border: 1px solid #ccc;'>Code de sortie : $exitCode\n\nOutput :\n$output</pre>";

    // Vider les caches
    echo "<p>Exécution de 'php artisan optimize:clear'...</p>";
    Artisan::call('optimize:clear');
    echo "<pre style='background: #f4f4f4; padding: 15px; border: 1px solid #ccc;'>Caches vidés avec succès !</pre>";

    echo "<h2 style='color: green;'>Migration réussie avec succès ! Tu peux fermer cette page et retourner sur l'Admin.</h2>";
} catch (\Exception $e) {
    echo "<h2 style='color: red;'>Erreur durant la migration :</h2>";
    echo "<pre style='background: #fff0f0; padding: 15px; border: 1px solid #ffa0a0; color: red;'>" . $e->getMessage() . "\n\n" . $e->getTraceAsString() . "</pre>";
}
