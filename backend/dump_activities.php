<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$activities = App\Models\Activity::with('activityCategory')->get();
$data = $activities->map(function($a) {
    return [
        'id' => $a->id,
        'title' => $a->title,
        'category' => $a->activityCategory ? $a->activityCategory->slug : 'No Category',
        'featured' => $a->featured
    ];
});

file_put_contents('activities_dump.json', json_encode($data, JSON_PRETTY_PRINT));
echo "Dumped " . count($data) . " activities to activities_dump.json\n";
