<?php
$json = file_get_contents('http://localhost:8000/api/public/content/sur-mesure');
$data = json_decode($json, true);
$block = $data['sur-mesure-content'] ?? null;
if ($block) {
    echo "Slug: " . $block['slug'] . "\n";
    echo "Translations found: " . count($block['translations'] ?? []) . "\n";
    foreach($block['translations'] ?? [] as $t) {
        if ($t['locale'] === 'en') {
            echo "EN Translation Found! Length: " . strlen($t['content']) . "\n";
            echo "EN Content (first 50 chars): " . substr($t['content'], 0, 50) . "...\n";
        }
    }
} else {
    echo "Block sur-mesure-content not found in API response.\n";
}
