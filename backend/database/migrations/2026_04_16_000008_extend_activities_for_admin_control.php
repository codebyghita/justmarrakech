<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('activities', function (Blueprint $table) {
            $table->foreignId('activity_category_id')
                ->nullable()
                ->after('category')
                ->constrained('activity_categories')
                ->nullOnDelete();

            $table->boolean('featured')->default(false)->after('is_active');
            $table->json('formulas')->nullable()->after('not_included');
            $table->json('faq')->nullable()->after('formulas');
            $table->json('practical_info_points')->nullable()->after('faq');
            $table->json('reviews')->nullable()->after('practical_info_points');
        });
    }

    public function down(): void
    {
        Schema::table('activities', function (Blueprint $table) {
            $table->dropConstrainedForeignId('activity_category_id');
            $table->dropColumn([
                'featured',
                'formulas',
                'faq',
                'practical_info_points',
                'reviews',
            ]);
        });
    }
};

