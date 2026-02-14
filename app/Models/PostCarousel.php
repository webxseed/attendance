<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PostCarousel extends Model
{
    use HasFactory;

    protected $fillable = ['post_id', 'content', 'description', 'image_path', 'position', 'image_prompt'];

    public function post()
    {
        return $this->belongsTo(Post::class);
    }
}
