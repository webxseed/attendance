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
            'email' => 'nullable|email|unique:users,email',
            'phone' => 'required|string|unique:users,phone',
        ]);

        return DB::transaction(function () use ($validated) {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'] ?? null,
                'phone' => $validated['phone'],
                'role' => 'teacher',
            ]);

            $teacher = $user->teacher()->create([
                'phone' => $validated['phone'],
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

    /**
     * Update teacher (and user). (Admin only)
     */
    public function update(Request $request, Teacher $teacher)
    {
        if (!$request->user()->isAdmin()) return response()->json(['message' => 'Unauthorized'], 403);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => ['sometimes', 'nullable', 'email', Rule::unique('users')->ignore($teacher->user_id)],
            'phone' => ['sometimes', 'required', 'string', Rule::unique('users')->ignore($teacher->user_id)],
        ]);

        return DB::transaction(function () use ($validated, $teacher) {
            $updateData = [];
            if (isset($validated['name'])) $updateData['name'] = $validated['name'];
            if (isset($validated['email'])) $updateData['email'] = $validated['email'];
            if (isset($validated['phone'])) $updateData['phone'] = $validated['phone'];

            if (!empty($updateData)) {
                $teacher->user->update($updateData);
            }

            if (isset($validated['phone'])) {
                $teacher->update(['phone' => $validated['phone']]);
            }

            return response()->json($teacher->load('user'));
        });
    }
}
