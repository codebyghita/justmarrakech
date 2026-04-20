<?php
use App\Models\PageContent;

$data = [
    // HOME
    ['section' => 'home', 'slug' => 'home-hero-img', 'type' => 'image', 'content' => '/hero.jfif'],
    
    // ACTIVITIES
    ['section' => 'activities', 'slug' => 'activities-hero-img', 'type' => 'image', 'content' => '/hero.jfif'],
    ['section' => 'activities', 'slug' => 'activities-hero-title', 'type' => 'text', 'content' => 'Activités & Expériences'],
    ['section' => 'activities', 'slug' => 'activities-hero-subtitle', 'type' => 'text', 'content' => 'Le meilleur de Marrakech, sélectionné par nos experts.'],
    
    // EXCURSIONS
    ['section' => 'excursions', 'slug' => 'excursions-hero-img', 'type' => 'image', 'content' => '/hero.jfif'],
    ['section' => 'excursions', 'slug' => 'excursions-hero-title', 'type' => 'text', 'content' => 'Excursions d\'Exception'],
    ['section' => 'excursions', 'slug' => 'excursions-hero-subtitle', 'type' => 'text', 'content' => 'Évadez-vous le temps d\'une journée au départ de Marrakech.'],
    
    // BLOG
    ['section' => 'blog', 'slug' => 'blog-hero-img', 'type' => 'image', 'content' => '/home_about.jfif'],
    ['section' => 'blog', 'slug' => 'blog-hero-title', 'type' => 'text', 'content' => 'Articles & Inspirations'],
    ['section' => 'blog', 'slug' => 'blog-hero-subtitle', 'type' => 'text', 'content' => 'Découvrez nos conseils exclusifs et l\'actualité de Marrakech.'],
];

foreach ($data as $item) {
    PageContent::firstOrCreate(
        ['slug' => $item['slug']],
        $item
    );
}

echo "CMS Seeds completed successfully.";
