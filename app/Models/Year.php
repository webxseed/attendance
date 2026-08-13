<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Year extends Model
{
    protected $fillable = ['name', 'title', 'start_year', 'end_year'];

    public function classes()
    {
        return $this->hasMany(CourseClass::class, 'year_id');
    }
}
