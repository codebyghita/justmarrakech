<?php

namespace App\Traits;

use App\Models\Translation;
use Illuminate\Support\Facades\App;

trait HasTranslations
{
    /**
     * Boot the trait to add saved listener.
     */
    protected static function bootHasTranslations()
    {
        static::saved(function ($model) {
            $model->generateTranslations();
        });
    }

    /**
     * Get all of the model's translations.
     */
    public function translations()
    {
        return $this->morphMany(Translation::class, 'translatable');
    }

    /**
     * Define which fields are translatable.
     * Override this in the model's $translatable property.
     */
    public function getTranslatableFields(): array
    {
        return $this->translatable ?? [];
    }

    /**
     * Generate translations for all supported locales.
     */
    public function generateTranslations()
    {
        $fields = $this->getTranslatableFields();
        $locales = ['en', 'ar', 'es']; // Source is 'fr'
        $translator = app('translator.auto');

        foreach ($fields as $field) {
            $sourceData = $this->{$field};
            
            if (empty($sourceData)) continue;

            // Check if it's a JSON field (array in model due to $casts)
            if (is_array($sourceData)) {
                $translations = $translator->translateArray($sourceData);
                foreach ($translations as $locale => $translatedArray) {
                    Translation::updateOrCreate(
                        [
                            'translatable_type' => get_class($this),
                            'translatable_id' => $this->id,
                            'locale' => $locale,
                            'field' => $field,
                        ],
                        ['content' => json_encode($translatedArray)]
                    );
                }
            } else {
                // It's a simple string
                $translations = $translator->translateString($sourceData);
                foreach ($translations as $locale => $translatedText) {
                    Translation::updateOrCreate(
                        [
                            'translatable_type' => get_class($this),
                            'translatable_id' => $this->id,
                            'locale' => $locale,
                            'field' => $field,
                        ],
                        ['content' => $translatedText]
                    );
                }
            }
        }
    }

    /**
     * Get a translation for a specific field and locale.
     */
    public function translate(string $field, ?string $locale = null)
    {
        $locale = $locale ?? App::getLocale();

        if ($locale === 'fr') {
            return $this->{$field};
        }

        $translation = Translation::where('translatable_type', get_class($this))
            ->where('translatable_id' , $this->id)
            ->where('locale', $locale)
            ->where('field', $field)
            ->first();

        return $translation ? $translation->content : $this->{$field};
    }
}
