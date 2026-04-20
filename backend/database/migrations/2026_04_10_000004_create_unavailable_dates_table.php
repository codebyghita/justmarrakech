<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('unavailable_dates', function (Blueprint $table) {
            $table->id();
            $table->string('unavailablable_type');
            $table->unsignedBigInteger('unavailablable_id');
            $table->date('date')->index();
            $table->timestamps();

            $table->unique(['unavailablable_type', 'unavailablable_id', 'date'], 'unavailability_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('unavailable_dates');
    }
};
