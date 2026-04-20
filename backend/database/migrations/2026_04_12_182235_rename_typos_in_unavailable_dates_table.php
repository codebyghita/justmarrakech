<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('unavailable_dates', function (Blueprint $table) {
            $table->renameColumn('unavailablable_type', 'unavailable_type');
            $table->renameColumn('unavailablable_id', 'unavailable_id');
        });
    }

    public function down(): void
    {
        Schema::table('unavailable_dates', function (Blueprint $table) {
            $table->renameColumn('unavailable_type', 'unavailablable_type');
            $table->renameColumn('unavailable_id', 'unavailablable_id');
        });
    }
};
