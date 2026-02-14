<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AttendanceRecord;
use App\Models\AttendanceSession;
use App\Models\Course;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    /**
     * Get daily overview for a given date.
     * Admin only.
     */
    public function dailyOverview(Request $request, $date)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Get all courses with student count
        $courses = Course::withCount('students')->get();

        // Get sessions for this date
        $sessions = AttendanceSession::whereDate('date', $date)
            ->with(['records'])
            ->get()
            ->keyBy('course_id');

        $result = $courses->map(function ($course) use ($sessions) {
            $session = $sessions->get($course->id);
            
            $totalStudents = $course->students_count;
            $present = 0;
            $absent = 0;

            if ($session) {
                $present = $session->records->where('status', 'present')->count();
                $absent = $session->records->where('status', 'absent')->count();
                // other statuses...
            }
            
            // "Not marked" is everyone else (or explicit nulls if session exists)
            // If session exists, not_marked = total - (present+absent+others).
            // If session doesn't exist, not_marked = total.
            
            // We'll count marked ones from session if exists, otherwise 0.
            $markedCount = $session ? $session->records->whereNotNull('status')->count() : 0;
            $notMarked = $totalStudents - $markedCount;

            // Prevent negative if students were removed but records exist? 
            // Unlikely to happen often but clamp to 0.
            $notMarked = max(0, $notMarked); 

            $completion = ($totalStudents > 0) ? ($markedCount / $totalStudents) * 100 : 0;

            return [
                'course_id' => $course->id,
                'course_title' => $course->title,
                'total_students' => $totalStudents,
                'present_count' => $present,
                'absent_count' => $absent,
                'not_marked_count' => $notMarked,
                'completion_percentage' => round($completion, 2) . '%',
            ];
        });

        return response()->json($result);
    }

    /**
     * Generate report with filters.
     * Admin only.
     */
    public function generate(Request $request)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'course_id' => 'nullable|exists:courses,id',
            'teacher_id' => 'nullable|exists:teachers,id',
            'student_id' => 'nullable|exists:students,id',
            'from_date' => 'nullable|date',
            'to_date' => 'nullable|date',
        ]);

        $query = AttendanceRecord::query()
            ->with(['session.course', 'student', 'markedBy']);

        // Apply filters
        if ($request->course_id) {
            $query->whereHas('session', function ($q) use ($request) {
                $q->where('course_id', $request->course_id);
            });
        }

        if ($request->teacher_id) {
            // Filter records where the session belongs to a course the teacher teaches?
            // Or where the session was created by the teacher? 
            // Prompt says: "filters: course_id, teacher_id...". implies filtering BY TEACHER (who taught/marked).
            // But usually means "Teacher's classes". 
            // I'll filter by course assignment for that teacher.
            $query->whereHas('session.course.teachers', function ($q) use ($request) {
                $q->where('teachers.id', $request->teacher_id);
            });
        }

        if ($request->student_id) {
            $query->where('student_id', $request->student_id);
        }

        if ($request->from_date) {
            $query->whereHas('session', function ($q) use ($request) {
                $q->whereDate('date', '>=', $request->from_date);
            });
        }

        if ($request->to_date) {
            $query->whereHas('session', function ($q) use ($request) {
                $q->whereDate('date', '<=', $request->to_date);
            });
        }

        $records = $query->get();

        // Calculate aggregate stats
        $total = $records->count();
        $present = $records->where('status', 'present')->count();
        $absent = $records->where('status', 'absent')->count();
        $late = $records->where('status', 'late')->count();
        $excused = $records->where('status', 'excused')->count();

        return response()->json([
            'summary' => [
                'total_records_found' => $total, // Total *marked/unmarked* records matching criteria
                'present' => $present,
                'absent' => $absent,
                'late' => $late,
                'excused' => $excused,
                'attendance_rate' => ($total > 0) ? round((($present + $late) / $total) * 100, 2) . '%' : '0%',
            ],
            'records' => $records // Return raw data optionally, maybe paginated if huge?
            // Prompt says "returns aggregated rates and raw records optionally".
        ]);
    }
}
