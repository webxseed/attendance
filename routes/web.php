<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\StoryGeneratorController;
use App\Http\Controllers\PostController;
use Illuminate\Support\Facades\Route;

// ─── SPA catch-all: serves the React app for all frontend routes ───
// This MUST be last so it doesn't shadow API or auth routes.

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
    // Story Generator Routes
    Route::get('/stories', [StoryGeneratorController::class, 'index'])->name('stories.index');
    Route::post('/stories/generate', [StoryGeneratorController::class, 'generate'])->name('stories.generate');
    Route::post('/stories/freepik/search', [StoryGeneratorController::class, 'searchFreepik'])->name('stories.freepik.search');
    Route::post('/stories/save', [StoryGeneratorController::class, 'saveCarousels'])->name('stories.save');
    
    // AI Posts Routes
    Route::get('/posts', [PostController::class, 'index'])->name('posts.index');
    Route::post('/posts/generate', [PostController::class, 'generate'])->name('posts.generate');
    Route::get('/posts/{post}', [PostController::class, 'show'])->name('posts.show');
    Route::put('/posts/{post}', [PostController::class, 'update'])->name('posts.update');
});

require __DIR__.'/auth.php';

// SPA catch-all — serves the React frontend for any unmatched route
Route::get('/{any?}', function () {
    return view('app');
})->where('any', '.*');
