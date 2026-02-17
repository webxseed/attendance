import { useState, useEffect } from "react";
import { Course, toColorTag } from "@/lib/api";
import {
  useCourses,
  useCourse,
  useCreateCourse,
  useUpdateCourse,
  useTeachers,
  useStudents,
  useAssignTeacher,
  useRemoveTeacher,
  useAssignStudent,
  useRemoveStudent,
  useCreateStudent,
} from "@/hooks/useApi";
import { cn } from "@/lib/utils";
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import {
  BookOpen,
  Plus,
  Search,
  Users,
  GraduationCap,
  Loader2,
  X,
  UserPlus,
  Check,
  ChevronsUpDown,
  Pencil,
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
  const [year, setYear] = useState<string>("");
  const [scheduleDetails, setScheduleDetails] = useState<
    { day: string; from_time: string; to_time: string; note: string }[]
  >([]);

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
    setYear("");
    setScheduleDetails([]);
  };

  const addScheduleItem = () => {
    setScheduleDetails([...scheduleDetails, { day: "Sunday", from_time: "10:00", to_time: "12:00", note: "" }]);
  };

  const removeScheduleItem = (index: number) => {
    setScheduleDetails(scheduleDetails.filter((_, i) => i !== index));
  };

  const updateScheduleItem = (index: number, field: keyof typeof scheduleDetails[0], value: string) => {
    const newDetails = [...scheduleDetails];
    newDetails[index] = { ...newDetails[index], [field]: value };
    setScheduleDetails(newDetails);
  };

  const handleCreate = () => {
    if (!title.trim()) return;
    createMutation.mutate(
      {
        title: title.trim(),
        color,
        description: description.trim() || undefined,
        year: year ? parseInt(year) : undefined,
        schedule_details: scheduleDetails.length > 0 ? scheduleDetails : undefined,
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
                <Label>من جيل الى جيل</Label>
                <Input
                  placeholder="وصف مختصر (اختياري)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>السنة الدراسية</Label>
                <Input
                  type="number"
                  placeholder="2026"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>الأيام والأوقات</Label>
                <div className="space-y-2">
                  {scheduleDetails.map((item, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <Select
                        value={item.day}
                        onValueChange={(val) => updateScheduleItem(index, "day", val)}
                      >
                        <SelectTrigger className="w-[110px]">
                          <SelectValue placeholder="اليوم" />
                        </SelectTrigger>
                        <SelectContent>
                          {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(
                            (day) => (
                              <SelectItem key={day} value={day}>
                                {new Intl.DateTimeFormat("ar-EG", { weekday: "long" }).format(
                                  new Date(
                                    day === "Sunday" ? "2023-01-01" :
                                      day === "Monday" ? "2023-01-02" :
                                        day === "Tuesday" ? "2023-01-03" :
                                          day === "Wednesday" ? "2023-01-04" :
                                            day === "Thursday" ? "2023-01-05" :
                                              day === "Friday" ? "2023-01-06" :
                                                "2023-01-07"
                                  )
                                )}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-muted-foreground">من</span>
                        <Input
                          type="time"
                          className="w-[90px] h-8 text-xs"
                          value={item.from_time}
                          onChange={(e) => updateScheduleItem(index, "from_time", e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-muted-foreground">إلى</span>
                        <Input
                          type="time"
                          className="w-[90px] h-8 text-xs"
                          value={item.to_time}
                          onChange={(e) => updateScheduleItem(index, "to_time", e.target.value)}
                        />
                      </div>
                      <div className="flex-1 flex flex-col gap-1">
                        <span className="text-[10px] text-muted-foreground">&nbsp;</span>
                        <Input
                          placeholder="ملاحظة"
                          className="h-8 text-xs"
                          value={item.note}
                          onChange={(e) => updateScheduleItem(index, "note", e.target.value)}
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive mt-[18px]"
                        onClick={() => removeScheduleItem(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full gap-2 border-dashed"
                    onClick={addScheduleItem}
                  >
                    <Plus className="w-4 h-4" />
                    إضافة موعد
                  </Button>
                </div>
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
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{course.title}</p>
                      {course.year && (
                        <Badge variant="outline" className="text-[10px] h-4 px-1">
                          {course.year}
                        </Badge>
                      )}
                    </div>
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
  const updateCourse = useUpdateCourse();

  // Edit form state
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [color, setColor] = useState("");
  const [description, setDescription] = useState("");
  const [year, setYear] = useState("");
  const [scheduleDetails, setScheduleDetails] = useState<
    { day: string; from_time: string; to_time: string; note: string }[]
  >([]);

  // Sync edit form state when course is loaded
  useEffect(() => {
    if (course && !isEditing) {
      setTitle(course.title);
      setColor(course.color || "teal");
      setDescription(course.description || "");
      setYear(course.year?.toString() || "");
      setScheduleDetails(
        (course.schedule_details || []).map((d: any) => ({
          day: d.day,
          from_time: d.from_time || d.time || "10:00",
          to_time: d.to_time || "12:00",
          note: d.note || "",
        }))
      );
    }
  }, [course, isEditing]);

  // Local select values
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");

  // Student autocomplete & create state
  const [studentComboOpen, setStudentComboOpen] = useState(false);
  const [createStudentDialogOpen, setCreateStudentDialogOpen] = useState(false);
  const createStudentMutation = useCreateStudent();

  const [newStudentData, setNewStudentData] = useState({
    full_name: "",
    identity_number: "",
    date_of_birth: "",
    grade_level: "",
    school_name: "",
    address: "",
    mother_name: "",
    mother_phone: "",
    father_name: "",
    father_phone: "",
    notes: "",
  });

  const resetNewStudentForm = () => {
    setNewStudentData({
      full_name: "",
      identity_number: "",
      date_of_birth: "",
      grade_level: "",
      school_name: "",
      address: "",
      mother_name: "",
      mother_phone: "",
      father_name: "",
      father_phone: "",
      notes: "",
    });
  };

  const handleCreateStudent = () => {
    if (!newStudentData.full_name.trim()) return;
    createStudentMutation.mutate(
      {
        ...newStudentData,
        date_of_birth: newStudentData.date_of_birth || undefined,
      },
      {
        onSuccess: (student) => {
          toast({ title: "تمت الإضافة", description: "تم إنشاء الطالب بنجاح" });
          setCreateStudentDialogOpen(false);
          resetNewStudentForm();
          // Automatically assign
          assignStudent.mutate({ courseId, studentId: student.id }, {
            onSuccess: () => toast({ title: "تم التسجيل", description: "تم تسجيل الطالب في الدورة" })
          });
        },
        onError: (err: any) => {
          toast({
            title: "خطأ",
            description: err.response?.data?.message || "تعذّر انشاء الطالب",
            variant: "destructive"
          });
        }
      });
  };

  if (!open || !courseId) return null;

  const handleUpdate = () => {
    updateCourse.mutate(
      {
        id: courseId,
        data: {
          title,
          color,
          description,
          year: year ? parseInt(year) : undefined,
          schedule_details: scheduleDetails,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "تم التحديث", description: "تم تحديث بيانات الدورة بنجاح" });
          setIsEditing(false);
        },
        onError: (err: any) => {
          toast({
            title: "خطأ",
            description: err.response?.data?.message || "تعذّر التحديث",
            variant: "destructive",
          });
        },
      }
    );
  };

  const addScheduleItem = () => {
    setScheduleDetails([...scheduleDetails, { day: "Sunday", from_time: "10:00", to_time: "12:00", note: "" }]);
  };

  const removeScheduleItem = (index: number) => {
    setScheduleDetails(scheduleDetails.filter((_, i) => i !== index));
  };

  const updateScheduleItem = (index: number, field: keyof typeof scheduleDetails[0], value: string) => {
    const newDetails = [...scheduleDetails];
    newDetails[index] = { ...newDetails[index], [field]: value };
    setScheduleDetails(newDetails);
  };

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
              <Button
                variant="ghost"
                size="sm"
                className="text-primary gap-1"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? "إلغاء التعديل" : "تعديل البيانات"}
              </Button>
              <div className="flex items-center gap-2">
                <span className={`course-tag course-tag-${colorTag}`}>
                  {colorTag}
                </span>
                <span>{course?.title ?? "..."}</span>
              </div>
            </div>
            {course?.description && !isEditing && (
              <p className="text-sm font-normal text-muted-foreground mt-1 text-end">
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
            {/* ---- Edit Course form ---- */}
            {isEditing && (
              <div className="p-5 border-b bg-muted/20 space-y-4">
                <div className="space-y-2">
                  <Label>اسم الدورة</Label>
                  <Input
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
                  <Label>من جيل الى جيل</Label>
                  <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>السنة الدراسية</Label>
                  <Input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>الأيام والأوقات</Label>
                  <div className="space-y-2">
                    {scheduleDetails.map((item, index) => (
                      <div key={index} className="flex gap-2 items-start">
                        <Select
                          value={item.day}
                          onValueChange={(val) => updateScheduleItem(index, "day", val)}
                        >
                          <SelectTrigger className="w-[110px]">
                            <SelectValue placeholder="اليوم" />
                          </SelectTrigger>
                          <SelectContent>
                            {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(
                              (day) => (
                                <SelectItem key={day} value={day}>
                                  {new Intl.DateTimeFormat("ar-EG", { weekday: "long" }).format(
                                    new Date(
                                      day === "Sunday" ? "2023-01-01" :
                                        day === "Monday" ? "2023-01-02" :
                                          day === "Tuesday" ? "2023-01-03" :
                                            day === "Wednesday" ? "2023-01-04" :
                                              day === "Thursday" ? "2023-01-05" :
                                                day === "Friday" ? "2023-01-06" :
                                                  "2023-01-07"
                                    )
                                  )}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] text-muted-foreground">من</span>
                          <Input
                            type="time"
                            className="w-[90px] h-8 text-xs"
                            value={item.from_time}
                            onChange={(e) => updateScheduleItem(index, "from_time", e.target.value)}
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] text-muted-foreground">إلى</span>
                          <Input
                            type="time"
                            className="w-[90px] h-8 text-xs"
                            value={item.to_time}
                            onChange={(e) => updateScheduleItem(index, "to_time", e.target.value)}
                          />
                        </div>
                        <div className="flex-1 flex flex-col gap-1">
                          <span className="text-[10px] text-muted-foreground">&nbsp;</span>
                          <Input
                            placeholder="ملاحظة"
                            className="h-8 text-xs"
                            value={item.note}
                            onChange={(e) => updateScheduleItem(index, "note", e.target.value)}
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive mt-[18px]"
                          onClick={() => removeScheduleItem(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full gap-2 border-dashed"
                      onClick={addScheduleItem}
                    >
                      <Plus className="w-4 h-4" />
                      إضافة موعد
                    </Button>
                  </div>
                </div>
                <Button
                  onClick={handleUpdate}
                  className="w-full"
                  disabled={updateCourse.isPending || !title.trim()}
                >
                  {updateCourse.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin ms-2" />
                  ) : null}
                  حفظ التعديلات
                </Button>
              </div>
            )}

            {/* ---- Teachers section ---- */}
            <div className="p-5 border-b text-end">
              <div className="flex items-center justify-end gap-2 mb-4">
                <Badge variant="secondary" className="text-xs">
                  {course?.teachers?.length ?? 0}
                </Badge>
                <h3 className="font-semibold text-sm">المعلمون</h3>
                <Users className="w-4 h-4 text-primary" />
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

              {/* Add student - Autocomplete & Create */}
              <div className="flex flex-col gap-2">
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

                  <Popover open={studentComboOpen} onOpenChange={setStudentComboOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={studentComboOpen}
                        className="flex-1 justify-between text-start font-normal h-9 px-3"
                      >
                        {selectedStudentId
                          ? availableStudents.find((s) => String(s.id) === selectedStudentId)?.full_name
                          : "اختر طالباً..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="بحث عن طالب..." />
                        <CommandList>
                          <CommandEmpty>لم يتم العثور على طالب.</CommandEmpty>
                          <CommandGroup>
                            {availableStudents.map((student) => (
                              <CommandItem
                                key={student.id}
                                value={student.full_name}
                                onSelect={() => {
                                  setSelectedStudentId(String(student.id) === selectedStudentId ? "" : String(student.id));
                                  setStudentComboOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedStudentId === String(student.id) ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {student.full_name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                          <CommandSeparator />
                          <CommandGroup>
                            <CommandItem
                              onSelect={() => {
                                setStudentComboOpen(false);
                                setCreateStudentDialogOpen(true);
                              }}
                              className="text-primary cursor-pointer font-medium"
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              إضافة طالب جديد
                            </CommandItem>
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Create Student Dialog */}
              <Dialog open={createStudentDialogOpen} onOpenChange={setCreateStudentDialogOpen}>
                <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>إضافة طالب جديد</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>اسم الطالب <span className="text-destructive">*</span></Label>
                        <Input
                          placeholder="الاسم الكامل"
                          value={newStudentData.full_name}
                          onChange={(e) => setNewStudentData({ ...newStudentData, full_name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>رقم الهوية</Label>
                        <Input
                          placeholder="رقم الهوية"
                          value={newStudentData.identity_number}
                          onChange={(e) => setNewStudentData({ ...newStudentData, identity_number: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>تاريخ الميلاد</Label>
                        <Input
                          type="date"
                          value={newStudentData.date_of_birth}
                          onChange={(e) => setNewStudentData({ ...newStudentData, date_of_birth: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>الصف</Label>
                        <Input
                          placeholder="مثال: الخامس أ"
                          value={newStudentData.grade_level}
                          onChange={(e) => setNewStudentData({ ...newStudentData, grade_level: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>المدرسة</Label>
                        <Input
                          placeholder="اسم المدرسة"
                          value={newStudentData.school_name}
                          onChange={(e) => setNewStudentData({ ...newStudentData, school_name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>العنوان</Label>
                        <Input
                          placeholder="المدينة / الشارع"
                          value={newStudentData.address}
                          onChange={(e) => setNewStudentData({ ...newStudentData, address: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="border-t pt-2 mt-2">
                      <h3 className="font-semibold text-sm mb-3">بيانات الوالدين</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div className="space-y-2">
                          <Label>اسم الأم</Label>
                          <Input
                            placeholder="اسم الأم"
                            value={newStudentData.mother_name}
                            onChange={(e) => setNewStudentData({ ...newStudentData, mother_name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>هاتف الأم</Label>
                          <Input
                            placeholder="05XXXXXXXX"
                            value={newStudentData.mother_phone}
                            onChange={(e) => setNewStudentData({ ...newStudentData, mother_phone: e.target.value })}
                            dir="ltr"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>اسم الأب</Label>
                          <Input
                            placeholder="اسم الأب"
                            value={newStudentData.father_name}
                            onChange={(e) => setNewStudentData({ ...newStudentData, father_name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>هاتف الأب</Label>
                          <Input
                            placeholder="05XXXXXXXX"
                            value={newStudentData.father_phone}
                            onChange={(e) => setNewStudentData({ ...newStudentData, father_phone: e.target.value })}
                            dir="ltr"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>ملاحظات</Label>
                      <Textarea
                        placeholder="ملاحظات إضافية ..."
                        value={newStudentData.notes}
                        onChange={(e) => setNewStudentData({ ...newStudentData, notes: e.target.value })}
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        onClick={() => setCreateStudentDialogOpen(false)}
                        className="flex-1"
                      >
                        إلغاء
                      </Button>
                      <Button
                        onClick={handleCreateStudent}
                        className="flex-1"
                        disabled={createStudentMutation.isPending || !newStudentData.full_name.trim()}
                      >
                        {createStudentMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "حفظ وإضافة"
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
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
