# School Attendance Platform Scaffold

This scaffold provides the backend API for the School Attendance Platform.

## Prerequisites

1. **Install Sanctum**:
   Ensure Laravel Sanctum is installed for API authentication.
   ```bash
   composer require laravel/sanctum
   php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
   ```

2. **Register API Routes**:
   If using Laravel 11+, ensure `api.php` is registered in `bootstrap/app.php`:
   ```php
   ->withRouting(
       web: __DIR__.'/../routes/web.php',
       api: __DIR__.'/../routes/api.php', // Add this line
       commands: __DIR__.'/../routes/console.php',
       health: '/up',
   )
   ```

## Setup

1. **Run Migrations**:
   ```bash
   php artisan migrate
   ```

2. **Seed Database**:
   ```bash
   php artisan db:seed
   ```
   This creates:
   - Admin: `admin@school.com` / `password`
   - Teachers: `teacher1@school.com` / `password`

## API Endpoints

### Authentication
- `POST /api/login`
  - Body: `{ "email": "admin@school.com", "password": "password" }`
- `POST /api/logout` (Auth required)

### Courses
- `GET /api/courses` (Admin: all, Teacher: assigned only)
- `POST /api/courses` (Admin only)
  - Body: `{ "title": "Math", "color": "#FF0000" }`
- `GET /api/courses/{id}`
- `POST /api/courses/{id}/assign-teacher`
  - Body: `{ "teacher_id": 1 }`
- `POST /api/courses/{id}/assign-student`
  - Body: `{ "student_id": 1 }`

### Attendance
- `GET /api/attendance/{course_id}/{date}`
  - Example: `/api/attendance/1/2026-02-13`
  - Returns: Session object with `records` array (students prefilled).
  
- `POST /api/attendance/{course_id}/{date}` (Bulk Update)
  - Body:
    ```json
    {
      "records": [
        { "student_id": 1, "status": "present", "note": "" },
        { "student_id": 2, "status": "absent", "note": "Sick" }
      ]
    }
    ```

### Reports (Admin)
- `GET /api/reports/daily/{date}`
  - Overview of all courses for that day.
- `GET /api/reports`
  - Filters: `?from_date=2026-01-01&to_date=2026-02-01&course_id=1`
