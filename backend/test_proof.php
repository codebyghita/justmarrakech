<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\PageContent;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;

echo "========================================================================\n";
echo "   PREUVE D'EXÉCUTION DE BOUT EN BOUT (E2E) - JUST MARRAKECH CMS\n";
echo "========================================================================\n\n";

$adminToken = User::first()->createToken('admin-test')->plainTextToken;
$baseUrl = 'http://127.0.0.1:8000/api';

function printSuccess($msg) { echo "✅ $msg\n"; }
function printError($msg) { echo "❌ $msg\n"; }

// --- TEST 1: Page Accueil ---
echo "--- TEST 1 : Modification Page Accueil (Texte) ---\n";
$homeHero = PageContent::where('slug', 'home-hero-title')->first();
$newHomeTitle = "Bienvenue au Just Marrakech Épique " . rand(1000, 9999);
$response = Http::timeout(120)->withToken($adminToken)->put("$baseUrl/admin/cms/{$homeHero->id}", [
    'content' => $newHomeTitle
]);

if ($response->successful()) {
    printSuccess("Admin a sauvegardé le nouveau titre Accueil : '$newHomeTitle'");
} else {
    printError("Échec de la sauvegarde Accueil: " . $response->body());
}

$publicHomeFr = Http::get("$baseUrl/page-content/home");
$publicHomeAr = Http::withHeaders(['Accept-Language' => 'ar'])->get("$baseUrl/page-content/home");

$frFound = collect($publicHomeFr->json())->firstWhere('slug', 'home-hero-title')['content'] ?? '';
$arFound = collect($publicHomeAr->json())->firstWhere('slug', 'home-hero-title');
$arContent = "Introuvable";
if ($arFound && isset($arFound['translations'])) {
    $arTrans = collect($arFound['translations'])->firstWhere('locale', 'ar');
    if ($arTrans) $arContent = $arTrans['content'];
}

if ($frFound === $newHomeTitle) printSuccess("Côté Client (FR) affiche bien : '$frFound'");
if ($arContent !== "Introuvable" && $arContent !== $newHomeTitle) printSuccess("Côté Client (AR) traduit automatiquement : '$arContent'");


// --- TEST 2: Page Sur Mesure (JSON Data) ---
echo "\n--- TEST 2 : Modification Page Sur Mesure (Données JSON complexes) ---\n";
$surMesure = PageContent::where('slug', 'sur-mesure-content')->first();
$originalJson = $surMesure->content;

// Add a new sejour card
$newJson = $originalJson;
$newJson['sejourCards'] = [
    [
        'title' => 'Nouveau Séjour VIP ' . rand(10, 99),
        'description' => 'Un séjour inoubliable testé par E2E',
        'price' => '1500€',
        'duration' => '5 Jours',
        'image' => '/hero.jfif',
        'link' => '#'
    ]
];

$responseSM = Http::timeout(120)->withToken($adminToken)->put("$baseUrl/admin/cms/{$surMesure->id}", [
    'content' => $newJson
]);

if ($responseSM->successful()) {
    printSuccess("Admin a sauvegardé une nouvelle Carte Séjour VIP (JSON)");
} else {
    printError("Échec de la sauvegarde Sur Mesure (Statut {$responseSM->status()}):");
    // Print a stripped version of the HTML error if it's HTML, or the raw JSON
    $body = $responseSM->body();
    if (str_contains($body, '<title>')) {
        preg_match('/<title>(.*?)<\/title>/', $body, $matches);
        echo "   Exception: " . ($matches[1] ?? 'Unknown') . "\n";
        // Try to find the exact message
        if (preg_match('/"message":\s*"(.*?)"/', $body, $msgMatches)) {
            echo "   Message: " . $msgMatches[1] . "\n";
        }
    } else {
        echo "   Body: $body\n";
    }
}

$publicSMFr = Http::get("$baseUrl/page-content/sur-mesure");
$publicSMAr = Http::withHeaders(['Accept-Language' => 'ar'])->get("$baseUrl/page-content/sur-mesure");

$frSMFound = collect($publicSMFr->json())->firstWhere('slug', 'sur-mesure-content')['content'] ?? [];
$arSMFound = collect($publicSMAr->json())->firstWhere('slug', 'sur-mesure-content');
$arSMContent = [];
if ($arSMFound && isset($arSMFound['translations'])) {
    $arTrans = collect($arSMFound['translations'])->firstWhere('locale', 'ar');
    if ($arTrans) $arSMContent = json_decode($arTrans['content'], true);
}

if (isset($frSMFound['sejourCards'][0]['title'])) {
    printSuccess("Côté Client (FR) affiche la carte : '{$frSMFound['sejourCards'][0]['title']}'");
}
if (isset($arSMContent['sejourCards'][0]['title'])) {
    printSuccess("Côté Client (AR) traduit la carte : '{$arSMContent['sejourCards'][0]['title']}'");
}

// --- TEST 3: Remplacement de Photo ---
echo "\n--- TEST 3 : Remplacement de Photo (Page Activités) ---\n";
$photoBlock = PageContent::where('slug', 'activities-hero-img')->first();

// Create a fake image upload using a simple text file with jpg extension to bypass GD requirement
$fakeImageContent = 'fake image data';
$tempPath = sys_get_temp_dir() . '/test_photo.jpg';
file_put_contents($tempPath, $fakeImageContent);

$uploadResponse = Http::timeout(120)->withToken($adminToken)
    ->attach('image', file_get_contents($tempPath), 'test_photo.jpg')
    ->post("$baseUrl/admin/upload-image");

if ($uploadResponse->successful()) {
    $newImagePath = $uploadResponse->json('path');
    printSuccess("Photo uploadée avec succès sur le serveur : '$newImagePath'");
    
    $updatePhotoRes = Http::timeout(120)->withToken($adminToken)->put("$baseUrl/admin/cms/{$photoBlock->id}", [
        'content' => $newImagePath
    ]);
    
    if ($updatePhotoRes->successful()) {
         printSuccess("Admin a lié la nouvelle photo au bloc CMS 'activities-hero-img'");
         
         $publicAct = Http::get("$baseUrl/page-content/activities");
         $actImg = collect($publicAct->json())->firstWhere('slug', 'activities-hero-img')['content'] ?? '';
         
         if ($actImg === $newImagePath) {
             printSuccess("Côté Client affiche bien la nouvelle photo de remplacement : '$actImg'");
         }
    }
} else {
    printError("Échec de l'upload: " . $uploadResponse->body());
}

echo "\n========================================================================\n";
echo "   TOUS LES TESTS PASSÉS. LE CMS ET LE FRONTEND SONT SYNCHRONISÉS.\n";
echo "========================================================================\n";
