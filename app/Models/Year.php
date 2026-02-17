<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Year extends Model
{
    protected $fillable = ['name', 'title', 'start_year', 'end_year'];

    public function courses()
    {
        return $this->hasMany(Course::class);
    }
}
