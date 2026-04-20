<?php
use App\Models\BlogPost;

$posts = [
    [
        'slug' => 'marrakech-adresses-secretes',
        'title' => 'Top 5 des Adresses Secrètes au Cœur de la Médina',
        'content' => "Marrakech regorge de trésors cachés derrière ses lourdes portes de cèdre. Dans cet article, l'équipe Just Marrakech vous dévoile ses trouvailles exclusives, loin du tumulte des souks touristiques.\n\n1. Le Jardin de la Tranquillité : Un havre de paix insoupçonné.\n2. La Galerie Ombragée : Pour les amoureux d'art contemporain.\n3. Le Thé sur les Toits : Une vue à 360° sur l'Atlas.\n\nVenez découvrir le vrai visage de la Ville Rouge avec nous.",
        'category' => 'Culture & Lifestyle',
        'image' => 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?q=80&w=2070&auto=format&fit=crop', // Beautiful riad
        'is_published' => true
    ],
    [
        'slug' => 'excursion-desert-aga faye',
        'title' => 'Une Nuit Magique sous les Étoiles du Désert d\'Agafay',
        'content' => "À seulement 45 minutes de Marrakech s'étend le désert de pierre d'Agafay. Une expérience hors du temps que nous recommandons à tous nos clients en quête de sérénité.\n\nDîner aux chandelles, musique traditionnelle et confort absolu sous des tentes berbères de luxe. Une évasion sensorielle inoubliable.",
        'category' => 'Évasion',
        'image' => 'https://images.unsplash.com/photo-1505305976870-c0be14402269?q=80&w=2070&auto=format&fit=crop', // Desert tent
        'is_published' => true
    ],
    [
        'slug' => 'gastronomie-marocaine-moderne',
        'title' => 'La Révolution de la Gastronomie Marocaine',
        'content' => "Oubliez le couscous traditionnel un instant. De nouveaux chefs réinventent les saveurs du terroir marocain avec une touche de modernité audacieuse.\n\nDécouvrez notre sélection des tables les plus créatives de Guéliz et de la Médina. Un voyage culinaire qui bouscule les codes.",
        'category' => 'Gastronomie',
        'image' => 'https://images.unsplash.com/photo-1512485800193-b2d3358f15c1?q=80&w=2070&auto=format&fit=crop', // Moroccan food
        'is_published' => true
    ]
];

foreach ($posts as $p) {
    BlogPost::firstOrCreate(['slug' => $p['slug']], $p);
}

echo "Premium Blog Posts added.";
