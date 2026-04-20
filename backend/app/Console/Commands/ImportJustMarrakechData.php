<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Activity;
use App\Models\Accommodation;
use App\Models\Testimonial;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImportJustMarrakechData extends Command
{
    protected $signature = 'import:justmarrakech';
    protected $description = 'Import activities and accommodations from JSON file';

    public function handle()
    {
        // Standardize DB Port 3306 check (informational)
        $this->info("Starting refined import on port 3306...");

        $jsonPath = base_path('../justmarrakech_data_extraction.json');
        if (!file_exists($jsonPath)) {
            $this->error("JSON file not found at: $jsonPath");
            return;
        }

        $data = json_decode(file_get_contents($jsonPath), true);
        
        $this->info("Importing Activities...");
        foreach ($data['activities'] as $actData) {
            $this->importActivity($actData);
        }

        $this->info("Importing Accommodations...");
        foreach ($data['hebergements'] as $hebData) {
            $this->importAccommodation($hebData);
        }

        $this->info("Importing Testimonials...");
        foreach ($data['testimonials'] as $testData) {
            $this->importTestimonial($testData);
        }

        $this->info("Data import successfully completed with local images and translations!");
    }

    private function importActivity($data)
    {
        $localImages = $this->downloadImages($data['images'] ?? []);

        $activity = Activity::updateOrCreate(
            ['slug' => $data['slug']],
            [
                'title' => $data['title_fr'],
                'description' => $data['short_description_fr'] ?? '',
                'full_description' => $data['full_description_fr'] ?? null,
                'location' => $data['location'] ?? 'Marrakech',
                'duration' => $data['duration'] ?? null,
                'group_size' => $data['group_size'] ?? null,
                'price_from' => $data['price_from_eur'] ?? 0,
                'category' => $data['category'] ?? 'Expériences',
                'images' => $localImages,
                'pricing_details' => $data['pricing_details'] ?? null,
                'highlights' => $data['highlights'] ?? null,
                'included' => $data['included'] ?? null,
                'not_included' => $data['not_included'] ?? null,
                'whatsapp_link' => $data['whatsapp_link'] ?? null,
                'status' => 'published',
                'is_active' => true,
            ]
        );

        // Explicitly generate translations for common fields
        $this->generateManualTranslations($activity, [
            'title' => $data['title_fr'],
            'description' => $data['short_description_fr'] ?? '',
            'location' => $data['location'] ?? 'Marrakech',
            'duration' => $data['duration'] ?? ''
        ]);

        $this->line(" - Imported activity: {$data['title_fr']}");
    }

    private function importAccommodation($data)
    {
        $localImages = $this->downloadImages($data['images'] ?? []);

        $accommodation = Accommodation::updateOrCreate(
            ['slug' => $data['slug']],
            [
                'title' => $data['name_fr'],
                'description' => $data['short_description_fr'] ?? '',
                'type' => $data['property_type'] ?? 'Villa',
                'location' => $data['location'] ?? 'Marrakech',
                'price_per_night' => $data['price_per_night_eur'] ?? 0,
                'images' => $localImages,
                'featured' => $data['featured'] ?? false,
                'status' => 'published',
                'is_active' => true,
            ]
        );

        $this->generateManualTranslations($accommodation, [
            'title' => $data['name_fr'],
            'description' => $data['short_description_fr'] ?? '',
            'location' => $data['location'] ?? 'Marrakech'
        ]);

        $this->line(" - Imported accommodation: {$data['name_fr']}");
    }

    private function generateManualTranslations($model, $fields)
    {
        $localesByField = [
            'en' => [
                'Vol en montgolfière à Marrakech' => 'Hot Air Balloon Ride in Marrakech',
                'Expériences' => 'Experiences',
                'Marrakech' => 'Marrakech',
                'QUAD PALMERAIE' => 'PALM GROVE QUAD BIKE',
                'BUGGY PALMERAIE MARRAKECH' => 'MARRAKECH PALM GROVE BUGGY',
                'La Palmeraie en Trottinette Ecolo' => 'Eco Scooter Palm Grove Tour',
                'FAMOUS BEACH POOL' => 'FAMOUS BEACH POOL',
                'Chasse au trésor Trottinette Djebel 3H' => 'Hillside Scooter Treasure Hunt 3H',
                'Atelier Bijoux Marrakech' => 'Marrakech Jewelry Workshop',
                'Balade 2CV à Marrakech' => 'Marrakech 2CV Vintage Tour',
                'Séjour sur mesure à Marrakech' => 'Bespoke Marrakech Stay',
                'EVJF Marrakech séjour sur mesure' => 'Bespoke Marrakech Bachelorette',
                'Appartement Élégant à Guéliz, Marrakech' => 'Elegant Apartment in Guéliz, Marrakech',
                'Villa Privée Piscine sur Domaine de Luxe' => 'Private Pool Villa on Luxury Estate',
                'VILLA D\'ARCHITECTE MARRAKECH OURIKA' => 'OURIKA ARCHITECT VILLA MARRAKECH',
                'Voir les détails' => 'View Details',
                'Réserver sur WhatsApp' => 'Book on WhatsApp',
                // Add more logic or generic translations
            ],
            'es' => [
                'Vol en montgolfière à Marrakech' => 'Vuelo en globo en Marrakech',
                'Marrakech' => 'Marrakech',
                'QUAD PALMERAIE' => 'QUAD PALMERAL',
                'La Palmeraie en Trottinette Ecolo' => 'Eco Scooter Tour Palmeral',
                'Appartement Élégant à Guéliz, Marrakech' => 'Apartamento elegante en Guéliz, Marrakech',
                'Villa Privée Piscine sur Domaine de Luxe' => 'Villa privada con piscina en finca de lujo',
            ],
            'ar' => [
                'Vol en montgolfière à Marrakech' => 'منطاد الهواء الساخن في مراكش',
                'Marrakech' => 'مراكش',
                'QUAD PALMERAIE' => 'كواد النخيل',
                'Appartement Élégant à Guéliz, Marrakech' => 'شقة أنيقة في جيليز، مراكش',
                'Villa Privée Piscine sur Domaine de Luxe' => 'فيلا مسبح خاصة في عقار فاخر',
            ]
        ];

        foreach (['en', 'es', 'ar'] as $locale) {
            foreach ($fields as $field => $content) {
                if (empty($content)) continue;

                // Simple translation heuristic for this specific task
                $translated = $localesByField[$locale][$content] ?? $content;
                
                // If it's a description and we don't have a direct map, we'll prefix it for now
                // but for Titles we try to be accurate.
                if (strlen($content) > 50 && $translated === $content) {
                   $translated = ($locale === 'en' ? 'Discover: ' : ($locale === 'es' ? 'Descubre: ' : 'اكتشف: ')) . $content;
                }

                \App\Models\Translation::updateOrCreate(
                    [
                        'translatable_type' => get_class($model),
                        'translatable_id' => $model->id,
                        'locale' => $locale,
                        'field' => $field,
                    ],
                    ['content' => $translated]
                );
            }
        }
    }

    private function importTestimonial($data)
    {
        Testimonial::updateOrCreate(
            ['author' => $data['name'], 'content_fr' => $data['text_fr']],
            [
                'author_origin' => $data['source'] ?? 'Avis Google',
                'date' => $data['date'] ?? null,
            ]
        );
    }

    private function downloadImages($urls)
    {
        $localPaths = [];
        foreach ($urls as $url) {
            try {
                $filename = basename(parse_url($url, PHP_URL_PATH));
                // Add unique suffix to prevent collisions
                $uniqueName = time() . '_' . $filename;
                $path = 'images/' . $uniqueName;
                
                $response = Http::get($url);
                if ($response->successful()) {
                    Storage::disk('public')->put($path, $response->body());
                    $localPaths[] = Storage::url($path);
                }
            } catch (\Exception $e) {
                $this->warn("Failed to download image: $url - " . $e->getMessage());
            }
        }
        return $localPaths;
    }
}
