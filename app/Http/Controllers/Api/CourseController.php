<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CourseController extends Controller
{
    /**
     * List courses with their classes.
     * Admin sees all, teacher sees courses they teach a class of.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $showArchived = $request->boolean('archived');

        if (!$user->isAdmin() && !$user->isTeacher()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $query = $showArchived
            ? Course::whereNotNull('archived_at')
            : Course::whereNull('archived_at');

        if ($user->isTeacher()) {
            if (!$user->teacher) {
                return response()->json(['message' => 'Teacher profile not found.'], 403);
            }
            $teacherId = $user->teacher->id;
            $query->whereHas('classes.teachers', fn ($q) => $q->where('teachers.id', $teacherId));
        }

        if ($request->filled('year_id')) {
            $yearId = $request->integer('year_id');
            $query->whereHas('classes', fn ($q) => $q->forYear($yearId));
        }

        return $query
            ->with(['category', 'classes' => fn ($q) => $q
                ->whereNull('archived_at')
                ->with(['academicYear', 'teachers.user'])
                ->withCount(['students', 'teachers'])
                ->orderByDesc('is_pinned')
                ->orderBy('name')])
            ->withCount(['classes' => fn ($q) => $q->whereNull('archived_at')])
            ->addSelect(['students_count' => DB::table('class_student')
                ->join('course_classes', 'course_classes.id', '=', 'class_student.course_class_id')
                ->whereColumn('course_classes.course_id', 'courses.id')
                ->whereNull('course_classes.archived_at')
                ->selectRaw('COUNT(DISTINCT class_student.student_id)')])
            ->paginate(50);
    }

    /**
     * Create a course (Admin only).
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
            'category_id' => 'nullable|exists:categories,id',
        ]);

        $course = Course::create($validated);

        return response()->json($course->load(['category']), 201);
    }

    /**
     * Update a course (Admin only).
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
            'category_id' => 'nullable|exists:categories,id',
        ]);

        $course->update($validated);

        return response()->json($course->load(['category']));
    }

    /**
     * Show a course with its classes.
     */
    public function show(Request $request, Course $course)
    {
        $user = $request->user();

        if ($user->isTeacher()) {
            if (!$user->teacher || !$course->classes()
                ->whereHas('teachers', fn ($q) => $q->where('teachers.id', $user->teacher->id))
                ->exists()) {
                return response()->json(['message' => 'Unauthorized access to this course'], 403);
            }
        } elseif (!$user->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return $course->load([
            'category',
            'classes' => fn ($q) => $q
                ->with(['academicYear', 'teachers.user'])
                ->withCount(['students', 'teachers'])
                ->orderByDesc('is_pinned')
                ->orderBy('name'),
        ]);
    }

    /**
     * Archive course (Admin only). Its classes go with it.
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
     * Delete a course together with its classes (Admin only).
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
