<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * A class ("شعبة") – one run of a course in a given academic year, holding its
 * own roster, teachers, schedule and attendance.
 */
class CourseClass extends Model
{
    use HasFactory;

    protected $table = 'course_classes';

    protected $fillable = [
        'course_id',
        'name',
        'year_id',
        'year',
        'schedule_details',
        'is_pinned',
        'archived_at',
    ];

    protected $casts = [
        'schedule_details' => 'array',
        'archived_at' => 'datetime',
        'is_pinned' => 'boolean',
    ];

    /**
     * Classes of a given year, plus pinned classes which show in every year.
     */
    public function scopeForYear($query, $yearId)
    {
        return $query->where(function ($q) use ($yearId) {
            $q->where('year_id', $yearId)->orWhere('is_pinned', true);
        });
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function academicYear()
    {
        return $this->belongsTo(Year::class, 'year_id');
    }

    public function teachers()
    {
        return $this->belongsToMany(Teacher::class, 'class_teacher', 'course_class_id', 'teacher_id');
    }

    public function students()
    {
        return $this->belongsToMany(Student::class, 'class_student', 'course_class_id', 'student_id');
    }

    public function attendanceSessions()
    {
        return $this->hasMany(AttendanceSession::class, 'course_class_id');
    }
}
