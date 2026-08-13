<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AttendanceRecord;
use App\Models\AttendanceSession;
use App\Models\CourseClass;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class AttendanceController extends Controller
{
    /**
     * Get or create the attendance session for a class and date.
     * Prefills records for the class roster if missing.
     */
    public function show(Request $request, $classId, $date)
    {
        $user = $request->user();
        $class = CourseClass::findOrFail($classId);

        if ($error = $this->authorizeClass($request, $class)) {
            return $error;
        }

        if (!strtotime($date)) {
            return response()->json(['message' => 'Invalid date'], 400);
        }

        // Transaction to ensure atomicity of session creation + records
        $session = DB::transaction(function () use ($class, $date, $user) {
            $session = AttendanceSession::firstOrCreate(
                ['course_class_id' => $class->id, 'date' => $date],
                ['created_by_user_id' => $user->id]
            );

            // Sync students: ensure every student on the roster has a record.
            // We do NOT delete records for students removed from the class, to
            // preserve history, but we add new ones.
            $studentIds = $class->students()->pluck('students.id');

            $existingRecords = $session->records()->pluck('student_id')->toArray();
            $missingStudentIds = $studentIds->diff($existingRecords);

            $newRecords = [];
            foreach ($missingStudentIds as $studentId) {
                $newRecords[] = [
                    'attendance_session_id' => $session->id,
                    'student_id' => $studentId,
                    'status' => null, // Default to null (Unmarked) to distinguish from Absent
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            if (!empty($newRecords)) {
                AttendanceRecord::insert($newRecords);
            }

            return $session;
        });

        return $session->load(['records.student']);
    }

    /**
     * Bulk update attendance records.
     */
    public function update(Request $request, $classId, $date)
    {
        $user = $request->user();
        $class = CourseClass::findOrFail($classId);

        if ($error = $this->authorizeClass($request, $class)) {
            return $error;
        }

        $session = AttendanceSession::where('course_class_id', $class->id)
            ->where('date', $date)
            ->firstOrFail();

        $validated = $request->validate([
            'records' => 'required|array',
            'records.*.student_id' => 'required|exists:students,id',
            'records.*.status' => ['required', Rule::in(['present', 'absent', 'late', 'excused'])],
            'records.*.note' => 'nullable|string',
        ]);

        DB::transaction(function () use ($session, $validated, $user, $request) {
            foreach ($validated['records'] as $recordData) {
                AttendanceRecord::updateOrCreate(
                    [
                        'attendance_session_id' => $session->id,
                        'student_id' => $recordData['student_id']
                    ],
                    [
                        'status' => $recordData['status'],
                        'note' => $recordData['note'] ?? null,
                        'marked_by_user_id' => $user->id,
                        'marked_at' => now(),
                    ]
                );
            }

            // Update session note if provided
            if ($request->has('note')) {
                $session->update(['note' => $request->note]);
            }

            // Update session finalized info if needed
            $session->update(['finalized_at' => now()]); // Optional: logic to determining "finalized"
        });

        return response()->json(['message' => 'Attendance updated successfully']);
    }

    /**
     * Admins pass; teachers must be assigned to the class.
     * Returns an error response, or null when allowed.
     */
    private function authorizeClass(Request $request, CourseClass $class)
    {
        $user = $request->user();

        if ($user->isAdmin()) {
            return null;
        }

        if ($user->isTeacher()) {
            if ($user->teacher && $class->teachers()->where('teachers.id', $user->teacher->id)->exists()) {
                return null;
            }
            return response()->json(['message' => 'Unauthorized for this class'], 403);
        }

        return response()->json(['message' => 'Unauthorized'], 403);
    }
}
