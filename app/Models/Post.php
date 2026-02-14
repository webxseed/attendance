<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    use HasFactory;

    protected $fillable = ['headline', 'topic'];

    public function carousels()
    {
        return $this->hasMany(PostCarousel::class)->orderBy('position');
    }
}
