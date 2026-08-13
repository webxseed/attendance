<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Introduce classes ("شعبة") between a course and its students.
 *
 * A course becomes the subject (title, colour, description, category) and each
 * class carries its own academic year, roster, teachers, schedule and
 * attendance. Every existing course is converted into a course + one class that
 * inherits its year, roster and attendance history.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('course_classes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->foreignId('year_id')->nullable()->constrained('years')->onDelete('set null');
            $table->integer('year')->nullable();
            $table->json('schedule_details')->nullable();
            $table->boolean('is_pinned')->default(false);
            $table->timestamp('archived_at')->nullable();
            $table->timestamps();
        });

        Schema::create('class_student', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_class_id')->constrained('course_classes')->onDelete('cascade');
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->unique(['course_class_id', 'student_id']);
        });

        Schema::create('class_teacher', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_class_id')->constrained('course_classes')->onDelete('cascade');
            $table->foreignId('teacher_id')->constrained()->onDelete('cascade');
            $table->unique(['course_class_id', 'teacher_id']);
        });

        // --- Backfill: one class per existing course -------------------------
        DB::statement("
            INSERT INTO course_classes
                (course_id, name, year_id, year, schedule_details, is_pinned, archived_at, created_at, updated_at)
            SELECT id, 'شعبة 1', year_id, year, schedule_details, is_pinned, archived_at, created_at, updated_at
            FROM courses
        ");

        DB::statement('
            INSERT INTO class_student (course_class_id, student_id)
            SELECT cc.id, cs.student_id
            FROM course_student cs
            JOIN course_classes cc ON cc.course_id = cs.course_id
        ');

        DB::statement('
            INSERT INTO class_teacher (course_class_id, teacher_id)
            SELECT cc.id, ct.teacher_id
            FROM course_teacher ct
            JOIN course_classes cc ON cc.course_id = ct.course_id
        ');

        // --- Attendance moves from the course to the class -------------------
        Schema::table('attendance_sessions', function (Blueprint $table) {
            $table->foreignId('course_class_id')->nullable()->after('id')
                ->constrained('course_classes')->onDelete('cascade');
        });

        DB::statement('
            UPDATE attendance_sessions s
            JOIN course_classes cc ON cc.course_id = s.course_id
            SET s.course_class_id = cc.id
        ');

        // Any orphan session (course already gone) would violate the new NOT NULL.
        DB::table('attendance_sessions')->whereNull('course_class_id')->delete();

        Schema::table('attendance_sessions', function (Blueprint $table) {
            $table->dropForeign(['course_id']);
            $table->dropUnique('attendance_sessions_course_id_date_unique');
            $table->dropColumn('course_id');
        });

        // Raw MODIFY keeps the existing foreign key in place.
        DB::statement('ALTER TABLE attendance_sessions MODIFY course_class_id BIGINT UNSIGNED NOT NULL');

        Schema::table('attendance_sessions', function (Blueprint $table) {
            $table->unique(['course_class_id', 'date']);
        });

        // --- Retire the course-level roster and scheduling -------------------
        Schema::dropIfExists('course_student');
        Schema::dropIfExists('course_teacher');

        Schema::table('courses', function (Blueprint $table) {
            $table->dropForeign(['year_id']);
            $table->dropColumn(['year_id', 'year', 'schedule_details', 'is_pinned']);
        });
    }

    public function down(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->integer('year')->nullable();
            $table->json('schedule_details')->nullable();
            $table->foreignId('year_id')->nullable()->constrained('years')->onDelete('set null');
            $table->boolean('is_pinned')->default(false);
        });

        // Restore course-level values from each course's first class.
        DB::statement('
            UPDATE courses c
            JOIN (
                SELECT course_id, MIN(id) AS class_id FROM course_classes GROUP BY course_id
            ) first_class ON first_class.course_id = c.id
            JOIN course_classes cc ON cc.id = first_class.class_id
            SET c.year_id = cc.year_id,
                c.year = cc.year,
                c.schedule_details = cc.schedule_details,
                c.is_pinned = cc.is_pinned
        ');

        Schema::create('course_student', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->unique(['course_id', 'student_id']);
        });

        Schema::create('course_teacher', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->foreignId('teacher_id')->constrained()->onDelete('cascade');
            $table->unique(['course_id', 'teacher_id']);
        });

        DB::statement('
            INSERT IGNORE INTO course_student (course_id, student_id)
            SELECT cc.course_id, cs.student_id
            FROM class_student cs
            JOIN course_classes cc ON cc.id = cs.course_class_id
        ');

        DB::statement('
            INSERT IGNORE INTO course_teacher (course_id, teacher_id)
            SELECT cc.course_id, ct.teacher_id
            FROM class_teacher ct
            JOIN course_classes cc ON cc.id = ct.course_class_id
        ');

        Schema::table('attendance_sessions', function (Blueprint $table) {
            $table->foreignId('course_id')->nullable()->after('id')->constrained()->onDelete('cascade');
        });

        DB::statement('
            UPDATE attendance_sessions s
            JOIN course_classes cc ON cc.id = s.course_class_id
            SET s.course_id = cc.course_id
        ');

        // Several classes of one course collapse onto the same (course, date).
        DB::statement('
            DELETE s FROM attendance_sessions s
            JOIN attendance_sessions keep
              ON keep.course_id = s.course_id AND keep.date = s.date AND keep.id < s.id
        ');

        DB::table('attendance_sessions')->whereNull('course_id')->delete();

        Schema::table('attendance_sessions', function (Blueprint $table) {
            $table->dropForeign(['course_class_id']);
            $table->dropUnique(['course_class_id', 'date']);
            $table->dropColumn('course_class_id');
        });

        DB::statement('ALTER TABLE attendance_sessions MODIFY course_id BIGINT UNSIGNED NOT NULL');

        Schema::table('attendance_sessions', function (Blueprint $table) {
            $table->unique(['course_id', 'date']);
        });

        Schema::dropIfExists('class_student');
        Schema::dropIfExists('class_teacher');
        Schema::dropIfExists('course_classes');
    }
};
