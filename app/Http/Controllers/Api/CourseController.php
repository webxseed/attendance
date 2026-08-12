<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Teacher;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CourseController extends Controller
{
    /**
     * List courses.
     * Admin sees all.
     * Teacher sees assigned only.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $showArchived = $request->boolean('archived');

        if ($user->isAdmin()) {
            $query = $showArchived
                ? Course::whereNotNull('archived_at')
                : Course::whereNull('archived_at');
            if ($request->filled('year_id')) {
                $query->forYear($request->integer('year_id'));
            }
            return $query->with(['academicYear', 'category', 'teachers.user'])->withCount(['students', 'teachers'])->paginate(20);
        }

        if ($user->isTeacher()) {
            // Check if teacher profile exists
            if (!$user->teacher) {
                return response()->json(['message' => 'Teacher profile not found.'], 403);
            }
            $query = $user->teacher->courses()->whereNull('archived_at');
            if ($request->filled('year_id')) {
                $query->forYear($request->integer('year_id'));
            }
            return $query->with(['academicYear', 'category'])->withCount(['students'])->paginate(20);
        }

        return response()->json(['message' => 'Unauthorized'], 403);
    }

    /**
     * Create course (Admin only).
     */
    public function store(Request $request)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'color' => 'nullable|string|max:7',
            'description' => 'nullable|string',
            'year' => 'nullable|integer',
            'year_id' => 'nullable|exists:years,id',
            'category_id' => 'nullable|exists:categories,id',
            'schedule_details' => 'nullable|array',
            'is_pinned' => 'sometimes|boolean',
        ]);

        $course = Course::create($validated);

        return response()->json($course->load(['academicYear', 'category']), 201);
    }

    /**
     * Duplicate a course into another academic year (Admin only).
     */
    public function duplicateToYear(Request $request, Course $course)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'year_id' => 'required|exists:years,id',
            'year' => 'nullable|integer',
            'copy_students' => 'sometimes|boolean',
        ]);

        $newCourse = DB::transaction(fn () => $this->replicateCourseToYear(
            $course,
            $validated['year_id'],
            array_key_exists('year', $validated) ? $validated['year'] : $course->year,
            $request->boolean('copy_students')
        ));

        return response()->json(
            $newCourse
                ->load(['academicYear', 'category', 'teachers.user'])
                ->loadCount(['students', 'teachers']),
            201
        );
    }

    /**
     * Duplicate several courses into another academic year at once (Admin only).
     */
    public function duplicateManyToYear(Request $request)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'course_ids' => 'required|array|min:1',
            'course_ids.*' => 'integer|exists:courses,id',
            'year_id' => 'required|exists:years,id',
            'year' => 'nullable|integer',
            'copy_students' => 'sometimes|boolean',
        ]);

        $courses = Course::whereIn('id', $validated['course_ids'])->get();
        $copyStudents = $request->boolean('copy_students');

        $newCourses = DB::transaction(function () use ($courses, $validated, $copyStudents) {
            return $courses->map(fn (Course $course) => $this->replicateCourseToYear(
                $course,
                $validated['year_id'],
                $validated['year'] ?? $course->year,
                $copyStudents
            ));
        });

        return response()->json([
            'message' => 'تم نسخ الدورات بنجاح',
            'count' => $newCourses->count(),
            'courses' => $newCourses
                ->load(['academicYear', 'category', 'teachers.user'])
                ->loadCount(['students', 'teachers']),
        ], 201);
    }

    /**
     * Copy a course into another academic year, carrying its teachers
     * and – optionally – its students.
     */
    private function replicateCourseToYear(Course $course, $yearId, $year, bool $copyStudents): Course
    {
        $newCourse = $course->replicate(['archived_at']);
        $newCourse->year_id = $yearId;
        $newCourse->year = $year;
        $newCourse->archived_at = null;
        // A pinned course already shows in every year – don't pin the copy too.
        $newCourse->is_pinned = false;
        $newCourse->save();

        $newCourse->teachers()->sync($course->teachers()->pluck('teachers.id')->all());

        if ($copyStudents) {
            $newCourse->students()->sync($course->students()->pluck('students.id')->all());
        }

        return $newCourse;
    }

    /**
     * Update course (Admin only).
     */
    public function update(Request $request, Course $course)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'color' => 'nullable|string|max:7',
            'description' => 'nullable|string',
            'year' => 'nullable|integer',
            'year_id' => 'nullable|exists:years,id',
            'category_id' => 'nullable|exists:categories,id',
            'schedule_details' => 'nullable|array',
            'is_pinned' => 'sometimes|boolean',
        ]);

        $course->update($validated);

        return response()->json($course->load(['academicYear', 'category']));
    }

    /**
     * Show course details.
     */
    public function show(Request $request, Course $course)
    {
        $user = $request->user();

        if ($user->isTeacher()) {
            // Check assignment
            if (!$user->teacher || !$user->teacher->courses()->where('courses.id', $course->id)->exists()) {
                return response()->json(['message' => 'Unauthorized access to this course'], 403);
            }
        } elseif (!$user->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return $course->load(['teachers.user', 'students.category', 'academicYear', 'category']);
    }

    // --- Assignments (Admin Only) ---

    public function assignTeacher(Request $request, Course $course)
    {
        if (!$request->user()->isAdmin()) abort(403);

        $request->validate(['teacher_id' => 'required|exists:teachers,id']);
        
        $course->teachers()->syncWithoutDetaching([$request->teacher_id]);
        
        return response()->json(['message' => 'Teacher assigned']);
    }

    public function removeTeacher(Request $request, Course $course)
    {
        if (!$request->user()->isAdmin()) abort(403);

        $request->validate(['teacher_id' => 'required|exists:teachers,id']);

        $course->teachers()->detach($request->teacher_id);

        return response()->json(['message' => 'Teacher unassigned']);
    }

    public function assignStudent(Request $request, Course $course)
    {
        if (!$request->user()->isAdmin()) abort(403);

        $request->validate(['student_id' => 'required|exists:students,id']);

        $student = Student::findOrFail($request->student_id);

        if ($course->category_id && $student->category_id && (int) $student->category_id !== (int) $course->category_id) {
            return response()->json([
                'message' => 'لا يمكن تسجيل طالب من تصنيف مختلف عن تصنيف الدورة',
            ], 422);
        }

        // Inherit course category when student has none
        if ($course->category_id && !$student->category_id) {
            $student->update(['category_id' => $course->category_id]);
        }

        $course->students()->syncWithoutDetaching([$request->student_id]);

        return response()->json(['message' => 'Student assigned']);
    }

    public function removeStudent(Request $request, Course $course)
    {
        if (!$request->user()->isAdmin()) abort(403);

        $request->validate(['student_id' => 'required|exists:students,id']);

        $course->students()->detach($request->student_id);

        return response()->json(['message' => 'Student unassigned']);
    }

    /**
     * Archive course (Admin only).
     */
    public function archive(Request $request, Course $course)
    {
        if (!$request->user()->isAdmin()) return response()->json(['message' => 'Unauthorized'], 403);

        $course->update(['archived_at' => now()]);

        return response()->json(['message' => 'تم أرشفة الدورة بنجاح']);
    }

    /**
     * Unarchive course (Admin only).
     */
    public function unarchive(Request $request, Course $course)
    {
        if (!$request->user()->isAdmin()) return response()->json(['message' => 'Unauthorized'], 403);

        $course->update(['archived_at' => null]);

        return response()->json(['message' => 'تم استعادة الدورة بنجاح']);
    }

    /**
     * Delete course (Admin only).
     */
    public function destroy(Request $request, Course $course)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $course->delete();

        return response()->json(['message' => 'Course deleted successfully']);
    }
}
