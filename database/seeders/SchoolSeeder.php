<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Course;
use App\Models\Teacher;
use App\Models\Student;

class SchoolSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Admin user
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@school.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        // Teachers
        $teacherUser1 = User::create([
            'name' => 'Teacher One',
            'email' => 'teacher1@school.com',
            'password' => Hash::make('password'),
            'role' => 'teacher',
        ]);
        $teacher1 = Teacher::create([
            'user_id' => $teacherUser1->id,
            'phone' => '1234567890',
        ]);

        $teacherUser2 = User::create([
            'name' => 'Teacher Two',
            'email' => 'teacher2@school.com',
            'password' => Hash::make('password'),
            'role' => 'teacher',
        ]);
        $teacher2 = Teacher::create([
            'user_id' => $teacherUser2->id,
            'phone' => '0987654321',
        ]);

        // Courses
        $course1 = Course::create(['title' => 'Math 101', 'color' => '#FF0000', 'description' => 'Algebra basics']);
        $course2 = Course::create(['title' => 'Science 101', 'color' => '#00FF00', 'description' => 'Biology basics']);

        // Assign Teachers
        $course1->teachers()->attach($teacher1->id);
        $course2->teachers()->attach($teacher2->id);

        // Students
        $students = [];
        for ($i = 1; $i <= 10; $i++) {
            $student = Student::create([
                'full_name' => "Student $i",
                'external_code' => "STU$i",
                'notes' => "Active student",
            ]);
            $students[] = $student;
        }

        // Assign Students
        // Assign first 5 to Math, next 5 to Science
        foreach (array_slice($students, 0, 5) as $student) {
            $course1->students()->attach($student->id);
        }
        foreach (array_slice($students, 5, 5) as $student) {
            $course2->students()->attach($student->id);
        }
    }
}
