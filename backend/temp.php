<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

try {
    $act = \App\Models\Activity::latest()->first();
    if ($act) {
        $act->delete();
        echo "Deleted successfully";
    } else {
        echo "No activities to delete";
    }
} catch (\Exception $e) {
    echo $e->getMessage();
}
