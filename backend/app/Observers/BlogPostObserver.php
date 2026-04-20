<?php

namespace App\Observers;

use App\Models\BlogPost;
use App\Models\Translation;
use App\Services\AutoTranslationService;
use Illuminate\Support\Facades\Log;

class BlogPostObserver
{
    protected $translator;

    public function __construct(AutoTranslationService $translator)
    {
        $this->translator = $translator;
    }

    public function saved(BlogPost $post): void
    {
        $fields = ['title', 'excerpt', 'content', 'category'];
        
        foreach ($fields as $field) {
            if (($post->isDirty($field) || $post->wasRecentlyCreated) && !empty($post->$field)) {
                $translations = $this->translator->translateString((string) $post->$field);
                
                foreach ($translations as $locale => $content) {
                    Translation::updateOrCreate(
                        [
                            'translatable_type' => get_class($post),
                            'translatable_id' => $post->id,
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
