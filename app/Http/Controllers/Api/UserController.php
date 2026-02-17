<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * List all users. (Admin only)
     */
    public function index(Request $request)
    {
        if (!$request->user()->isAdmin()) return response()->json(['message' => 'Unauthorized'], 403);

        return User::with('teacher')->paginate(20);
    }

    /**
     * Create a user. (Admin only)
     */
    public function store(Request $request)
    {
        if (!$request->user()->isAdmin()) return response()->json(['message' => 'Unauthorized'], 403);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|unique:users,email',
            'phone' => 'required|string|unique:users,phone',
            'role' => 'required|in:admin,teacher',
            'password' => 'nullable|string|min:6',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'] ?? null,
            'phone' => $validated['phone'],
            'role' => $validated['role'],
            'password' => Hash::make($validated['password'] ?? 'password'), // Default password if not provided
        ]);

        if ($user->role === 'teacher') {
            $user->teacher()->create(['phone' => $user->phone]);
        }

        return response()->json($user->load('teacher'), 201);
    }

    /**
     * Update a user. (Admin only)
     */
    public function update(Request $request, User $user)
    {
        if (!$request->user()->isAdmin()) return response()->json(['message' => 'Unauthorized'], 403);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => ['sometimes', 'nullable', 'email', Rule::unique('users')->ignore($user->id)],
            'phone' => ['sometimes', 'required', 'string', Rule::unique('users')->ignore($user->id)],
            'role' => 'sometimes|required|in:admin,teacher',
            'password' => 'nullable|string|min:6',
        ]);

        $user->update([
            'name' => $validated['name'] ?? $user->name,
            'email' => $validated['email'] ?? $user->email,
            'phone' => $validated['phone'] ?? $user->phone,
            'role' => $validated['role'] ?? $user->role,
        ]);

        if (isset($validated['password'])) {
            $user->update(['password' => Hash::make($validated['password'])]);
        }

        // Handle teacher profile creation/deletion if role changes or just sync phone
        if ($user->role === 'teacher') {
            if (!$user->teacher) {
                $user->teacher()->create(['phone' => $user->phone]);
            } else {
                $user->teacher->update(['phone' => $user->phone]);
            }
        }

        return response()->json($user->load('teacher'));
    }

    /**
     * Delete a user. (Admin only)
     */
    public function destroy(Request $request, User $user)
    {
        if (!$request->user()->isAdmin()) return response()->json(['message' => 'Unauthorized'], 403);

        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }
}
