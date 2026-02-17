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
  usersApi,
  attendanceApi,
  reportsApi,
  yearsApi,
  Course,
  CourseStats,
  DailyOverviewItem,
  User,
} from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

// ---------------------------------------------------------------------------
// Years
// ---------------------------------------------------------------------------

export function useYears() {
  return useQuery({
    queryKey: ["years"],
    queryFn: () => yearsApi.list().then((r) => r.data),
  });
}

export function useCreateYear() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; start_year: string; end_year: string }) =>
      yearsApi.create(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["years"] }),
  });
}

export function useUpdateYear() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: { title: string; start_year: string; end_year: string };
    }) => yearsApi.update(id, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["years"] }),
  });
}

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
    mutationFn: (data: {
      title: string;
      color?: string;
      description?: string;
      year?: number;
      year_id?: number;
      schedule_details?: any[];
    }) => coursesApi.create(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["courses"] }),
  });
}

export function useUpdateCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: {
        title?: string;
        color?: string;
        description?: string;
        year?: number;
        year_id?: number;
        schedule_details?: any[];
      };
    }) => coursesApi.update(id, data).then((r) => r.data),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ["courses", id] });
      qc.invalidateQueries({ queryKey: ["courses"] });
    },
  });
}

export function useDeleteCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => coursesApi.destroy(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["courses"] }),
  });
}

export function useAssignTeacher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, teacherId }: { courseId: number; teacherId: number }) =>
      coursesApi.assignTeacher(courseId, teacherId),
    onSuccess: (_data, { courseId }) => {
      qc.invalidateQueries({ queryKey: ["courses", courseId] });
      qc.invalidateQueries({ queryKey: ["courses"] });
    },
  });
}

export function useRemoveTeacher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, teacherId }: { courseId: number; teacherId: number }) =>
      coursesApi.removeTeacher(courseId, teacherId),
    onSuccess: (_data, { courseId }) => {
      qc.invalidateQueries({ queryKey: ["courses", courseId] });
      qc.invalidateQueries({ queryKey: ["courses"] });
    },
  });
}

export function useAssignStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, studentId }: { courseId: number; studentId: number }) =>
      coursesApi.assignStudent(courseId, studentId),
    onSuccess: (_data, { courseId }) => {
      qc.invalidateQueries({ queryKey: ["courses", courseId] });
      qc.invalidateQueries({ queryKey: ["courses"] });
    },
  });
}

export function useRemoveStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, studentId }: { courseId: number; studentId: number }) =>
      coursesApi.removeStudent(courseId, studentId),
    onSuccess: (_data, { courseId }) => {
      qc.invalidateQueries({ queryKey: ["courses", courseId] });
      qc.invalidateQueries({ queryKey: ["courses"] });
    },
  });
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => usersApi.list().then((r) => r.data),
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<User>) => usersApi.create(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<User> }) =>
      usersApi.update(id, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => usersApi.destroy(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
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
      date_of_birth?: string;
      identity_number?: string;
      grade_level?: string;
      school_name?: string;
      address?: string;
      mother_name?: string;
      mother_phone?: string;
      father_name?: string;
      father_phone?: string;
    }) => studentsApi.create(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["students"] }),
  });
}

export function useUpdateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: {
        full_name?: string;
        external_code?: string;
        notes?: string;
        date_of_birth?: string;
        identity_number?: string;
        grade_level?: string;
        school_name?: string;
        address?: string;
        mother_name?: string;
        mother_phone?: string;
        father_name?: string;
        father_phone?: string;
      };
    }) => studentsApi.update(id, data).then((r) => r.data),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ["students", id] });
      qc.invalidateQueries({ queryKey: ["students"] });
    },
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
      note,
    }: {
      courseId: number;
      date: string;
      records?: { student_id: number; status: string; note?: string }[];
      note?: string;
    }) => attendanceApi.updateSession(courseId, date, { records, note }),
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
    refetchInterval: 5000, // Poll every 5 seconds for realtime updates
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
        // Poll for teachers too so they see their own updates if made from another device, 
        // though less critical than admin dashboard
        refetchInterval: 5000,
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
