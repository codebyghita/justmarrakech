<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AutoTranslationService
{
    protected $apiKey;
    protected $model;
    protected $locales = ['en', 'ar', 'es'];

    public function __construct()
    {
        $this->apiKey = env('HUGGINGFACE_API_KEY');
        $this->model = env('TRANSLATION_MODEL', 'facebook/nllb-200-distilled-600M');
    }

    /**
     * Translate a string into target locales.
     * Returns array ['en' => '...', 'ar' => '...', 'es' => '...']
     */
    public function translateString(string $text, string $source = 'fr'): array
    {
        if (empty($text) || empty($this->apiKey) || $this->apiKey === 'hf_your_token_here') {
            return [];
        }

        $translations = [];

        foreach ($this->locales as $locale) {
            try {
                $response = Http::withHeaders([
                    'Authorization' => 'Bearer ' . $this->apiKey,
                ])->post("https://api-inference.huggingface.co/models/" . $this->model, [
                    'inputs' => $text,
                    'parameters' => [
                        'src_lang' => $this->mapLocale($source),
                        'tgt_lang' => $this->mapLocale($locale),
                    ]
                ]);

                if ($response->successful()) {
                    $json = $response->json();
                    // Some models return [{'translation_text': '...'}]
                    $translations[$locale] = $json[0]['translation_text'] ?? $json['translation_text'] ?? $text;
                } else {
                    Log::warning("HF Translation Status Error: " . $response->status() . " Body: " . $response->body());
                    $translations[$locale] = $text;
                }
            } catch (\Exception $e) {
                Log::error("HF Translation Exception: " . $e->getMessage());
                $translations[$locale] = $text;
            }
        }

        return $translations;
    }

    /**
     * Translate an array of strings.
     */
    public function translateArray(array $items, string $source = 'fr'): array
    {
        if (empty($items)) return [];

        $translations = [];
        foreach ($this->locales as $locale) {
            $translatedItems = [];
            foreach ($items as $item) {
                $res = $this->translateString($item, $source);
                $translatedItems[] = $res[$locale] ?? $item;
            }
            $translations[$locale] = $translatedItems;
        }

        return $translations;
    }

    /**
     * Map common locales to model-specific codes (e.g. for NLLB)
     */
    protected function mapLocale(string $locale): string
    {
        $map = [
            'fr' => 'fra_Latn',
            'en' => 'eng_Latn',
            'ar' => 'ara_Arab',
            'es' => 'spa_Latn',
        ];

        return $map[$locale] ?? $locale;
    }
}
