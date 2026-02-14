import {
  useQuery,
  useQueries,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  coursesApi,
  teachersApi,
  studentsApi,
  attendanceApi,
  reportsApi,
  Course,
  CourseStats,
  DailyOverviewItem,
} from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

// ---------------------------------------------------------------------------
// Courses
// ---------------------------------------------------------------------------

export function useCourses() {
  return useQuery({
    queryKey: ["courses"],
    queryFn: () => coursesApi.list().then((r) => r.data),
  });
}

export function useCourse(id: number) {
  return useQuery({
    queryKey: ["courses", id],
    queryFn: () => coursesApi.show(id).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCreateCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; color?: string; description?: string }) =>
      coursesApi.create(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["courses"] }),
  });
}

export function useDeleteCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => coursesApi.destroy(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["courses"] }),
  });
}

// ---------------------------------------------------------------------------
// Teachers
// ---------------------------------------------------------------------------

export function useTeachers() {
  return useQuery({
    queryKey: ["teachers"],
    queryFn: () => teachersApi.list().then((r) => r.data),
  });
}

export function useCreateTeacher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      email: string;
      password: string;
      phone?: string;
    }) => teachersApi.create(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["teachers"] }),
  });
}

// ---------------------------------------------------------------------------
// Students
// ---------------------------------------------------------------------------

export function useStudents() {
  return useQuery({
    queryKey: ["students"],
    queryFn: () => studentsApi.list().then((r) => r.data),
  });
}

export function useCreateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      full_name: string;
      external_code?: string;
      notes?: string;
    }) => studentsApi.create(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["students"] }),
  });
}

// ---------------------------------------------------------------------------
// Attendance
// ---------------------------------------------------------------------------

export function useAttendanceSession(courseId: number | null, date: string) {
  return useQuery({
    queryKey: ["attendance", courseId, date],
    queryFn: () =>
      attendanceApi.getSession(courseId!, date).then((r) => r.data),
    enabled: !!courseId && !!date,
  });
}

export function useSaveAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      courseId,
      date,
      records,
    }: {
      courseId: number;
      date: string;
      records: { student_id: number; status: string; note?: string }[];
    }) => attendanceApi.updateSession(courseId, date, records),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["attendance"] });
      qc.invalidateQueries({ queryKey: ["daily-overview"] });
    },
  });
}

// ---------------------------------------------------------------------------
// Reports / Daily Overview
// ---------------------------------------------------------------------------

export function useDailyOverview(date: string, enabled = true) {
  return useQuery({
    queryKey: ["daily-overview", date],
    queryFn: () => reportsApi.dailyOverview(date).then((r) => r.data),
    enabled: enabled && !!date,
  });
}

export function useReportGenerate(params: {
  course_id?: number;
  teacher_id?: number;
  from_date?: string;
  to_date?: string;
}) {
  return useQuery({
    queryKey: ["reports", params],
    queryFn: () => reportsApi.generate(params).then((r) => r.data),
  });
}

// ---------------------------------------------------------------------------
// Today-page composite hook
// ---------------------------------------------------------------------------
// Admin  → uses daily overview for stats
// Teacher → fetches attendance per course

export function useTodayStats(courses: Course[], date: string) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  // Admin path: single request for all courses
  const overviewQuery = useDailyOverview(date, isAdmin);

  // Teacher path: one request per course (teachers typically have 2-5 courses)
  const attendanceQueries = useQueries({
    queries: !isAdmin
      ? courses.map((c) => ({
          queryKey: ["attendance", c.id, date],
          queryFn: () =>
            attendanceApi.getSession(c.id, date).then((r) => r.data),
        }))
      : [],
  });

  // Build a course-id → stats map
  const statsMap: Record<number, CourseStats> = {};

  if (isAdmin && overviewQuery.data) {
    for (const item of overviewQuery.data as DailyOverviewItem[]) {
      statsMap[item.course_id] = {
        total: item.total_students,
        present: item.present_count,
        absent: item.absent_count,
        unmarked: item.not_marked_count,
      };
    }
  } else if (!isAdmin) {
    courses.forEach((course, i) => {
      const data = attendanceQueries[i]?.data;
      if (data) {
        const records = data.records ?? [];
        const present = records.filter((r) => r.status === "present").length;
        const absent = records.filter((r) => r.status === "absent").length;
        const total = records.length;
        statsMap[course.id] = {
          total,
          present,
          absent,
          unmarked: total - present - absent,
        };
      }
    });
  }

  const isLoading = isAdmin
    ? overviewQuery.isLoading
    : attendanceQueries.some((q) => q.isLoading);

  return { statsMap, isLoading };
}
