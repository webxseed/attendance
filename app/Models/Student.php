<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

    protected $fillable = [
        'full_name',
        'external_code',
        'notes',
        'category_id',
        'date_of_birth',
        'identity_number',
        'grade_level',
        'school_name',
        'address',
        'mother_name',
        'mother_phone',
        'father_name',
        'father_phone',
        'archived_at',
    ];

    protected $casts = [
        'archived_at' => 'datetime',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function classes()
    {
        return $this->belongsToMany(CourseClass::class, 'class_student', 'student_id', 'course_class_id');
    }

    public function attendanceRecords()
    {
        return $this->hasMany(AttendanceRecord::class);
    }
}
