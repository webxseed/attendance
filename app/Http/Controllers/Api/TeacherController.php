<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class TeacherController extends Controller
{
    /**
     * List teachers. (Admin only)
     */
    public function index(Request $request)
    {
        if (!$request->user()->isAdmin()) return response()->json(['message' => 'Unauthorized'], 403);

        if ($request->query('all')) {
            return Teacher::with('user')->orderBy('id')->get();
        }

        return Teacher::with('user')->paginate(50);
    }

    /**
     * Create a teacher (and user). (Admin only)
     * Name is required; phone/email are optional and auto-generated when omitted.
     */
    public function store(Request $request)
    {
        if (!$request->user()->isAdmin()) return response()->json(['message' => 'Unauthorized'], 403);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|unique:users,email',
            'phone' => 'nullable|string|unique:users,phone',
        ]);

        return DB::transaction(function () use ($validated) {
            $phone = $validated['phone'] ?? $this->generateUniquePhone();
            $email = $validated['email'] ?? $this->generateUniqueEmail($validated['name']);

            $user = User::create([
                'name' => $validated['name'],
                'email' => $email,
                'phone' => $phone,
                'role' => 'teacher',
                'password' => Hash::make(Str::random(16)),
            ]);

            $teacher = $user->teacher()->create([
                'phone' => $phone,
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
            'phone' => ['sometimes', 'nullable', 'string', Rule::unique('users')->ignore($teacher->user_id)],
        ]);

        return DB::transaction(function () use ($validated, $teacher) {
            $updateData = [];
            if (isset($validated['name'])) $updateData['name'] = $validated['name'];
            if (array_key_exists('email', $validated)) $updateData['email'] = $validated['email'];
            if (array_key_exists('phone', $validated) && $validated['phone']) $updateData['phone'] = $validated['phone'];

            if (!empty($updateData)) {
                $teacher->user->update($updateData);
            }

            if (!empty($validated['phone'])) {
                $teacher->update(['phone' => $validated['phone']]);
            }

            return response()->json($teacher->load('user'));
        });
    }

    /**
     * Delete teacher (and user). (Admin only)
     */
    public function destroy(Request $request, Teacher $teacher)
    {
        if (!$request->user()->isAdmin()) return response()->json(['message' => 'Unauthorized'], 403);

        return DB::transaction(function () use ($teacher) {
            $teacher->courses()->detach();
            $user = $teacher->user;
            $teacher->delete();
            if ($user) {
                $user->delete();
            }

            return response()->json(['message' => 'Teacher deleted successfully']);
        });
    }

    private function generateUniquePhone(): string
    {
        do {
            $phone = '05' . str_pad((string) random_int(0, 99999999), 8, '0', STR_PAD_LEFT);
        } while (User::where('phone', $phone)->exists());

        return $phone;
    }

    private function generateUniqueEmail(string $name): string
    {
        $slug = Str::slug($name, '') ?: 'teacher';
        do {
            $email = strtolower($slug) . '.' . random_int(1000, 999999) . '@teachers.local';
        } while (User::where('email', $email)->exists());

        return $email;
    }
}
