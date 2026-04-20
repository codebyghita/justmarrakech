<?php
$endpoints = [
    'http://127.0.0.1:8000/api/public/activities',
    'http://127.0.0.1:8000/api/public/categories',
    'http://127.0.0.1:8000/api/public/content/sur-mesure',
    'http://127.0.0.1:8000/api/public/content/excursions'
];

foreach ($endpoints as $url) {
    echo "Testing $url...\n";
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    echo "HTTP Code: $httpCode\n";
    if ($httpCode == 200) {
        $data = json_decode($response, true);
        echo "Count: " . count($data) . "\n";
        // print_r(array_keys($data));
    } else {
        echo "Error: $response\n";
    }
    echo "-------------------\n";
}
