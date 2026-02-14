import axios from "axios";

// ---------------------------------------------------------------------------
// Axios instance
// ---------------------------------------------------------------------------

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Attach Sanctum bearer token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Redirect to login on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token");
      // Only redirect if we're not already on the login page
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// ---------------------------------------------------------------------------
// Types  – mirror the Laravel models / API responses
// ---------------------------------------------------------------------------

export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "teacher";
  teacher?: Teacher | null;
}

export interface Teacher {
  id: number;
  user_id: number;
  phone: string | null;
  user?: User;
  courses?: Course[];
}

export interface Course {
  id: number;
  title: string;
  color: string | null;
  description: string | null;
  students_count?: number;
  teachers_count?: number;
  teachers?: Teacher[];
  students?: Student[];
}

export interface Student {
  id: number;
  full_name: string;
  external_code: string | null;
  notes: string | null;
  courses?: Course[];
}

export interface AttendanceSession {
  id: number;
  course_id: number;
  date: string;
  created_by_user_id: number | null;
  finalized_at: string | null;
  records: AttendanceRecord[];
}

export interface AttendanceRecord {
  id: number;
  attendance_session_id: number;
  student_id: number;
  status: "present" | "absent" | "late" | "excused" | null;
  note: string | null;
  marked_by_user_id: number | null;
  marked_at: string | null;
  student?: Student;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface DailyOverviewItem {
  course_id: number;
  course_title: string;
  total_students: number;
  present_count: number;
  absent_count: number;
  not_marked_count: number;
  completion_percentage: string;
}

export interface ReportSummary {
  total_records_found: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendance_rate: string;
}

/** Convenience stat object used across the UI */
export interface CourseStats {
  total: number;
  present: number;
  absent: number;
  unmarked: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const VALID_COLOR_TAGS = ["teal", "blue", "amber", "rose", "violet"] as const;
export type ColorTag = (typeof VALID_COLOR_TAGS)[number];

/** Map a backend `color` value to a safe CSS tag name */
export function toColorTag(color: string | null | undefined): ColorTag {
  if (color && (VALID_COLOR_TAGS as readonly string[]).includes(color))
    return color as ColorTag;
  return "teal";
}

/** Format a Date to YYYY-MM-DD */
export function fmtDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// ---------------------------------------------------------------------------
// Auth API
// ---------------------------------------------------------------------------

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ access_token: string; token_type: string; user: User }>(
      "/login",
      { email, password }
    ),

  logout: () => api.post("/logout"),

  me: () => api.get<User>("/me"),
};

// ---------------------------------------------------------------------------
// Courses API
// ---------------------------------------------------------------------------

export const coursesApi = {
  list: () => api.get<PaginatedResponse<Course>>("/courses"),

  show: (id: number) => api.get<Course>(`/courses/${id}`),

  create: (data: { title: string; color?: string; description?: string }) =>
    api.post<Course>("/courses", data),

  update: (
    id: number,
    data: { title?: string; color?: string; description?: string }
  ) => api.put<Course>(`/courses/${id}`, data),

  destroy: (id: number) => api.delete(`/courses/${id}`),

  assignTeacher: (courseId: number, teacherId: number) =>
    api.post(`/courses/${courseId}/teachers`, { teacher_id: teacherId }),

  removeTeacher: (courseId: number, teacherId: number) =>
    api.delete(`/courses/${courseId}/teachers`, {
      data: { teacher_id: teacherId },
    }),

  assignStudent: (courseId: number, studentId: number) =>
    api.post(`/courses/${courseId}/students`, { student_id: studentId }),

  removeStudent: (courseId: number, studentId: number) =>
    api.delete(`/courses/${courseId}/students`, {
      data: { student_id: studentId },
    }),
};

// ---------------------------------------------------------------------------
// Teachers API
// ---------------------------------------------------------------------------

export const teachersApi = {
  list: () => api.get<PaginatedResponse<Teacher>>("/teachers"),

  show: (id: number) => api.get<Teacher>(`/teachers/${id}`),

  create: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) => api.post<Teacher>("/teachers", data),
};

// ---------------------------------------------------------------------------
// Students API
// ---------------------------------------------------------------------------

export const studentsApi = {
  list: () => api.get<PaginatedResponse<Student>>("/students"),

  show: (id: number) => api.get<Student>(`/students/${id}`),

  create: (data: {
    full_name: string;
    external_code?: string;
    notes?: string;
  }) => api.post<Student>("/students", data),
};

// ---------------------------------------------------------------------------
// Attendance API
// ---------------------------------------------------------------------------

export const attendanceApi = {
  getSession: (courseId: number, date: string) =>
    api.get<AttendanceSession>(`/attendance/${courseId}/${date}`),

  updateSession: (
    courseId: number,
    date: string,
    records: { student_id: number; status: string; note?: string }[]
  ) => api.post(`/attendance/${courseId}/${date}`, { records }),
};

// ---------------------------------------------------------------------------
// Reports API
// ---------------------------------------------------------------------------

export const reportsApi = {
  dailyOverview: (date: string) =>
    api.get<DailyOverviewItem[]>(`/reports/daily/${date}`),

  generate: (params: {
    course_id?: number;
    teacher_id?: number;
    student_id?: number;
    from_date?: string;
    to_date?: string;
  }) =>
    api.get<{ summary: ReportSummary; records: AttendanceRecord[] }>(
      "/reports",
      { params }
    ),
};

export default api;
