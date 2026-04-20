<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = App\Models\User::first();
$user->password = bcrypt('marrakech2024');
$user->save();
echo "OK - Mot de passe réinitialisé pour : " . $user->email . PHP_EOL;
