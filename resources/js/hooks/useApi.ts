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
  categoriesApi,
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
// Categories
// ---------------------------------------------------------------------------

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesApi.list().then((r) => r.data),
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string }) =>
      categoriesApi.create(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name: string } }) =>
      categoriesApi.update(id, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => categoriesApi.destroy(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

// ---------------------------------------------------------------------------
// Courses
// ---------------------------------------------------------------------------

export function useCourses(showArchived = false, yearId?: number | null, enabled = true) {
  return useQuery({
    queryKey: ["courses", { archived: showArchived, yearId: yearId ?? null }],
    queryFn: () => coursesApi.list(showArchived, yearId).then((r) => r.data),
    enabled,
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
      category_id?: number | null;
      schedule_details?: any[];
      is_pinned?: boolean;
    }) => coursesApi.create(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["courses"] }),
  });
}

export function useDuplicateCourseToYear() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: {
        year_id: number;
        year?: number | null;
        copy_students?: boolean;
      };
    }) => coursesApi.duplicateToYear(id, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["courses"] }),
  });
}

export function useDuplicateCoursesToYear() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      course_ids: number[];
      year_id: number;
      year?: number | null;
      copy_students?: boolean;
    }) => coursesApi.duplicateManyToYear(data).then((r) => r.data),
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
        category_id?: number | null;
        schedule_details?: any[];
        is_pinned?: boolean;
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

export function useArchiveCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => coursesApi.archive(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["courses"] }),
  });
}

export function useUnarchiveCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => coursesApi.unarchive(id),
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

export function useUsers(role: "admin" | "teacher" | "all" = "admin") {
  return useQuery({
    queryKey: ["users", role],
    queryFn: () => usersApi.list(role).then((r) => r.data),
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

export function useCreateTeacher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; email?: string | null; phone?: string | null }) =>
      teachersApi.create(data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teachers"] });
      qc.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useUpdateTeacher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: { name?: string; email?: string | null; phone?: string | null };
    }) => teachersApi.update(id, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teachers"] });
      qc.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useDeleteTeacher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => teachersApi.destroy(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teachers"] });
      qc.invalidateQueries({ queryKey: ["users"] });
    },
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

export function useAllStudents(showArchived = false, categoryId?: number | null) {
  return useQuery({
    queryKey: ["all-students", { archived: showArchived, categoryId: categoryId ?? null }],
    queryFn: () => studentsApi.listAll(showArchived, categoryId).then((r) => r.data),
  });
}

export function useCreateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
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
    }) => studentsApi.create(data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: ["all-students"] });
    },
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
      };
    }) => studentsApi.update(id, data).then((r) => r.data),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ["students", id] });
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: ["all-students"] });
    },
  });
}

export function useDeleteStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => studentsApi.destroy(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: ["all-students"] });
    },
  });
}

export function useArchiveStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => studentsApi.archive(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: ["all-students"] });
    },
  });
}

export function useUnarchiveStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => studentsApi.unarchive(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: ["all-students"] });
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

export function useDailyOverview(date: string, enabled = true, yearId?: number | null) {
  return useQuery({
    queryKey: ["daily-overview", date, { yearId: yearId ?? null }],
    queryFn: () => reportsApi.dailyOverview(date, yearId).then((r) => r.data),
    enabled: enabled && !!date,
    refetchInterval: 5000, // Poll every 5 seconds for realtime updates
  });
}

export function useReportGenerate(
  params: {
    course_id?: number;
    teacher_id?: number;
    student_id?: number;
    from_date?: string;
    to_date?: string;
  },
  enabled = true
) {
  const rangeOk =
    !!params.from_date &&
    !!params.to_date &&
    params.from_date <= params.to_date;

  return useQuery({
    queryKey: ["reports", params],
    queryFn: () => reportsApi.generate(params).then((r) => r.data),
    enabled: enabled && rangeOk,
  });
}

// ---------------------------------------------------------------------------
// Today-page composite hook
// ---------------------------------------------------------------------------
// Admin  → uses daily overview for stats
// Teacher → fetches attendance per course

export function useTodayStats(courses: Course[], date: string, yearId?: number | null, enabled = true) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  // Admin path: single request for all courses
  const overviewQuery = useDailyOverview(date, isAdmin && enabled, yearId);

  // Teacher path: one request per course (teachers typically have 2-5 courses)
  const attendanceQueries = useQueries({
    queries: !isAdmin && enabled
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
