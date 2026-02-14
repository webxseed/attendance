<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class TeacherController extends Controller
{
    /**
     * List teachers. (Admin only)
     */
    public function index(Request $request)
    {
        if (!$request->user()->isAdmin()) return response()->json(['message' => 'Unauthorized'], 403);

        return Teacher::with('user')->paginate(20);
    }

    /**
     * Create a teacher (and user). (Admin only)
     */
    public function store(Request $request)
    {
        if (!$request->user()->isAdmin()) return response()->json(['message' => 'Unauthorized'], 403);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'phone' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated) {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => 'teacher',
            ]);

            $teacher = $user->teacher()->create([
                'phone' => $validated['phone'] ?? null,
            ]);

            return response()->json($teacher->load('user'), 201);
        });
    }

    /**
     * Show teacher details. (Admin or verify self)
     */
    public function show(Request $request, Teacher $teacher)
    {
        if (!$request->user()->isAdmin()) {
            if ($request->user()->id !== $teacher->user_id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
        }

        return $teacher->load(['user', 'courses']);
    }
}
