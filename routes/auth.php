<?php

use Illuminate\Support\Facades\Route;

// ─── Old Breeze Blade-based auth routes have been DISABLED ───
// Authentication is now handled by the React SPA + API (Sanctum).
// See: routes/api.php for API-based auth endpoints.

// We keep a named 'login' route that returns the SPA, so Laravel's
// auth middleware redirects to /login (which the React app handles).
Route::get('login', function () {
    return view('app');
})->name('login');
