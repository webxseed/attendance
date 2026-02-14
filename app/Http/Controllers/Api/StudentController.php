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

        return $student->load(['courses']); // load courses
    }
}
