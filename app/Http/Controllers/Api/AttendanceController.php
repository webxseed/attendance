<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AttendanceRecord;
use App\Models\AttendanceSession;
use App\Models\Course;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class AttendanceController extends Controller
{
    /**
     * Get or create attendance session for a course and date.
     * Prefills records for assigned students if missing.
     */
    public function show(Request $request, $courseId, $date)
    {
        $user = $request->user();
        $course = Course::findOrFail($courseId);

        // Authorization
        if ($user->isTeacher()) {
            if (!$user->teacher || !$course->teachers()->where('teachers.id', $user->teacher->id)->exists()) {
                return response()->json(['message' => 'Unauthorized for this course'], 403);
            }
        } elseif (!$user->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Validate date format if needed, implicit in route usually but good to check
        if (!strtotime($date)) {
            return response()->json(['message' => 'Invalid date'], 400);
        }

        // Transaction to ensure atomicity of session creation + records
        $session = DB::transaction(function () use ($course, $date, $user) {
            $session = AttendanceSession::firstOrCreate(
                ['course_id' => $course->id, 'date' => $date],
                ['created_by_user_id' => $user->id]
            );

            // Sync students: Ensure all assigned students have a record
            // We do NOT delete records for students removed from course to preserve history, 
            // but we add new ones.
            $studentIds = $course->students()->pluck('students.id');
            
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
    public function update(Request $request, $courseId, $date)
    {
        $user = $request->user();
        $course = Course::findOrFail($courseId);

        // Authorization
        if ($user->isTeacher()) {
            if (!$user->teacher || !$course->teachers()->where('teachers.id', $user->teacher->id)->exists()) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
        } elseif (!$user->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $session = AttendanceSession::where('course_id', $courseId)->where('date', $date)->firstOrFail();

        $validated = $request->validate([
            'records' => 'required|array',
            'records.*.student_id' => 'required|exists:students,id',
            'records.*.status' => ['required', Rule::in(['present', 'absent', 'late', 'excused'])],
            'records.*.note' => 'nullable|string',
        ]);

        DB::transaction(function () use ($session, $validated, $user) {
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
}
