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
        Schema::table('students', function (Blueprint $table) {
            $table->date('date_of_birth')->nullable()->after('full_name');
            $table->string('identity_number')->nullable()->unique()->after('date_of_birth');
            $table->string('grade_level')->nullable()->after('identity_number');
            $table->string('school_name')->nullable()->after('grade_level');
            $table->text('address')->nullable()->after('school_name');
            $table->string('mother_name')->nullable()->after('address');
            $table->string('mother_phone')->nullable()->after('mother_name');
            $table->string('father_name')->nullable()->after('mother_phone');
            $table->string('father_phone')->nullable()->after('father_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropColumn([
                'date_of_birth',
                'identity_number',
                'grade_level',
                'school_name',
                'address',
                'mother_name',
                'mother_phone',
                'father_name',
                'father_phone',
            ]);
        });
    }
};
