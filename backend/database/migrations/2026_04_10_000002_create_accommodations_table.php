<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('accommodations', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique()->index();
            $table->string('title'); // Source (French)
            $table->text('description'); // Source (French)
            
            $table->string('type')->index();
            $table->string('location')->nullable();
            $table->decimal('price_per_night', 10, 2)->index();
            $table->integer('max_guests')->nullable();
            $table->json('images')->nullable();
            
            $table->boolean('featured')->default(false);
            $table->enum('status', ['draft', 'published'])->default('published')->index();
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();

            $table->fulltext(['title', 'description']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('accommodations');
    }
};
