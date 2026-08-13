<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\CourseClassController;
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
    Route::post('/courses/{course}/archive', [CourseController::class, 'archive']);
    Route::post('/courses/{course}/unarchive', [CourseController::class, 'unarchive']);
    Route::apiResource('years', \App\Http\Controllers\Api\YearController::class);
    Route::apiResource('categories', \App\Http\Controllers\Api\CategoryController::class)->except(['show']);

    // Classes ("شعبة") – a course's run in a given year, holding the roster
    Route::post('/classes/duplicate-to-year', [CourseClassController::class, 'duplicateManyToYear']);
    Route::apiResource('classes', CourseClassController::class)->parameters(['classes' => 'class']);
    Route::post('/classes/{class}/archive', [CourseClassController::class, 'archive']);
    Route::post('/classes/{class}/unarchive', [CourseClassController::class, 'unarchive']);
    Route::post('/classes/{class}/duplicate-to-year', [CourseClassController::class, 'duplicateToYear']);

    // Class assignments (Admin)
    Route::post('/classes/{class}/teachers', [CourseClassController::class, 'assignTeacher']);
    Route::delete('/classes/{class}/teachers', [CourseClassController::class, 'removeTeacher']);
    Route::post('/classes/{class}/students', [CourseClassController::class, 'assignStudent']);
    Route::delete('/classes/{class}/students', [CourseClassController::class, 'removeStudent']);

    // Teachers (Admin)
    Route::apiResource('teachers', TeacherController::class);

    // Students (Admin)
    Route::apiResource('students', StudentController::class);
    Route::post('/students/{student}/archive', [StudentController::class, 'archive']);
    Route::post('/students/{student}/unarchive', [StudentController::class, 'unarchive']);

    // Users (Admin)
    Route::apiResource('users', \App\Http\Controllers\Api\UserController::class);

    // Attendance (Teacher/Admin) – per class
    // Using simple parameters instead of resource for custom flow
    Route::get('/attendance/{class}/{date}', [AttendanceController::class, 'show']);
    Route::post('/attendance/{class}/{date}', [AttendanceController::class, 'update']);

    // Reports (Admin)
    Route::get('/reports/daily/{date}', [ReportController::class, 'dailyOverview']);
    Route::get('/reports', [ReportController::class, 'generate']);
});
