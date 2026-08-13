<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AttendanceSession extends Model
{
    use HasFactory;

    protected $fillable = ['course_class_id', 'date', 'created_by_user_id', 'finalized_at', 'note'];

    protected $casts = [
        'date' => 'date',
        'finalized_at' => 'datetime',
    ];

    public function courseClass()
    {
        return $this->belongsTo(CourseClass::class, 'course_class_id');
    }

    public function records()
    {
        return $this->hasMany(AttendanceRecord::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }
}
