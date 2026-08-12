<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    use HasFactory;

    protected $fillable = ['title', 'color', 'description', 'year', 'year_id', 'category_id', 'schedule_details', 'archived_at', 'is_pinned'];

    protected $casts = [
        'schedule_details' => 'array',
        'archived_at' => 'datetime',
        'is_pinned' => 'boolean',
    ];

    /**
     * Courses of a given year, plus pinned courses which show in every year.
     */
    public function scopeForYear($query, $yearId)
    {
        return $query->where(function ($q) use ($yearId) {
            $q->where('year_id', $yearId)->orWhere('is_pinned', true);
        });
    }

    public function academicYear()
    {
        return $this->belongsTo(Year::class, 'year_id');
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function teachers()
    {
        return $this->belongsToMany(Teacher::class, 'course_teacher');
    }

    public function students()
    {
        return $this->belongsToMany(Student::class, 'course_student');
    }

    public function attendanceSessions()
    {
        return $this->hasMany(AttendanceSession::class);
    }
}
