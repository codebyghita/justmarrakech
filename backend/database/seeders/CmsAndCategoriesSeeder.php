<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ActivityCategory;
use App\Models\Activity;
use App\Models\PageContent;
use App\Models\SiteSetting;

class CmsAndCategoriesSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Categories
        $categories = [
            [
                'slug' => 'bien-etre',
                'name' => 'Bien-Etre',
                'image' => 'https://justmarrakech.com/storage/2024/04/24/la-sultana-hammam-spa.jpg',
                'hero_title' => 'Activites bien-etre a Marrakech',
                'hero_subtitle' => 'Hammam, spa et massages',
                'hero_description' => "Marrakech est l'une des destinations les plus reputees pour les experiences de bien-etre. Entre hammams traditionnels, spas de riads et soins relaxants, la ville offre de nombreuses possibilites pour se detendre pendant son sejour.",
                'hero_support' => "Que vous souhaitiez decouvrir un hammam marocain authentique ou profiter d'un massage relaxant dans un spa haut de gamme, nous avons selectionne des etablissements reconnus pour la qualite de leurs prestations.",
                'badges' => ['Selection testee', 'Reservation WhatsApp', 'Conditions claires', 'Couples & groupes'],
            ],
            [
                'slug' => 'culturelles',
                'name' => 'Culturelles',
                'image' => 'https://justmarrakech.com/storage/2024/09/15/souks-marrakech-visite-just-marrakech-1726423771.jpg',
                'hero_title' => 'Activites culturelles a Marrakech',
                'hero_subtitle' => 'Medina, artisanat et patrimoine',
                'hero_description' => "Explorez la medina, les souks et les lieux les plus emblematiques de Marrakech a travers une selection d'experiences pensees pour comprendre la ville au-dela des circuits rapides.",
                'hero_support' => "Guides, ateliers, balades et rencontres avec les artisans: nous gardons le contenu de WordPress, mais dans une presentation plus claire et plus elegante.",
                'badges' => ['Selection testee', 'Reservation WhatsApp', 'Guide prive possible', 'Couples & groupes'],
            ],
            [
                'slug' => 'experiences',
                'name' => 'Experiences',
                'image' => 'https://justmarrakech.com/storage/2024/09/15/souks-marrakech-visite-just-marrakech-1726423771.jpg',
                'hero_title' => 'Experiences a Marrakech',
                'hero_subtitle' => 'Aventure, desert et sensations',
                'hero_description' => "Montgolfiere, quad, buggy, side-car ou chasse au tresor: cette categorie rassemble les experiences les plus immersives et les plus memorables a vivre autour de Marrakech.",
                'hero_support' => "Chaque fiche garde ses photos, ses inclusions, ses formules et sa reservation WhatsApp, tout en restant dans votre UI premium.",
                'badges' => ['Selection testee', 'Reservation WhatsApp', 'Vehicule adapte au groupe', 'Couples & groupes'],
            ],
            [
                'slug' => 'piscines',
                'name' => 'Piscines',
                'image' => 'http://localhost:8000/storage/images/1775831889_image-the-lemonary-villa-privee-piscine-just-marrakech-1727870496-360x240.jpg',
                'hero_title' => 'Piscines a Marrakech',
                'hero_subtitle' => 'Day pass, villas et adresses detente',
                'hero_description' => "Retrouvez ici les experiences piscine et beach club a Marrakech, avec un format plus lisible pour le client et des contenus facilement gerables ensuite dans l'admin.",
                'hero_support' => "La structure est deja prete pour que toutes les adresses, horaires, photos et conditions soient ajoutees proprement par la suite.",
                'badges' => ['Selection testee', 'Reservation WhatsApp', 'Conditions claires', 'Day pass & groupes'],
            ],
            [
                'slug' => 'diners-soirees',
                'name' => 'Diners & Soirees',
                'image' => 'https://justmarrakech.com/storage/2024/10/07/stand-street-food-marrakech-by-night-visite-guidee-souk-just-marrakech-1728324739.jpg',
                'hero_title' => 'Diners et soirees a Marrakech',
                'hero_subtitle' => 'Street food, tables locales et ambiance',
                'hero_description' => "Cette categorie rassemble les experiences gourmandes et les sorties du soir: adresses locales, street food, diners et moments a partager en couple ou en groupe.",
                'hero_support' => "Le contenu reste celui de WordPress, mais la lecture est plus simple et le parcours de reservation plus clair.",
                'badges' => ['Selection testee', 'Reservation WhatsApp', 'Conditions claires', 'Couples & groupes'],
            ],
            [
                'slug' => 'excursions',
                'name' => 'Excursions',
                'image' => 'https://justmarrakech.com/storage/2024/09/15/dromadaire-desert-marrakech-just-marrakech-1726423771.jpg',
                'hero_title' => 'Excursions au depart de Marrakech',
                'hero_subtitle' => 'Desert, montagnes et ocean',
                'hero_description' => "Quittez l'agitation de la ville pour une journee ou plus. Nous avons selectionne pour vous les plus belles echappees: desert d'Agafay, vallee de l'Ourika, cascades d'Ouzoud ou encore Essaouira.",
                'hero_support' => "Transport prive, chauffeur professionnel et itineraire soigne: nos excursions sont concues pour vous offrir une experience exclusive et sans contrainte.",
                'badges' => ['Selection testee', 'Chauffeur prive', 'Climatisation', 'Tout inclus'],
            ],
        ];


        foreach ($categories as $cat) {
            ActivityCategory::updateOrCreate(['slug' => $cat['slug']], $cat);
        }

        // 2. Link Activities (Hardcoded IDs based on current database state)
        $mappings = [
            42 => 'experiences',
            43 => 'experiences',
            45 => 'culturelles',
            46 => 'culturelles',
            48 => 'culturelles',
            49 => 'diners-soirees',
            52 => 'experiences',
            53 => 'experiences',
            54 => 'bien-etre',
            57 => 'experiences',
            59 => 'experiences',
            60 => 'experiences',
        ];

        foreach ($mappings as $activityId => $categorySlug) {
            $cat = ActivityCategory::where('slug', $categorySlug)->first();
            if ($cat) {
                Activity::where('id', $activityId)->update([
                    'activity_category_id' => $cat->id,
                    'featured' => in_array($activityId, [42, 43, 48, 49, 52, 54])
                ]);
            }
        }

        // 3. Page Content (CMS)
        $contents = [
            // Home
            [
                'slug' => 'home-hero-title',
                'section' => 'home',
                'content' => "Votre sejour sur-mesure a Marrakech",
                'type' => 'text'
            ],
            [
                'slug' => 'home-hero-subtitle',
                'section' => 'home',
                'content' => "Just Marrakech selectionne pour vous les meilleures adresses et experiences pour un sejour authentique et inoubliable.",
                'type' => 'text'
            ],
            [
                'slug' => 'home-how-it-works-steps',
                'section' => 'home',
                'type' => 'json',
                'content' => [
                    'Vous nous donnez vos infos : budget + personnes + nuitees + dates + envies.',
                    'Vous recevez des propositions personnalisees (descriptions + photos).',
                    "On affine ensemble jusqu'a ce que ce soit parfait.",
                    'Vous recevez un planning clair.',
                    "On s'occupe des reservations selon votre validation.",
                ]
            ],
            // Activities
            [
                'slug' => 'activities-landing-title',
                'section' => 'activities',
                'content' => "Reservation activites a Marrakech",
                'type' => 'text'
            ],
            [
                'slug' => 'activities-landing-subtitle',
                'section' => 'activities',
                'content' => "Decouvrez les meilleures activites a Marrakech selectionnees par Just Marrakech.",
                'type' => 'text'
            ],
            [
                'slug' => 'activities-landing-badges',
                'section' => 'activities',
                'type' => 'json',
                'content' => ['Selection testee', 'Reservation WhatsApp', 'Vehicule adapte au groupe', 'Couples & groupes']
            ],
            // Sur Mesure
            [
                'slug' => 'sur-mesure-hero-title',
                'section' => 'sur-mesure',
                'content' => "Votre sejour sur-mesure",
                'type' => 'text'
            ],
            [
                'slug' => 'sur-mesure-hero-subtitle',
                'section' => 'sur-mesure',
                'content' => "Just Marrakech concoit pour vous l'itinerale parfait selon votre budget et vos envies.",
                'type' => 'text'
            ],
            [
                'slug' => 'sur-mesure-steps',
                'section' => 'sur-mesure',
                'type' => 'json',
                'content' => [
                    [
                        'title' => 'Partagez votre budget',
                        'desc' => "Dites-nous votre budget total et vos dates. Pas de jugement, pas de superflu.",
                        'icon' => '💬'
                    ],
                    [
                        'title' => 'Nous concevons votre sejour',
                        'desc' => "Notre equipe selectionne l'hebergement, les activites et les excursions dans votre enveloppe.",
                        'icon' => '✨'
                    ],
                    [
                        'title' => 'Vous validez et profitez',
                        'desc' => "On s'occupe de tout. Il ne vous reste plus qu'a faire vos valises.",
                        'icon' => '🌴'
                    ],
                ]
            ],
        ];


        foreach ($contents as $content) {
            PageContent::updateOrCreate(['slug' => $content['slug']], $content);
        }

        // 4. Site Settings
        $settings = [
            'whatsapp_number' => '212714173661',
            'footer_description' => "Just Marrakech est votre conciergerie locale dediee a la creation de sejours sur-mesure et d'experiences authentiques a travers la ville ocre.",
            'google_review_url' => 'https://g.page/r/CVf-_qyR76RfEBM/review',
            'instagram_url' => 'https://instagram.com/justmarrakech',
            'tiktok_url' => 'https://tiktok.com/@justmarrakech',
            'facebook_url' => 'https://facebook.com/justmarrakech',
        ];

        foreach ($settings as $key => $value) {
            SiteSetting::updateOrCreate(['key' => $key], ['value' => $value]);
        }
    }
}
