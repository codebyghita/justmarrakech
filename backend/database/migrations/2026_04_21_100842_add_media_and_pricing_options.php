<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('activities', function (Blueprint $table) {
            $table->boolean('is_blocking_enabled')->default(true);
            $table->string('meta_description', 500)->nullable();
            $table->string('location_address')->nullable();
            $table->text('google_maps_url')->nullable();
        });

        Schema::table('blog_posts', function (Blueprint $table) {
            $table->string('meta_description', 500)->nullable();
        });

        Schema::table('site_settings', function (Blueprint $table) {
            $table->string('default_currency', 10)->default('MAD');
            $table->string('legal_mentions_link', 500)->nullable();
            $table->string('cgv_link', 500)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('activities', function (Blueprint $table) {
            $table->dropColumn(['is_blocking_enabled', 'meta_description', 'location_address', 'google_maps_url']);
        });

        Schema::table('blog_posts', function (Blueprint $table) {
            $table->dropColumn('meta_description');
        });

        Schema::table('site_settings', function (Blueprint $table) {
            $table->dropColumn(['default_currency', 'legal_mentions_link', 'cgv_link']);
        });
    }
};
