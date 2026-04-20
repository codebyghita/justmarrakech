<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

$fullContent = json_encode([
    "hero_title" => "VOTRE VOYAGE DE RÊVE SUR MESURE",
    "hero_subtitle" => "Chaque séjour est conçu autour de vos désirs, votre budget et votre rythme. Just Marrakech signe chaque expérience à la main.",
    "heroTags" => ["100% privé", "Hébergements vérifiés", "Guides locaux", "Transferts inclus", "Sur-mesure total"],
    "galleryImages" => [null, null, null],
    "sejourCards" => [
        ["title" => "Séjour Romantique", "subtitle" => "Riad privé • Dîner aux étoiles", "description" => "Une escapade pour deux, entre luxe discret et poésie marocaine.", "image" => null],
        ["title" => "Séjour Aventure", "subtitle" => "Quad • Désert • Excursions", "description" => "Adrénaline et découverte au cœur de la terre marocaine.", "image" => null],
        ["title" => "Séjour Famille", "subtitle" => "Activités enfants • Piscine • Confort", "description" => "Des souvenirs inoubliables pour toute la famille.", "image" => null]
    ],
    "keyInfos" => [
        ["label" => "Durée", "value" => "3 à 14 jours"],
        ["label" => "Groupe", "value" => "2 à 20 pers."],
        ["label" => "Transferts", "value" => "Aéroport inclus"],
        ["label" => "Flexibilité", "value" => "100% modulable"],
        ["label" => "Langue", "value" => "FR / EN / AR"]
    ],
    "targetAudiences" => [
        ["title" => "Couples & Lune de miel", "desc" => "Riads romantiques, dîners privés, hammam et moments rien que pour vous.", "icon" => "💑"],
        ["title" => "Familles", "desc" => "Activités adaptées aux enfants, hébergements spacieux et sécurité garantie.", "icon" => "👨‍👩‍👧‍👦"],
        ["title" => "Groupes & Amis", "desc" => "Organisation complète pour groupes : transports, guides, restauration.", "icon" => "🎉"],
        ["title" => "Voyageurs Solo", "desc" => "Rencontres authentiques, itinéraires sécurisés et accompagnement personnalisé.", "icon" => "🧭"]
    ],
    "whyChooseUs" => [
        ["title" => "Expertise Locale", "desc" => "10 ans sur le terrain à Marrakech. Nous connaissons chaque ruelle, chaque riad, chaque guide."],
        ["title" => "Tout Inclus", "desc" => "Hébergement, transferts, guides, activités. Vous n'avez qu'à profiter."],
        ["title" => "100% Personnalisé", "desc" => "Votre voyage est unique. Budget, rythme, intérêts — tout s'adapte à vous."]
    ],
    "programs" => [
        ["title" => "Jour 1 — Arrivée & Médina", "desc" => "Accueil à l'aéroport, installation dans votre riad. Premier tour de la médina au coucher du soleil. Dîner sur la terrasse."],
        ["title" => "Jour 2 — Souks & Culture", "desc" => "Visite guidée des souks, Medersa Ben Youssef, Musée de Marrakech. Atelier de cuisine marocaine l'après-midi."],
        ["title" => "Jour 3 — Excursion & Détente", "desc" => "Excursion dans la Palmeraie ou les cascades d'Ouzoud. Hammam traditionnel en soirée."]
    ],
    "formulas" => [
        ["title" => "Essentiel", "duration" => "3 jours / 2 nuits", "desc" => "L'essentiel de Marrakech pour un premier contact magique.", "pros" => ["Hébergement Riad sélectionné", "Transferts aéroport", "Guide privé 1 journée", "Plan de visite personnalisé"]],
        ["title" => "Premium", "duration" => "5 jours / 4 nuits", "desc" => "L'expérience complète avec activités et excursions incluses.", "pros" => ["Hébergement Riad 4★ sélectionné", "Tous les transferts inclus", "Guide privé bilingue", "2 Excursions au choix", "Dîner gastronomique marocain", "Session hammam & massage"]],
        ["title" => "Luxe", "duration" => "7 jours / 6 nuits", "desc" => "L'ultime séjour sur mesure, sans compromis.", "pros" => ["Riad ou Villa de luxe", "Conciergerie privée 24h/24", "Guide expert dédié", "Toutes excursions incluses", "Gastronomie & Expériences VIP", "Spa & Bien-être complet", "Transferts voiture privée"]]
    ],
    "inclusions" => [
        "included" => ["Hébergement dans un riad sélectionné", "Transferts aéroport aller-retour", "Guide privé francophone", "Petit-déjeuner marocain quotidien", "Accompagnement 24h/24 par WhatsApp"],
        "excluded" => ["Billets d'avion", "Repas non mentionnés", "Dépenses personnelles", "Assurance voyage (recommandée)"]
    ],
    "practicalInfos" => [
        ["label" => "Monnaie", "value" => "Dirham Marocain (MAD)"],
        ["label" => "Décalage", "value" => "GMT+1"],
        ["label" => "Visa", "value" => "Non requis (UE/FR)"],
        ["label" => "Meilleure saison", "value" => "Oct → Avr"],
        ["label" => "Langue", "value" => "Arabe, Français"]
    ],
    "faqs" => [
        ["q" => "Comment fonctionne le séjour sur mesure ?", "a" => "Vous nous contactez via WhatsApp ou le formulaire. Nous échangeons sur vos souhaits, budget et dates. Sous 24h, vous recevez une proposition détaillée et personnalisée."],
        ["q" => "Quand faut-il réserver ?", "a" => "Idéalement 3 à 4 semaines à l'avance. En haute saison (Noël, Pâques, été), comptez 6 à 8 semaines pour garantir vos hébergements préférés."],
        ["q" => "Les prix sont-ils négociables ?", "a" => "Chaque séjour est unique et nous nous adaptons à votre budget. Dites-nous votre enveloppe maximale et nous construisons le meilleur voyage possible dans ce cadre."],
        ["q" => "Est-ce sécurisé pour les familles ?", "a" => "Absolument. Marrakech est une destination familiale sûre. Nos guides connaissent les meilleures activités pour enfants et nous assurons une logistique sans stress."]
    ]
], JSON_UNESCAPED_UNICODE);

$existing = DB::table('page_contents')->where('slug', 'sur-mesure-content')->first();
$now = now();

if ($existing) {
    DB::table('page_contents')->where('slug', 'sur-mesure-content')->update([
        'content' => $fullContent,
        'updated_at' => $now,
    ]);
    echo "✅ UPDATED - sur-mesure-content mis à jour avec tout le contenu!\n";
} else {
    DB::table('page_contents')->insert([
        'slug'       => 'sur-mesure-content',
        'section'    => 'sur-mesure',
        'type'       => 'json',
        'content'    => $fullContent,
        'created_at' => $now,
        'updated_at' => $now,
    ]);
    echo "✅ CREATED - sur-mesure-content créé avec tout le contenu!\n";
}

echo "L'admin peut maintenant voir et modifier TOUT le contenu de la page Sur Mesure!\n";
