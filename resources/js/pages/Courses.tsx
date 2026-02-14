import { useState } from "react";
import { Course, toColorTag } from "@/lib/api";
import {
  useCourses,
  useCourse,
  useCreateCourse,
  useTeachers,
  useStudents,
  useAssignTeacher,
  useRemoveTeacher,
  useAssignStudent,
  useRemoveStudent,
} from "@/hooks/useApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  Plus,
  Search,
  Users,
  GraduationCap,
  Loader2,
  X,
  UserPlus,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const colorOptions = [
  { value: "teal", label: "أخضر مائي" },
  { value: "blue", label: "أزرق" },
  { value: "amber", label: "ذهبي" },
  { value: "rose", label: "وردي" },
  { value: "violet", label: "بنفسجي" },
];

export default function Courses() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [manageCourseId, setManageCourseId] = useState<number | null>(null);
  const { toast } = useToast();

  // Create-form state
  const [title, setTitle] = useState("");
  const [color, setColor] = useState("teal");
  const [description, setDescription] = useState("");

  // API – list
  const { data: coursesPage, isLoading } = useCourses();
  const createMutation = useCreateCourse();
  const courses = coursesPage?.data ?? [];

  const filtered = search
    ? courses.filter((c) => c.title.includes(search))
    : courses;

  const resetForm = () => {
    setTitle("");
    setColor("teal");
    setDescription("");
  };

  const handleCreate = () => {
    if (!title.trim()) return;
    createMutation.mutate(
      {
        title: title.trim(),
        color,
        description: description.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast({
            title: "تمت الإضافة",
            description: "تمت إضافة الدورة بنجاح",
          });
          resetForm();
          setDialogOpen(false);
        },
        onError: (err: any) => {
          toast({
            title: "خطأ",
            description:
              err.response?.data?.message || "تعذّر إضافة الدورة",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">الدورات</h1>
        <p className="page-subtitle">إدارة الدورات والمواد الدراسية</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              إضافة دورة
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>إضافة دورة جديدة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>اسم الدورة</Label>
                <Input
                  placeholder="مثال: تجويد القرآن"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>اللون</Label>
                <Select value={color} onValueChange={setColor}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-3 h-3 rounded-full course-tag-${opt.value}`}
                            style={{ display: "inline-block" }}
                          />
                          {opt.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>الوصف</Label>
                <Input
                  placeholder="وصف مختصر (اختياري)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setDialogOpen(false);
                  }}
                  className="flex-1"
                >
                  إلغاء
                </Button>
                <Button
                  onClick={handleCreate}
                  className="flex-1"
                  disabled={createMutation.isPending || !title.trim()}
                >
                  {createMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "حفظ"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <div className="relative w-full sm:w-auto">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="بحث..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ps-9 w-full sm:w-56"
          />
        </div>
      </div>

      {/* Course list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="bg-card rounded-xl border overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-3 border-b bg-muted/30 text-xs font-semibold text-muted-foreground">
            <span className="text-start">اسم الدورة</span>
            <span>اللون</span>
            <span>المعلمون</span>
            <span>الطلاب</span>
          </div>
          {filtered.map((course) => {
            const colorTag = toColorTag(course.color);
            return (
              <button
                key={course.id}
                onClick={() => setManageCourseId(course.id)}
                className="w-full grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-4 border-b last:border-b-0 hover:bg-muted/20 transition-colors items-center text-start"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-8 rounded-full course-tag-${colorTag}`}
                    style={{ minWidth: 8 }}
                  />
                  <div>
                    <p className="font-medium text-sm">{course.title}</p>
                    {course.description && (
                      <p className="text-xs text-muted-foreground">
                        {course.description}
                      </p>
                    )}
                  </div>
                </div>
                <span
                  className={`course-tag course-tag-${colorTag} text-[10px]`}
                >
                  {colorTag}
                </span>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="w-3.5 h-3.5" />
                  <span>{course.teachers_count ?? 0}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>{course.students_count ?? 0}</span>
                </div>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p>لا توجد دورات</p>
            </div>
          )}
        </div>
      )}

      {/* Course management sheet */}
      <CourseManageSheet
        courseId={manageCourseId}
        open={manageCourseId !== null}
        onClose={() => setManageCourseId(null)}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Course manage sheet – assign / remove teachers & students
// ---------------------------------------------------------------------------

function CourseManageSheet({
  courseId,
  open,
  onClose,
}: {
  courseId: number | null;
  open: boolean;
  onClose: () => void;
}) {
  const { toast } = useToast();

  // Fetch full course detail (includes teachers.user + students)
  const { data: course, isLoading: courseLoading } = useCourse(courseId!);

  // Fetch all teachers & students for the "add" selects
  const { data: allTeachersPage } = useTeachers();
  const { data: allStudentsPage } = useStudents();
  const allTeachers = allTeachersPage?.data ?? [];
  const allStudents = allStudentsPage?.data ?? [];

  // Mutations
  const assignTeacher = useAssignTeacher();
  const removeTeacher = useRemoveTeacher();
  const assignStudent = useAssignStudent();
  const removeStudent = useRemoveStudent();

  // Local select values
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");

  if (!open || !courseId) return null;

  const assignedTeacherIds = new Set(
    (course?.teachers ?? []).map((t) => t.id)
  );
  const assignedStudentIds = new Set(
    (course?.students ?? []).map((s) => s.id)
  );

  const availableTeachers = allTeachers.filter(
    (t) => !assignedTeacherIds.has(t.id)
  );
  const availableStudents = allStudents.filter(
    (s) => !assignedStudentIds.has(s.id)
  );

  const colorTag = toColorTag(course?.color);

  const handleAssignTeacher = () => {
    if (!selectedTeacherId) return;
    assignTeacher.mutate(
      { courseId, teacherId: Number(selectedTeacherId) },
      {
        onSuccess: () => {
          toast({ title: "تم التعيين", description: "تم تعيين المعلم للدورة" });
          setSelectedTeacherId("");
        },
        onError: (err: any) =>
          toast({
            title: "خطأ",
            description: err.response?.data?.message || "تعذّر التعيين",
            variant: "destructive",
          }),
      }
    );
  };

  const handleRemoveTeacher = (teacherId: number) => {
    removeTeacher.mutate(
      { courseId, teacherId },
      {
        onSuccess: () =>
          toast({
            title: "تمت الإزالة",
            description: "تمت إزالة المعلم من الدورة",
          }),
        onError: (err: any) =>
          toast({
            title: "خطأ",
            description: err.response?.data?.message || "تعذّرت الإزالة",
            variant: "destructive",
          }),
      }
    );
  };

  const handleAssignStudent = () => {
    if (!selectedStudentId) return;
    assignStudent.mutate(
      { courseId, studentId: Number(selectedStudentId) },
      {
        onSuccess: () => {
          toast({
            title: "تم التسجيل",
            description: "تم تسجيل الطالب في الدورة",
          });
          setSelectedStudentId("");
        },
        onError: (err: any) =>
          toast({
            title: "خطأ",
            description: err.response?.data?.message || "تعذّر التسجيل",
            variant: "destructive",
          }),
      }
    );
  };

  const handleRemoveStudent = (studentId: number) => {
    removeStudent.mutate(
      { courseId, studentId },
      {
        onSuccess: () =>
          toast({
            title: "تمت الإزالة",
            description: "تمت إزالة الطالب من الدورة",
          }),
        onError: (err: any) =>
          toast({
            title: "خطأ",
            description: err.response?.data?.message || "تعذّرت الإزالة",
            variant: "destructive",
          }),
      }
    );
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="left"
        className="w-full sm:max-w-lg p-0 flex flex-col"
      >
        {/* Header */}
        <SheetHeader className="p-5 pb-4 border-b">
          <SheetTitle className="text-start">
            <div className="flex items-center justify-between">
              <span className={`course-tag course-tag-${colorTag}`}>
                {colorTag}
              </span>
              <span>{course?.title ?? "..."}</span>
            </div>
            {course?.description && (
              <p className="text-sm font-normal text-muted-foreground mt-1">
                {course.description}
              </p>
            )}
          </SheetTitle>
        </SheetHeader>

        {courseLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {/* ---- Teachers section ---- */}
            <div className="p-5 border-b">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm">المعلمون</h3>
                <Badge variant="secondary" className="text-xs">
                  {course?.teachers?.length ?? 0}
                </Badge>
              </div>

              {/* Assigned teachers */}
              {(course?.teachers ?? []).length > 0 ? (
                <div className="space-y-2 mb-4">
                  {course!.teachers!.map((teacher) => (
                    <div
                      key={teacher.id}
                      className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2.5"
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemoveTeacher(teacher.id)}
                        disabled={removeTeacher.isPending}
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                      <div className="text-end">
                        <p className="text-sm font-medium">
                          {teacher.user?.name ?? `معلم #${teacher.id}`}
                        </p>
                        {teacher.user?.email && (
                          <p className="text-xs text-muted-foreground">
                            {teacher.user.email}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mb-4">
                  لا يوجد معلمون معيّنون لهذه الدورة
                </p>
              )}

              {/* Add teacher */}
              {availableTeachers.length > 0 && (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={handleAssignTeacher}
                    disabled={!selectedTeacherId || assignTeacher.isPending}
                    className="gap-1.5 flex-shrink-0"
                  >
                    {assignTeacher.isPending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <UserPlus className="w-3.5 h-3.5" />
                    )}
                    تعيين
                  </Button>
                  <Select
                    value={selectedTeacherId}
                    onValueChange={setSelectedTeacherId}
                  >
                    <SelectTrigger className="flex-1 text-start">
                      <SelectValue placeholder="اختر معلماً..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTeachers.map((t) => (
                        <SelectItem key={t.id} value={String(t.id)}>
                          {t.user?.name ?? `معلم #${t.id}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* ---- Students section ---- */}
            <div className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm">الطلاب</h3>
                <Badge variant="secondary" className="text-xs">
                  {course?.students?.length ?? 0}
                </Badge>
              </div>

              {/* Assigned students */}
              {(course?.students ?? []).length > 0 ? (
                <div className="space-y-2 mb-4">
                  {course!.students!.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2.5"
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemoveStudent(student.id)}
                        disabled={removeStudent.isPending}
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                      <div className="text-end">
                        <p className="text-sm font-medium">
                          {student.full_name}
                        </p>
                        {student.external_code && (
                          <p className="text-xs text-muted-foreground">
                            {student.external_code}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mb-4">
                  لا يوجد طلاب مسجّلون في هذه الدورة
                </p>
              )}

              {/* Add student */}
              {availableStudents.length > 0 && (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={handleAssignStudent}
                    disabled={!selectedStudentId || assignStudent.isPending}
                    className="gap-1.5 flex-shrink-0"
                  >
                    {assignStudent.isPending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <UserPlus className="w-3.5 h-3.5" />
                    )}
                    تسجيل
                  </Button>
                  <Select
                    value={selectedStudentId}
                    onValueChange={setSelectedStudentId}
                  >
                    <SelectTrigger className="flex-1 text-start">
                      <SelectValue placeholder="اختر طالباً..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableStudents.map((s) => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          {s.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t bg-card">
          <Button variant="outline" onClick={onClose} className="w-full">
            إغلاق
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
