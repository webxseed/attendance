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
  email: string | null;
  phone: string | null;
  role: "admin" | "teacher";
  password?: string;
  teacher?: Teacher | null;
}

export interface Teacher {
  id: number;
  user_id: number;
  phone: string | null;
  user?: User;
  courses?: Course[];
}

export interface Year {
  id: number;
  name: string;
  title: string | null;
  start_year: string | null;
  end_year: string | null;
}

export interface Category {
  id: number;
  name: string;
}

export interface Course {
  id: number;
  title: string;
  color: string | null;
  description: string | null;
  year?: number | null;
  year_id?: number | null;
  category_id?: number | null;
  academic_year?: Year | null;
  category?: Category | null;
  schedule_details?: { day: string; from_time: string; to_time: string; note: string }[] | null;
  students_count?: number;
  teachers_count?: number;
  teachers?: Teacher[];
  students?: Student[];
  archived_at?: string | null;
  /** Pinned ("ثابت") courses show on the Today page for every academic year */
  is_pinned?: boolean;
}

export interface Student {
  id: number;
  full_name: string;
  external_code: string | null;
  notes: string | null;
  category_id?: number | null;
  category?: Category | null;
  date_of_birth?: string | null;
  identity_number?: string | null;
  grade_level?: string | null;
  school_name?: string | null;
  address?: string | null;
  mother_name?: string | null;
  mother_phone?: string | null;
  father_name?: string | null;
  father_phone?: string | null;
  courses?: Course[];
  archived_at?: string | null;
}

export interface AttendanceSession {
  id: number;
  course_id: number;
  date: string;
  created_by_user_id: number | null;
  finalized_at: string | null;
  note: string | null;
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
  /** Present on `/reports` generate responses */
  session?: {
    id: number;
    course_id: number;
    date: string;
    course?: Pick<Course, "id" | "title">;
  };
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
  sendOtp: (phone: string) => api.post("/auth/send-otp", { phone }),
  verifyOtp: (phone: string, code: string) =>
    api.post<{ access_token: string; token_type: string; user: User }>(
      "/auth/verify-otp",
      { phone, code }
    ),

  logout: () => api.post("/logout"),

  me: () => api.get<User>("/me"),
};

// ---------------------------------------------------------------------------
// Years API
// ---------------------------------------------------------------------------

export const yearsApi = {
  list: () => api.get<Year[]>("/years"),
  create: (data: { title: string; start_year: string; end_year: string }) =>
    api.post<Year>("/years", data),

  update: (
    id: number,
    data: { title: string; start_year: string; end_year: string }
  ) => api.put<Year>(`/years/${id}`, data),
};

// ---------------------------------------------------------------------------
// Categories API
// ---------------------------------------------------------------------------

export const categoriesApi = {
  list: () => api.get<Category[]>("/categories"),
  create: (data: { name: string }) => api.post<Category>("/categories", data),
  update: (id: number, data: { name: string }) =>
    api.put<Category>(`/categories/${id}`, data),
  destroy: (id: number) => api.delete(`/categories/${id}`),
};

// ---------------------------------------------------------------------------
// Courses API
// ---------------------------------------------------------------------------

export const coursesApi = {
  list: (showArchived = false, yearId?: number | null) => {
    const params = new URLSearchParams();
    if (showArchived) params.set("archived", "true");
    if (yearId) params.set("year_id", String(yearId));
    const query = params.toString();
    return api.get<PaginatedResponse<Course>>(`/courses${query ? `?${query}` : ""}`);
  },

  show: (id: number) => api.get<Course>(`/courses/${id}`),

  create: (data: {
    title: string;
    color?: string;
    description?: string;
    year?: number;
    year_id?: number;
    category_id?: number | null;
    schedule_details?: any[];
    is_pinned?: boolean;
  }) => api.post<Course>("/courses", data),

  duplicateToYear: (
    id: number,
    data: {
      year_id: number;
      year?: number | null;
      copy_students?: boolean;
    }
  ) => api.post<Course>(`/courses/${id}/duplicate-to-year`, data),

  duplicateManyToYear: (data: {
    course_ids: number[];
    year_id: number;
    year?: number | null;
    copy_students?: boolean;
  }) =>
    api.post<{ message: string; count: number; courses: Course[] }>(
      "/courses/duplicate-to-year",
      data
    ),

  update: (
    id: number,
    data: {
      title?: string;
      color?: string;
      description?: string;
      year?: number;
      year_id?: number;
      category_id?: number | null;
      schedule_details?: any[];
      is_pinned?: boolean;
    }
  ) => api.put<Course>(`/courses/${id}`, data),

  destroy: (id: number) => api.delete(`/courses/${id}`),

  archive: (id: number) => api.post(`/courses/${id}/archive`),
  unarchive: (id: number) => api.post(`/courses/${id}/unarchive`),

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
// Users API
// ---------------------------------------------------------------------------

export const usersApi = {
  list: (role: "admin" | "teacher" | "all" = "admin") =>
    api.get<PaginatedResponse<User>>(`/users?role=${role}`),
  show: (id: number) => api.get<User>(`/users/${id}`),
  create: (data: Partial<User>) => api.post<User>("/users", data),
  update: (id: number, data: Partial<User>) => api.put<User>(`/users/${id}`, data),
  destroy: (id: number) => api.delete(`/users/${id}`),
};

// ---------------------------------------------------------------------------
// Teachers API
// ---------------------------------------------------------------------------

export const teachersApi = {
  list: () => api.get<PaginatedResponse<Teacher>>("/teachers"),
  listAll: () => api.get<Teacher[]>("/teachers?all=true"),

  show: (id: number) => api.get<Teacher>(`/teachers/${id}`),

  create: (data: {
    name: string;
    email?: string | null;
    phone?: string | null;
  }) => api.post<Teacher>("/teachers", data),

  update: (
    id: number,
    data: {
      name?: string;
      email?: string | null;
      phone?: string | null;
    }
  ) => api.put<Teacher>(`/teachers/${id}`, data),

  destroy: (id: number) => api.delete(`/teachers/${id}`),
};

// ---------------------------------------------------------------------------
// Students API
// ---------------------------------------------------------------------------

export const studentsApi = {
  list: (showArchived = false) => api.get<PaginatedResponse<Student>>(`/students${showArchived ? "?archived=true" : ""}`),
  listAll: (showArchived = false, categoryId?: number | null) => {
    const params = new URLSearchParams({ all: "true" });
    if (showArchived) params.set("archived", "true");
    if (categoryId) params.set("category_id", String(categoryId));
    return api.get<Student[]>(`/students?${params.toString()}`);
  },

  show: (id: number) => api.get<Student>(`/students/${id}`),

  create: (data: {
    full_name: string;
    external_code?: string;
    notes?: string;
    category_id?: number | null;
    date_of_birth?: string;
    identity_number?: string;
    grade_level?: string;
    school_name?: string;
    address?: string;
    mother_name?: string;
    mother_phone?: string;
    father_name?: string;
    father_phone?: string;
  }) => api.post<Student>("/students", data),

  update: (
    id: number,
    data: {
      full_name?: string;
      external_code?: string;
      notes?: string;
      category_id?: number | null;
      date_of_birth?: string;
      identity_number?: string;
      grade_level?: string;
      school_name?: string;
      address?: string;
      mother_name?: string;
      mother_phone?: string;
      father_name?: string;
      father_phone?: string;
    }
  ) => api.put<Student>(`/students/${id}`, data),

  destroy: (id: number) => api.delete(`/students/${id}`),

  archive: (id: number) => api.post(`/students/${id}/archive`),
  unarchive: (id: number) => api.post(`/students/${id}/unarchive`),
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
    data: {
      records?: { student_id: number; status: string; note?: string }[];
      note?: string;
    }
  ) => api.post(`/attendance/${courseId}/${date}`, data),
};

// ---------------------------------------------------------------------------
// Reports API
// ---------------------------------------------------------------------------

export const reportsApi = {
  dailyOverview: (date: string, yearId?: number | null) =>
    api.get<DailyOverviewItem[]>(`/reports/daily/${date}`, {
      params: yearId ? { year_id: yearId } : undefined,
    }),

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
