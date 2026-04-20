<?php

namespace App\Observers;

use App\Models\PageContent;
use App\Models\Translation;
use App\Services\AutoTranslationService;
use Illuminate\Support\Facades\Log;

class PageContentObserver
{
    protected $translator;

    public function __construct(AutoTranslationService $translator)
    {
        $this->translator = $translator;
    }

    public function saved(PageContent $content): void
    {
        $fields = ['content'];
        
        foreach ($fields as $field) {
            if (($content->isDirty($field) || $content->wasRecentlyCreated) && !empty($content->$field)) {
                $translations = $this->translator->translateString((string) $content->$field);
                
                foreach ($translations as $locale => $translatedText) {
                    Translation::updateOrCreate(
                        [
                            'translatable_type' => get_class($content),
                            'translatable_id' => $content->id,
                            'locale' => $locale,
                            'field' => $field,
                        ],
                        ['content' => $translatedText]
                    );
                }
            }
        }
    }
}
