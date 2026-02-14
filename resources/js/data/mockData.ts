export interface Course {
  id: string;
  name: string;
  days: string[];
  time: string;
  colorTag: string;
  teacherIds: string[];
  studentIds: string[];
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  courseIds: string[];
}

export interface Student {
  id: string;
  name: string;
  group: string;
  courseIds: string[];
}

export type AttendanceStatus = "present" | "absent" | "unmarked";

export interface AttendanceRecord {
  studentId: string;
  courseId: string;
  date: string;
  status: AttendanceStatus;
  note?: string;
  time?: string;
}

export const courses: Course[] = [
  { id: "c1", name: "تجويد القرآن", days: ["الأحد", "الثلاثاء", "الخميس"], time: "09:00", colorTag: "teal", teacherIds: ["t1"], studentIds: ["s1", "s2", "s3", "s4", "s5", "s6"] },
  { id: "c2", name: "اللغة العربية", days: ["الإثنين", "الأربعاء"], time: "10:00", colorTag: "blue", teacherIds: ["t2"], studentIds: ["s1", "s3", "s5", "s7", "s8"] },
  { id: "c3", name: "الرياضيات", days: ["الأحد", "الثلاثاء"], time: "11:00", colorTag: "amber", teacherIds: ["t3"], studentIds: ["s2", "s4", "s6", "s7", "s8", "s9", "s10"] },
  { id: "c4", name: "العلوم", days: ["الإثنين", "الخميس"], time: "12:00", colorTag: "rose", teacherIds: ["t1", "t4"], studentIds: ["s1", "s2", "s3", "s9", "s10"] },
  { id: "c5", name: "التربية الإسلامية", days: ["الأربعاء", "الخميس"], time: "13:00", colorTag: "violet", teacherIds: ["t2"], studentIds: ["s4", "s5", "s6", "s7", "s8", "s9"] },
];

export const teachers: Teacher[] = [
  { id: "t1", name: "أحمد محمد الخالدي", email: "ahmed@mowal.edu", phone: "0501234567", courseIds: ["c1", "c4"] },
  { id: "t2", name: "سارة علي النعيمي", email: "sara@mowal.edu", phone: "0507654321", courseIds: ["c2", "c5"] },
  { id: "t3", name: "يوسف حسن العمري", email: "yousef@mowal.edu", phone: "0509876543", courseIds: ["c3"] },
  { id: "t4", name: "فاطمة أحمد الشامسي", email: "fatima@mowal.edu", phone: "0503456789", courseIds: ["c4"] },
];

export const students: Student[] = [
  { id: "s1", name: "عمر يوسف", group: "أ", courseIds: ["c1", "c2", "c4"] },
  { id: "s2", name: "ليلى أحمد", group: "أ", courseIds: ["c1", "c3", "c4"] },
  { id: "s3", name: "كريم حسن", group: "أ", courseIds: ["c1", "c2", "c4"] },
  { id: "s4", name: "نور الدين محمد", group: "ب", courseIds: ["c1", "c3", "c5"] },
  { id: "s5", name: "مريم علي", group: "ب", courseIds: ["c1", "c2", "c5"] },
  { id: "s6", name: "يزن خالد", group: "ب", courseIds: ["c1", "c3", "c5"] },
  { id: "s7", name: "رنا سعيد", group: "ج", courseIds: ["c2", "c3", "c5"] },
  { id: "s8", name: "آدم فهد", group: "ج", courseIds: ["c2", "c3", "c5"] },
  { id: "s9", name: "هدى ناصر", group: "ج", courseIds: ["c3", "c4", "c5"] },
  { id: "s10", name: "سلطان عبدالله", group: "ج", courseIds: ["c3", "c4"] },
];

// Today's attendance - some marked, some not
export const todayAttendance: AttendanceRecord[] = [
  { studentId: "s1", courseId: "c1", date: "2026-02-12", status: "present", time: "09:05" },
  { studentId: "s2", courseId: "c1", date: "2026-02-12", status: "present", time: "09:03" },
  { studentId: "s3", courseId: "c1", date: "2026-02-12", status: "absent", note: "مريض" },
  { studentId: "s4", courseId: "c1", date: "2026-02-12", status: "present", time: "09:01" },
  { studentId: "s5", courseId: "c1", date: "2026-02-12", status: "unmarked" },
  { studentId: "s6", courseId: "c1", date: "2026-02-12", status: "unmarked" },
  { studentId: "s2", courseId: "c3", date: "2026-02-12", status: "present", time: "11:02" },
  { studentId: "s4", courseId: "c3", date: "2026-02-12", status: "absent" },
  { studentId: "s6", courseId: "c3", date: "2026-02-12", status: "unmarked" },
  { studentId: "s7", courseId: "c3", date: "2026-02-12", status: "unmarked" },
  { studentId: "s8", courseId: "c3", date: "2026-02-12", status: "unmarked" },
  { studentId: "s9", courseId: "c3", date: "2026-02-12", status: "unmarked" },
  { studentId: "s10", courseId: "c3", date: "2026-02-12", status: "unmarked" },
];

export const todayArabic = "الخميس";

export function getStudentsByIds(ids: string[]): Student[] {
  return students.filter((s) => ids.includes(s.id));
}

export function getTeachersByIds(ids: string[]): Teacher[] {
  return teachers.filter((t) => ids.includes(t.id));
}

export function getCoursesByIds(ids: string[]): Course[] {
  return courses.filter((c) => ids.includes(c.id));
}

export function getTodayCourses(): Course[] {
  return courses.filter((c) => c.days.includes(todayArabic));
}

export function getAttendanceForCourse(courseId: string): AttendanceRecord[] {
  return todayAttendance.filter((a) => a.courseId === courseId);
}

export function getCourseAttendanceStats(courseId: string) {
  const course = courses.find((c) => c.id === courseId);
  if (!course) return { total: 0, present: 0, absent: 0, unmarked: 0 };
  const records = getAttendanceForCourse(courseId);
  const present = records.filter((r) => r.status === "present").length;
  const absent = records.filter((r) => r.status === "absent").length;
  const unmarked = course.studentIds.length - present - absent;
  return { total: course.studentIds.length, present, absent, unmarked };
}
