<?php

namespace App\Observers;

use App\Models\Accommodation;
use App\Models\Translation;
use App\Services\AutoTranslationService;
use Illuminate\Support\Facades\Log;

class AccommodationObserver
{
    protected $translator;

    public function __construct(AutoTranslationService $translator)
    {
        $this->translator = $translator;
    }

    public function saved(Accommodation $accommodation): void
    {
        $fields = ['title', 'description', 'location', 'type'];
        
        foreach ($fields as $field) {
            if (($accommodation->isDirty($field) || $accommodation->wasRecentlyCreated) && !empty($accommodation->$field)) {
                $translations = $this->translator->translateString((string) $accommodation->$field);
                
                foreach ($translations as $locale => $content) {
                    Translation::updateOrCreate(
                        [
                            'translatable_type' => get_class($accommodation),
                            'translatable_id' => $accommodation->id,
                            'locale' => $locale,
                            'field' => $field,
                        ],
                        ['content' => $content]
                    );
                }
            }
        }
    }
}
