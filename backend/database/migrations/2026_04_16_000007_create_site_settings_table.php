<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('site_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique()->index();
            $table->longText('value')->nullable();
            $table->timestamps();
        });

        $defaults = [
            'reservation_phone' => '+212714173661',
            'contact_email' => 'contact@justmarrakech.fr',
            'contact_address' => 'Marrakech, Maroc',
            'google_review_url' => '',
            'footer_brand_title' => 'just marrakech',
            'footer_description' => "Experiences authentiques et hebergements d'exception soigneusement curates pour les voyageurs en quete d'insolite.",
            'footer_menu' => [
                ['label' => 'Activites', 'path' => '/activities'],
                ['label' => 'Excursions', 'path' => '/excursions'],
                ['label' => 'Sur Mesure', 'path' => '/sur-mesure'],
                ['label' => 'Hebergements', 'path' => '/accommodations'],
                ['label' => 'Blog', 'path' => '/blog'],
            ],
            'footer_info_links' => [
                ['label' => 'Mentions Legales', 'url' => '/mentions-legales'],
                ['label' => 'Politiques de confidentialites', 'url' => '/politique-confidentialite'],
                ['label' => "Conditions d'utilisation (CGU)", 'url' => '/cgu'],
                ['label' => 'Politique de cookies', 'url' => '/cookies'],
            ],
            'social_links' => [
                'facebook' => 'https://www.facebook.com/profile.php?id=100094653772461',
                'instagram' => 'https://www.instagram.com/justmarrakech/',
                'tiktok' => 'https://www.tiktok.com/@justmarrakech?_r=1&_t=ZS-94luGit9gBQ',
            ],
        ];

        foreach ($defaults as $key => $value) {
            DB::table('site_settings')->insert([
                'key' => $key,
                'value' => json_encode($value, JSON_UNESCAPED_UNICODE),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('site_settings');
    }
};

