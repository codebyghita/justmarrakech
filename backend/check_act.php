<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$cms = \App\Models\PageContent::where('slug', 'sur-mesure-content')->first();
print_r($cms->content);


