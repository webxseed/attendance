<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CourseClass;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CourseClassController extends Controller
{
    /**
     * List classes ("شعبة").
     * Admin sees all, teacher sees the ones assigned to them.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $showArchived = $request->boolean('archived');

        if ($user->isAdmin()) {
            $query = CourseClass::query();
        } elseif ($user->isTeacher()) {
            if (!$user->teacher) {
                return response()->json(['message' => 'Teacher profile not found.'], 403);
            }
            $query = $user->teacher->classes();
        } else {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $showArchived
            ? $query->whereNotNull('course_classes.archived_at')
            : $query->whereNull('course_classes.archived_at');

        if ($request->filled('course_id')) {
            $query->where('course_id', $request->integer('course_id'));
        }

        if ($request->filled('year_id')) {
            $query->forYear($request->integer('year_id'));
        }

        // Classes of an archived course should not surface on their own.
        $query->whereHas('course', fn ($q) => $q->whereNull('archived_at'));

        return $query
            ->with(['course.category', 'academicYear', 'teachers.user'])
            ->withCount(['students', 'teachers'])
            ->orderByDesc('is_pinned')
            ->orderBy('name')
            ->paginate(100);
    }

    /**
     * Create a class for a course (Admin only).
     */
    public function store(Request $request)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'name' => 'required|string|max:255',
            'year_id' => 'nullable|exists:years,id',
            'year' => 'nullable|integer',
            'schedule_details' => 'nullable|array',
            'is_pinned' => 'sometimes|boolean',
        ]);

        $class = CourseClass::create($validated);

        return response()->json(
            $class->load(['course.category', 'academicYear'])->loadCount(['students', 'teachers']),
            201
        );
    }

    /**
     * Show a class with its roster.
     */
    public function show(Request $request, CourseClass $class)
    {
        $user = $request->user();

        if ($user->isTeacher()) {
            if (!$user->teacher || !$class->teachers()->where('teachers.id', $user->teacher->id)->exists()) {
                return response()->json(['message' => 'Unauthorized access to this class'], 403);
            }
        } elseif (!$user->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return $class->load(['course.category', 'academicYear', 'teachers.user', 'students.category']);
    }

    /**
     * Update a class (Admin only). `course_id` may be changed to move a class
     * onto another course.
     */
    public function update(Request $request, CourseClass $class)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'course_id' => 'sometimes|required|exists:courses,id',
            'name' => 'sometimes|required|string|max:255',
            'year_id' => 'nullable|exists:years,id',
            'year' => 'nullable|integer',
            'schedule_details' => 'nullable|array',
            'is_pinned' => 'sometimes|boolean',
        ]);

        $class->update($validated);

        return response()->json($class->load(['course.category', 'academicYear']));
    }

    /**
     * Delete a class and its attendance history (Admin only).
     */
    public function destroy(Request $request, CourseClass $class)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $class->delete();

        return response()->json(['message' => 'تم حذف الشعبة بنجاح']);
    }

    public function archive(Request $request, CourseClass $class)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $class->update(['archived_at' => now()]);

        return response()->json(['message' => 'تم أرشفة الشعبة بنجاح']);
    }

    public function unarchive(Request $request, CourseClass $class)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $class->update(['archived_at' => null]);

        return response()->json(['message' => 'تم استعادة الشعبة بنجاح']);
    }

    /**
     * Copy a class into another academic year, under the same course (Admin only).
     */
    public function duplicateToYear(Request $request, CourseClass $class)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'year_id' => 'required|exists:years,id',
            'year' => 'nullable|integer',
            'name' => 'nullable|string|max:255',
            'copy_students' => 'sometimes|boolean',
        ]);

        $newClass = DB::transaction(fn () => $this->replicateClassToYear(
            $class,
            $validated['year_id'],
            array_key_exists('year', $validated) ? $validated['year'] : $class->year,
            $validated['name'] ?? null,
            $request->boolean('copy_students')
        ));

        return response()->json(
            $newClass
                ->load(['course.category', 'academicYear', 'teachers.user'])
                ->loadCount(['students', 'teachers']),
            201
        );
    }

    /**
     * Copy several classes into another academic year at once (Admin only).
     */
    public function duplicateManyToYear(Request $request)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'class_ids' => 'required|array|min:1',
            'class_ids.*' => 'integer|exists:course_classes,id',
            'year_id' => 'required|exists:years,id',
            'year' => 'nullable|integer',
            'name' => 'nullable|string|max:255',
            'copy_students' => 'sometimes|boolean',
        ]);

        $classes = CourseClass::whereIn('id', $validated['class_ids'])->get();
        $copyStudents = $request->boolean('copy_students');

        $newClasses = DB::transaction(function () use ($classes, $validated, $copyStudents) {
            return $classes->map(fn (CourseClass $class) => $this->replicateClassToYear(
                $class,
                $validated['year_id'],
                $validated['year'] ?? $class->year,
                $validated['name'] ?? null,
                $copyStudents
            ));
        });

        return response()->json([
            'message' => 'تم نسخ الشعب بنجاح',
            'count' => $newClasses->count(),
            'classes' => $newClasses
                ->load(['course.category', 'academicYear', 'teachers.user'])
                ->loadCount(['students', 'teachers']),
        ], 201);
    }

    /**
     * Copy a class into another year, carrying its teachers and – optionally –
     * its students. Attendance history is never copied.
     */
    private function replicateClassToYear(
        CourseClass $class,
        $yearId,
        $year,
        ?string $name,
        bool $copyStudents
    ): CourseClass {
        // Built from explicit columns rather than replicate(), so loaded
        // aggregates such as students_count can never leak into the insert.
        $newClass = CourseClass::create([
            'course_id' => $class->course_id,
            'name' => $name ?: $class->name,
            'year_id' => $yearId,
            'year' => $year,
            'schedule_details' => $class->schedule_details,
            // A pinned class already shows in every year – don't pin the copy too.
            'is_pinned' => false,
            'archived_at' => null,
        ]);

        $newClass->teachers()->sync($class->teachers()->pluck('teachers.id')->all());

        if ($copyStudents) {
            $newClass->students()->sync($class->students()->pluck('students.id')->all());
        }

        return $newClass;
    }

    // --- Assignments (Admin only) -------------------------------------------

    public function assignTeacher(Request $request, CourseClass $class)
    {
        if (!$request->user()->isAdmin()) abort(403);

        $request->validate(['teacher_id' => 'required|exists:teachers,id']);

        $class->teachers()->syncWithoutDetaching([$request->teacher_id]);

        return response()->json(['message' => 'Teacher assigned']);
    }

    public function removeTeacher(Request $request, CourseClass $class)
    {
        if (!$request->user()->isAdmin()) abort(403);

        $request->validate(['teacher_id' => 'required|exists:teachers,id']);

        $class->teachers()->detach($request->teacher_id);

        return response()->json(['message' => 'Teacher unassigned']);
    }

    public function assignStudent(Request $request, CourseClass $class)
    {
        if (!$request->user()->isAdmin()) abort(403);

        $request->validate(['student_id' => 'required|exists:students,id']);

        $student = Student::findOrFail($request->student_id);
        $categoryId = $class->course->category_id;

        if ($categoryId && $student->category_id && (int) $student->category_id !== (int) $categoryId) {
            return response()->json([
                'message' => 'لا يمكن تسجيل طالب من تصنيف مختلف عن تصنيف الدورة',
            ], 422);
        }

        // Inherit the course category when the student has none
        if ($categoryId && !$student->category_id) {
            $student->update(['category_id' => $categoryId]);
        }

        $class->students()->syncWithoutDetaching([$request->student_id]);

        return response()->json(['message' => 'Student assigned']);
    }

    public function removeStudent(Request $request, CourseClass $class)
    {
        if (!$request->user()->isAdmin()) abort(403);

        $request->validate(['student_id' => 'required|exists:students,id']);

        $class->students()->detach($request->student_id);

        return response()->json(['message' => 'Student unassigned']);
    }
}
