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

        if ($user->isAdmin()) {
            return Course::withCount(['students', 'teachers'])->paginate(20);
        }

        if ($user->isTeacher()) {
            // Check if teacher profile exists
            if (!$user->teacher) {
                return response()->json(['message' => 'Teacher profile not found.'], 403);
            }
            return $user->teacher->courses()->withCount(['students'])->paginate(20);
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
            'schedule_details' => 'nullable|array',
        ]);

        $course = Course::create($validated);

        return response()->json($course, 201);
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
            'schedule_details' => 'nullable|array',
        ]);

        $course->update($validated);

        return response()->json($course);
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

        return $course->load(['teachers.user', 'students']);
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
}
