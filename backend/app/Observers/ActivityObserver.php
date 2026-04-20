<?php

namespace App\Observers;

use App\Models\Activity;
use App\Models\Translation;
use App\Services\AutoTranslationService;
use Illuminate\Support\Facades\Log;

class ActivityObserver
{
    protected $translator;

    public function __construct(AutoTranslationService $translator)
    {
        $this->translator = $translator;
    }

    public function saved(Activity $activity): void
    {
        // Avoid infinite loop if we update something here (though we update a different table)
        // We only translate if the title or description changed or it's new
        
        $fields = ['title', 'description', 'category', 'duration', 'group_size'];
        
        foreach ($fields as $field) {
            if (($activity->isDirty($field) || $activity->wasRecentlyCreated) && !empty($activity->$field)) {
                $translations = $this->translator->translateString((string) $activity->$field);
                
                foreach ($translations as $locale => $content) {
                    Translation::updateOrCreate(
                        [
                            'translatable_type' => get_class($activity),
                            'translatable_id' => $activity->id,
                            'locale' => $locale,
                            'field' => $field,
                        ],
                        ['content' => $content]
                    );
                }
            }
        }

        // Handle JSON lists (Included / Not Included)
        $listFields = ['included', 'not_included'];
        foreach ($listFields as $field) {
            if ($activity->isDirty($field) || $activity->wasRecentlyCreated) {
                $items = $activity->$field;
                if (is_array($items) && !empty($items)) {
                    $translations = $this->translator->translateArray($items);
                    foreach ($translations as $locale => $translatedItems) {
                        Translation::updateOrCreate(
                            [
                                'translatable_type' => get_class($activity),
                                'translatable_id' => $activity->id,
                                'locale' => $locale,
                                'field' => $field, // Storing serialized JSON in content
                            ],
                            ['content' => json_encode($translatedItems)]
                        );
                    }
                }
            }
        }
    }
}
