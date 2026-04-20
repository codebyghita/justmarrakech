<?php
use App\Models\PageContent;
use App\Models\SiteSetting;

// 1. CMS Blocks for Footer Description (Translatable)
$cmsData = [
    ['section' => 'settings', 'slug' => 'footer-description', 'type' => 'text', 'content' => 'Just Marrakech est votre agence locale experte pour des séjours sur-mesure et des expériences authentiques au cœur du Maroc.'],
];

foreach ($cmsData as $item) {
    PageContent::firstOrCreate(['slug' => $item['slug']], $item);
}

// 2. Settings for Footer Links (JSON)
$defaultLinks = [
    ['label' => 'Mentions Légales', 'url' => '/mentions-legales'],
    ['label' => 'Politique de Confidentialité', 'url' => '/privacy'],
    ['label' => 'Conditions Générales', 'url' => '/tos'],
];

SiteSetting::updateOrCreate(
    ['key' => 'footer_info_links'],
    [
        'label' => 'Liens du Footer (JSON)',
        'value' => json_encode($defaultLinks),
        'type' => 'text',
        'section' => 'footer'
    ]
);

// Ensure footer_brand_title exists
SiteSetting::updateOrCreate(
    ['key' => 'footer_brand_title'],
    [
        'label' => 'Nom de la marque (Footer)',
        'value' => 'just marrakech',
        'type' => 'text',
        'section' => 'footer'
    ]
);

echo "Footer Seeds completed successfully.";
