<?php
use App\Models\PageContent;
use App\Models\Translation;

$footerBlock = PageContent::where('slug', 'footer-description')->first();

if ($footerBlock) {
    $translations = [
        ['locale' => 'en', 'field' => 'content', 'content' => 'Just Marrakech is your expert local agency for tailor-made stays and authentic experiences in the heart of Morocco.'],
        ['locale' => 'ar', 'field' => 'content', 'content' => 'جست مراكش هي وكالتك المحلية الخبيرة لتنظيم إقامات على المقاس وتجارب أصيلة في قلب المغرب.'],
        ['locale' => 'de', 'field' => 'content', 'content' => 'Just Marrakech ist Ihre kompetente lokale Agentur für maßgeschneiderte Aufenthalte und authentische Erlebnisse im Herzen Marokkos.'],
        ['locale' => 'it', 'field' => 'content', 'content' => 'Just Marrakech è la tua agenzia locale esperta per soggiorni su misura ed esperienze autentiche nel cuore del Marocco.'],
    ];

    foreach ($translations as $t) {
        Translation::updateOrCreate(
            ['translatable_id' => $footerBlock->id, 'translatable_type' => PageContent::class, 'locale' => $t['locale'], 'field' => $t['field']],
            ['content' => $t['content']]
        );
    }
    echo "Footer translations added successfully.";
} else {
    echo "Footer block not found.";
}
