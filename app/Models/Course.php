<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * A course is the subject itself. Its academic years, rosters, teachers,
 * schedules and attendance live on its classes ("شعبة").
 */
class Course extends Model
{
    use HasFactory;

    protected $fillable = ['title', 'color', 'description', 'category_id', 'archived_at'];

    protected $casts = [
        'archived_at' => 'datetime',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function classes()
    {
        return $this->hasMany(CourseClass::class);
    }

    public function attendanceSessions()
    {
        return $this->hasManyThrough(AttendanceSession::class, CourseClass::class, 'course_id', 'course_class_id');
    }
}
