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
        'date_of_birth',
        'identity_number',
        'grade_level',
        'school_name',
        'address',
        'mother_name',
        'mother_phone',
        'father_name',
        'father_phone',
    ];

    public function courses()
    {
        return $this->belongsToMany(Course::class, 'course_student');
    }

    public function attendanceRecords()
    {
        return $this->hasMany(AttendanceRecord::class);
    }
}
