<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('unavailable_slots', function (Blueprint $table) {
            $table->id();
            $table->string('unavailable_type')->index();
            $table->unsignedBigInteger('unavailable_id')->default(0)->index();
            $table->date('date')->index();
            $table->time('time')->nullable()->index();
            $table->timestamps();

            $table->unique(
                ['unavailable_type', 'unavailable_id', 'date', 'time'],
                'unavailable_slots_unique'
            );
        });

        if (Schema::hasTable('unavailable_dates')) {
            $oldRows = DB::table('unavailable_dates')->get();

            foreach ($oldRows as $row) {
                DB::table('unavailable_slots')->updateOrInsert(
                    [
                        'unavailable_type' => $row->unavailable_type,
                        'unavailable_id' => $row->unavailable_id,
                        'date' => $row->date,
                        'time' => null,
                    ],
                    [
                        'created_at' => $row->created_at ?? now(),
                        'updated_at' => now(),
                    ]
                );
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('unavailable_slots');
    }
};

