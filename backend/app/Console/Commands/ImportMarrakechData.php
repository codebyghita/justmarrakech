<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use App\Models\Activity;
use App\Models\Accommodation;
use App\Models\Testimonial;
use Illuminate\Support\Str;

class ImportMarrakechData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import:marrakech-data';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Imports data from justmarrakech_data_extraction.json and downloads images';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $jsonPath = base_path('../justmarrakech_data_extraction.json');
        
        if (!file_exists($jsonPath)) {
            $this->error("Data file not found at: $jsonPath");
            return;
        }

        $data = json_decode(file_get_contents($jsonPath), true);
        
        if (!$data) {
            $this->error("Failed to parse JSON file.");
            return;
        }

        $this->info("Importing Activities...");
        foreach ($data['activities'] ?? [] as $act) {
            $localImages = $this->downloadImages($act['images'] ?? [], 'activities');
            
            Activity::updateOrCreate(
                ['title' => $act['title_fr']],
                [
                    'description' => $act['short_description_fr'],
                    'full_description' => $act['full_description_fr'] ?? null,
                    'location' => $act['location'] ?? null,
                    'duration' => $act['duration'] ?? null,
                    'group_size' => $act['group_size'] ?? null,
                    'price_from' => $act['price_from_eur'] ?? 0,
                    'category' => $act['category'] ?? null,
                    'images' => $localImages,
                    'pricing_details' => $act['pricing_details'] ?? null,
                    'highlights' => $act['highlights'] ?? null,
                    'included' => $act['included'] ?? null,
                    'not_included' => $act['not_included'] ?? null,
                    'whatsapp_link' => $act['whatsapp_link'] ?? null,
                    'status' => 'published',
                ]
            );
        }

        $this->info("Importing Accommodations...");
        foreach ($data['hebergements'] ?? [] as $heb) {
            $localImages = $this->downloadImages($heb['images'] ?? [], 'accommodations');

            Accommodation::updateOrCreate(
                ['title' => $heb['name_fr']],
                [
                    'description' => $heb['short_description_fr'],
                    'type' => $heb['property_type'] ?? 'Unknown',
                    'location' => $heb['location'] ?? null,
                    'price_per_night' => $heb['price_per_night_eur'] ?? 0,
                    'max_guests' => null, // Not explicitly in the provided snippet but could be added
                    'images' => $localImages,
                    'featured' => $heb['featured'] ?? false,
                    'status' => 'published',
                ]
            );
        }

        $this->info("Importing Testimonials...");
        foreach ($data['testimonials'] ?? [] as $test) {
            Testimonial::updateOrCreate(
                [
                    'author' => $test['name'],
                    'content_fr' => $test['text_fr'],
                ],
                [
                    'author_origin' => $test['source'] ?? null,
                    'rating' => '5', // Defaulting as it's not strictly in JSON snippet
                    'date' => $test['date'] ?? null,
                ]
            );
        }

        $this->info("Import Complete. Translations were generated automatically by the HasTranslations trait.");
    }

    private function downloadImages(array $urls, string $folder): array
    {
        $localPaths = [];
        
        foreach ($urls as $url) {
            $filename = basename(parse_url($url, PHP_URL_PATH));
            $path = "public/images/$folder/" . uniqid() . '_' . $filename;
            
            if (!Storage::exists("public/images/$folder")) {
                Storage::makeDirectory("public/images/$folder");
            }

            try {
                $contents = file_get_contents($url);
                if ($contents) {
                    Storage::put($path, $contents);
                    $localPaths[] = str_replace('public/', 'storage/', $path);
                    $this->line("Downloaded: $filename");
                }
            } catch (\Exception $e) {
                $this->error("Failed to download image: $url");
            }
        }
        
        return $localPaths;
    }
}
