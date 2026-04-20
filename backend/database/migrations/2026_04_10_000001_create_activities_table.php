<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activities', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique()->index();
            $table->string('title'); // Source (French)
            $table->text('description'); // Source (French)
            $table->text('full_description')->nullable();
            
            $table->string('location')->nullable();
            $table->string('duration')->nullable();
            $table->string('group_size')->nullable();
            $table->decimal('price_from', 10, 2);
            $table->string('category')->nullable();
            
            $table->json('images')->nullable();
            $table->json('pricing_details')->nullable();
            $table->json('highlights')->nullable();
            $table->json('included')->nullable();
            $table->json('not_included')->nullable();
            
            $table->string('whatsapp_link')->nullable();
            $table->enum('status', ['draft', 'published'])->default('published')->index();
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();

            $table->fulltext(['title', 'description']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activities');
    }
};
