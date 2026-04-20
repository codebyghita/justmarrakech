<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$categories = App\Models\ActivityCategory::all();
$data = $categories->map(function($c) {
    return [
        'id' => $c->id,
        'name' => $c->name,
        'slug' => $c->slug,
        'status' => $c->status
    ];
});

file_put_contents('categories_dump.json', json_encode($data, JSON_PRETTY_PRINT));
echo "Dumped " . count($data) . " categories to categories_dump.json\n";
