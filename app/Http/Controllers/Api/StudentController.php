<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    /**
     * List students. (Admin only)
     */
    public function index(Request $request)
    {
        if (!$request->user()->isAdmin()) return response()->json(['message' => 'Unauthorized'], 403);

        if ($request->query('all')) {
            return Student::orderBy('full_name')->get();
        }

        return Student::paginate(20);
    }

    /**
     * Create student. (Admin only)
     */
    public function store(Request $request)
    {
        if (!$request->user()->isAdmin()) return response()->json(['message' => 'Unauthorized'], 403);

        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'external_code' => 'nullable|string|unique:students,external_code',
            'notes' => 'nullable|string',
            'date_of_birth' => 'nullable|date',
            'identity_number' => 'nullable|string|unique:students,identity_number',
            'grade_level' => 'nullable|string|max:255',
            'school_name' => 'nullable|string|max:255',
            'address' => 'nullable|string',
            'mother_name' => 'nullable|string|max:255',
            'mother_phone' => 'nullable|string|max:255',
            'father_name' => 'nullable|string|max:255',
            'father_phone' => 'nullable|string|max:255',
        ]);

        $student = Student::create($validated);

        return response()->json($student, 201);
    }

    /**
     * Show student details. (Admin only)
     */
    public function show(Request $request, Student $student)
    {
        if (!$request->user()->isAdmin()) return response()->json(['message' => 'Unauthorized'], 403);

        return $student->load(['courses']);
    }

    /**
     * Update student. (Admin only)
     */
    public function update(Request $request, Student $student)
    {
        if (!$request->user()->isAdmin()) return response()->json(['message' => 'Unauthorized'], 403);

        $validated = $request->validate([
            'full_name' => 'sometimes|required|string|max:255',
            'external_code' => 'nullable|string|unique:students,external_code,' . $student->id,
            'notes' => 'nullable|string',
            'date_of_birth' => 'nullable|date',
            'identity_number' => 'nullable|string|unique:students,identity_number,' . $student->id,
            'grade_level' => 'nullable|string|max:255',
            'school_name' => 'nullable|string|max:255',
            'address' => 'nullable|string',
            'mother_name' => 'nullable|string|max:255',
            'mother_phone' => 'nullable|string|max:255',
            'father_name' => 'nullable|string|max:255',
            'father_phone' => 'nullable|string|max:255',
        ]);

        $student->update($validated);

        return response()->json($student);
    }

    /**
     * Delete student. (Admin only)
     */
    public function destroy(Request $request, Student $student)
    {
        if (!$request->user()->isAdmin()) return response()->json(['message' => 'Unauthorized'], 403);

        // Detach from courses
        $student->courses()->detach();

        // Delete attendance records
        $student->attendanceRecords()->delete();

        $student->delete();

        return response()->json(['message' => 'تم حذف الطالب بنجاح']);
    }
}
