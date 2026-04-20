<?php
$dbh = new PDO('mysql:host=127.0.0.1;port=3307', 'root', '');
$dbh->exec('CREATE DATABASE IF NOT EXISTS justmarrakech;');
echo "Database justmarrakech created successfully!";
