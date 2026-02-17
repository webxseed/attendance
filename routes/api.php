<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\TeacherController;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\ReportController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes – OTP auth
Route::post('/auth/send-otp', [AuthController::class, 'sendOtp']);
Route::post('/auth/verify-otp', [AuthController::class, 'verifyOtp']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Courses
    Route::apiResource('courses', CourseController::class);
    Route::apiResource('years', \App\Http\Controllers\Api\YearController::class);

    // Course assignments (Admin)
    Route::post('/courses/{course}/teachers', [CourseController::class, 'assignTeacher']);
    Route::delete('/courses/{course}/teachers', [CourseController::class, 'removeTeacher']);
    Route::post('/courses/{course}/students', [CourseController::class, 'assignStudent']);
    Route::delete('/courses/{course}/students', [CourseController::class, 'removeStudent']);

    // Teachers (Admin)
    Route::apiResource('teachers', TeacherController::class);

    // Students (Admin)
    Route::apiResource('students', StudentController::class);

    // Users (Admin)
    Route::apiResource('users', \App\Http\Controllers\Api\UserController::class);

    // Attendance (Teacher/Admin)
    // Using simple parameters instead of resource for custom flow
    Route::get('/attendance/{course}/{date}', [AttendanceController::class, 'show']);
    Route::post('/attendance/{course}/{date}', [AttendanceController::class, 'update']);

    // Reports (Admin)
    Route::get('/reports/daily/{date}', [ReportController::class, 'dailyOverview']);
    Route::get('/reports', [ReportController::class, 'generate']);
});
