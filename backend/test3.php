<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

$request = Illuminate\Http\Request::create('/api/admin/activities', 'POST', [
    'title' => 'Test API Delete',
    'description' => 'Desc',
    'price_from' => 10,
    'status' => 'draft'
]);
// Bypass auth for test by directly hitting controller or we can't easily without a token.
// Actually lets just hit the Activity model directly, we already know the DB layer works.
