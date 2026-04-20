<?php

namespace App\Services;

class MockTranslator
{
    /**
     * Mock translation logic.
     * In a real scenario, this would call Google Translate or DeepL.
     */
    public function translate(string $text, string $locale): string
    {
        // Simple mock tagging
        switch ($locale) {
            case 'en': 
                return '[EN] ' . $text;
            case 'ar': 
                return '[AR] ' . $text; // Removed strrev() to prevent UTF-8 corruption
            case 'es': 
                return '[ES] ' . $text;
            default:
                return $text;
        }
    }
}
