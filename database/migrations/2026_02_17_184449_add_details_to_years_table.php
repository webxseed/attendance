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
        Schema::table('years', function (Blueprint $table) {
            $table->string('title')->nullable(); // e.g. "فوج"
            $table->string('start_year')->nullable(); // e.g. "2025"
            $table->string('end_year')->nullable(); // e.g. "2026"
            // Make name nullable if we are transitioning, or we can use it to store the full string "فوج 2025-2026"
            $table->string('name')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('years', function (Blueprint $table) {
            $table->dropColumn(['title', 'start_year', 'end_year']);
            $table->string('name')->nullable(false)->change();
        });
    }
};
