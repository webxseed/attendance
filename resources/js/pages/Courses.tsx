import { useState, useEffect } from "react";
import { Course, CourseClass, ScheduleItem, toColorTag, classesApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  useCourses,
  useCreateCourse,
  useUpdateCourse,
  useDeleteCourse,
  useArchiveCourse,
  useUnarchiveCourse,
  useClass,
  useCreateClass,
  useUpdateClass,
  useDeleteClass,
  useArchiveClass,
  useUnarchiveClass,
  useDuplicateClassToYear,
  useDuplicateClassesToYear,
  useTeachers,
  useAllStudents,
  useAssignTeacher,
  useRemoveTeacher,
  useAssignStudent,
  useRemoveStudent,
  useCreateStudent,
  useCreateTeacher,
  useYears,
  useCreateYear,
  useCategories,
  useCreateCategory,
} from "@/hooks/useApi";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  ChevronDown,
  ChevronLeft,
  Pencil,
  Trash2,
  Archive,
  ArchiveRestore,
  Copy,
  Pin,
  PinOff,
  Layers,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const colorOptions = [
  { value: "teal", label: "أخضر مائي" },
  { value: "blue", label: "أزرق" },
  { value: "amber", label: "ذهبي" },
  { value: "rose", label: "وردي" },
  { value: "violet", label: "بنفسجي" },
];

const WEEKDAYS = [
  { value: "Sunday", date: "2023-01-01" },
  { value: "Monday", date: "2023-01-02" },
  { value: "Tuesday", date: "2023-01-03" },
  { value: "Wednesday", date: "2023-01-04" },
  { value: "Thursday", date: "2023-01-05" },
  { value: "Friday", date: "2023-01-06" },
  { value: "Saturday", date: "2023-01-07" },
].map((d) => ({
  value: d.value,
  label: new Intl.DateTimeFormat("ar-EG", { weekday: "long" }).format(new Date(d.date)),
}));

const emptySchedule = (): ScheduleItem => ({
  day: "Sunday",
  from_time: "10:00",
  to_time: "12:00",
  note: "",
});

// ---------------------------------------------------------------------------
// Weekly schedule editor – shared by the class create form and the class sheet
// ---------------------------------------------------------------------------

function ScheduleEditor({
  value,
  onChange,
}: {
  value: ScheduleItem[];
  onChange: (items: ScheduleItem[]) => void;
}) {
  const updateItem = (index: number, field: keyof ScheduleItem, fieldValue: string) => {
    onChange(value.map((item, i) => (i === index ? { ...item, [field]: fieldValue } : item)));
  };

  return (
    <div className="space-y-2">
      {value.map((item, index) => (
        <div key={index} className="flex gap-2 items-start">
          <Select value={item.day} onValueChange={(val) => updateItem(index, "day", val)}>
            <SelectTrigger className="w-[110px]">
              <SelectValue placeholder="اليوم" />
            </SelectTrigger>
            <SelectContent>
              {WEEKDAYS.map((day) => (
                <SelectItem key={day.value} value={day.value}>
                  {day.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-muted-foreground">من</span>
            <Input
              type="time"
              className="w-[90px] h-8 text-xs"
              value={item.from_time}
              onChange={(e) => updateItem(index, "from_time", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-muted-foreground">إلى</span>
            <Input
              type="time"
              className="w-[90px] h-8 text-xs"
              value={item.to_time}
              onChange={(e) => updateItem(index, "to_time", e.target.value)}
            />
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <span className="text-[10px] text-muted-foreground">&nbsp;</span>
            <Input
              placeholder="ملاحظة"
              className="h-8 text-xs"
              value={item.note}
              onChange={(e) => updateItem(index, "note", e.target.value)}
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive mt-[18px]"
            onClick={() => onChange(value.filter((_, i) => i !== index))}
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
        onClick={() => onChange([...value, emptySchedule()])}
      >
        <Plus className="w-4 h-4" />
        إضافة موعد
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Academic-year picker with an inline "create year" popover
// ---------------------------------------------------------------------------

function YearPicker({
  value,
  onChange,
  placeholder = "اختر السنة",
}: {
  value: string;
  onChange: (yearId: string) => void;
  placeholder?: string;
}) {
  const { toast } = useToast();
  const { data: years } = useYears();
  const createYear = useCreateYear();
  const [title, setTitle] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const handleCreate = async () => {
    if (!title.trim() || !start.trim() || !end.trim()) return;
    try {
      const year = await createYear.mutateAsync({
        title,
        start_year: start,
        end_year: end,
      });
      setTitle("");
      setStart("");
      setEnd("");
      onChange(year.id.toString());
      toast({ title: "تم", description: "تمت إضافة السنة بنجاح" });
    } catch (e: any) {
      toast({
        title: "خطأ",
        description: e.response?.data?.message || "فشل إضافة السنة",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex gap-2">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="flex-1">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {years?.map((y) => (
            <SelectItem key={y.id} value={y.id.toString()}>
              {y.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon">
            <Plus className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3">
          <div className="space-y-2">
            <h4 className="font-medium text-xs leading-none">إضافة سنة جديدة</h4>
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="اللقب (مثال: فوج)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-8 text-xs col-span-2"
              />
              <Input
                placeholder="2026"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="h-8 text-xs"
                type="number"
              />
              <Input
                placeholder="2027"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="h-8 text-xs"
                type="number"
              />
            </div>
            <Button
              size="sm"
              className="w-full h-8 text-xs"
              onClick={handleCreate}
              disabled={createYear.isPending}
            >
              {createYear.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "إضافة"}
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Category picker with an inline "create category" popover
// ---------------------------------------------------------------------------

function CategoryPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (categoryId: string) => void;
}) {
  const { toast } = useToast();
  const { data: categories } = useCategories();
  const createCategory = useCreateCategory();
  const [name, setName] = useState("");

  const handleCreate = async () => {
    if (!name.trim()) return;
    try {
      const category = await createCategory.mutateAsync({ name: name.trim() });
      setName("");
      onChange(category.id.toString());
      toast({ title: "تم", description: "تمت إضافة التصنيف بنجاح" });
    } catch (e: any) {
      toast({
        title: "خطأ",
        description: e.response?.data?.message || "فشل إضافة التصنيف",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex gap-2">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="flex-1">
          <SelectValue placeholder="اختر التصنيف" />
        </SelectTrigger>
        <SelectContent>
          {categories?.map((c) => (
            <SelectItem key={c.id} value={c.id.toString()}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon">
            <Plus className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3">
          <div className="space-y-2">
            <h4 className="font-medium text-xs leading-none">إضافة تصنيف جديد</h4>
            <Input
              placeholder="اسم التصنيف"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-8 text-xs"
            />
            <Button
              size="sm"
              className="w-full h-8 text-xs"
              onClick={handleCreate}
              disabled={createCategory.isPending}
            >
              {createCategory.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "إضافة"}
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Courses page
// ---------------------------------------------------------------------------

export default function Courses() {
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [expandedCourseIds, setExpandedCourseIds] = useState<number[]>([]);
  const [manageClassId, setManageClassId] = useState<number | null>(null);
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [addClassCourse, setAddClassCourse] = useState<Course | null>(null);
  const { toast } = useToast();

  // Create-course form state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [color, setColor] = useState("teal");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [firstClassName, setFirstClassName] = useState("شعبة 1");
  const [firstClassYearId, setFirstClassYearId] = useState("");
  const [newTeacherName, setNewTeacherName] = useState("");
  const [scheduleDetails, setScheduleDetails] = useState<ScheduleItem[]>([]);

  // Bulk class duplication state
  const [selectedClassIds, setSelectedClassIds] = useState<number[]>([]);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkYearId, setBulkYearId] = useState("");
  const [bulkYear, setBulkYear] = useState("");
  const [bulkName, setBulkName] = useState("");
  const [bulkCopyStudents, setBulkCopyStudents] = useState(false);

  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const { data: coursesPage, isLoading } = useCourses(showArchived);
  const courses = coursesPage?.data ?? [];

  const createCourse = useCreateCourse();
  const createClass = useCreateClass();
  const createTeacherMutation = useCreateTeacher();
  const archiveCourseMutation = useArchiveCourse();
  const unarchiveCourseMutation = useUnarchiveCourse();
  const updateClassMutation = useUpdateClass();
  const duplicateClassesMutation = useDuplicateClassesToYear();

  // Search matches a course title or any of its class names
  const filtered = search
    ? courses.filter(
      (c) =>
        c.title.includes(search) ||
        (c.classes ?? []).some((cl) => cl.name.includes(search))
    )
    : courses;

  const allClasses = filtered.flatMap((c) => c.classes ?? []);

  const toggleExpanded = (courseId: number) => {
    setExpandedCourseIds((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
    );
  };

  // --- Bulk selection ---
  const toggleSelectedClass = (classId: number) => {
    setSelectedClassIds((prev) =>
      prev.includes(classId) ? prev.filter((id) => id !== classId) : [...prev, classId]
    );
  };

  const visibleClassIds = allClasses.map((c) => c.id);
  const allVisibleSelected =
    visibleClassIds.length > 0 && visibleClassIds.every((id) => selectedClassIds.includes(id));

  const toggleSelectAll = () => {
    setSelectedClassIds(allVisibleSelected ? [] : visibleClassIds);
    if (!allVisibleSelected) setExpandedCourseIds(filtered.map((c) => c.id));
  };

  const openBulkDialog = () => {
    setBulkYearId("");
    setBulkYear("");
    setBulkName("");
    setBulkCopyStudents(false);
    setBulkDialogOpen(true);
  };

  const handleBulkDuplicate = () => {
    if (!bulkYearId || selectedClassIds.length === 0) return;
    duplicateClassesMutation.mutate(
      {
        class_ids: selectedClassIds,
        year_id: Number(bulkYearId),
        year: bulkYear.trim() ? Number(bulkYear) : null,
        name: bulkName.trim() || null,
        copy_students: bulkCopyStudents,
      },
      {
        onSuccess: (res) => {
          toast({
            title: "تم النسخ",
            description: `تم نسخ ${res.count} شعبة للسنة الجديدة`,
          });
          setBulkDialogOpen(false);
          setSelectedClassIds([]);
        },
        onError: (err: any) =>
          toast({
            title: "خطأ",
            description: err.response?.data?.message || "تعذّر نسخ الشعب",
            variant: "destructive",
          }),
      }
    );
  };

  const handleTogglePinned = (e: React.MouseEvent, courseClass: CourseClass) => {
    e.stopPropagation();
    updateClassMutation.mutate(
      { id: courseClass.id, data: { is_pinned: !courseClass.is_pinned } },
      {
        onSuccess: () =>
          toast({
            title: courseClass.is_pinned ? "تم إلغاء التثبيت" : "تم التثبيت",
            description: courseClass.is_pinned
              ? "لن تظهر الشعبة إلا في سنتها الدراسية"
              : "ستظهر الشعبة في كل السنوات الدراسية",
          }),
        onError: (err: any) =>
          toast({
            title: "خطأ",
            description: err.response?.data?.message || "تعذّر تحديث التثبيت",
            variant: "destructive",
          }),
      }
    );
  };

  const handleArchiveCourse = (e: React.MouseEvent, courseId: number) => {
    e.stopPropagation();
    archiveCourseMutation.mutate(courseId, {
      onSuccess: () => toast({ title: "تمت الأرشفة", description: "تم أرشفة الدورة بنجاح" }),
      onError: (err: any) => toast({ title: "خطأ", description: err.response?.data?.message || "تعذّر الأرشفة", variant: "destructive" }),
    });
  };

  const handleUnarchiveCourse = (e: React.MouseEvent, courseId: number) => {
    e.stopPropagation();
    unarchiveCourseMutation.mutate(courseId, {
      onSuccess: () => toast({ title: "تمت الاستعادة", description: "تم استعادة الدورة بنجاح" }),
      onError: (err: any) => toast({ title: "خطأ", description: err.response?.data?.message || "تعذّر الاستعادة", variant: "destructive" }),
    });
  };

  const resetForm = () => {
    setTitle("");
    setColor("teal");
    setDescription("");
    setCategoryId("");
    setFirstClassName("شعبة 1");
    setFirstClassYearId("");
    setNewTeacherName("");
    setScheduleDetails([]);
  };

  /** Create the course together with its first class */
  const handleCreate = async () => {
    if (!title.trim()) return;
    try {
      const course = await createCourse.mutateAsync({
        title: title.trim(),
        color,
        description: description.trim() || undefined,
        category_id: categoryId ? parseInt(categoryId) : undefined,
      });

      const courseClass = await createClass.mutateAsync({
        course_id: course.id,
        name: firstClassName.trim() || "شعبة 1",
        year_id: firstClassYearId ? parseInt(firstClassYearId) : undefined,
        schedule_details: scheduleDetails.length > 0 ? scheduleDetails : undefined,
      });

      if (newTeacherName.trim()) {
        const teacher = await createTeacherMutation.mutateAsync({
          name: newTeacherName.trim(),
        });
        await classesApi.assignTeacher(courseClass.id, teacher.id);
      }

      toast({ title: "تمت الإضافة", description: "تمت إضافة الدورة وشعبتها الأولى" });
      resetForm();
      setDialogOpen(false);
    } catch (err: any) {
      toast({
        title: "خطأ",
        description: err.response?.data?.message || "تعذّر إضافة الدورة",
        variant: "destructive",
      });
    }
  };

  const busy =
    createCourse.isPending || createClass.isPending || createTeacherMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">الدورات</h1>
        <p className="page-subtitle">إدارة الدورات وشعبها لكل سنة دراسية</p>
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
          <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
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
                <Label>التصنيف</Label>
                <CategoryPicker value={categoryId} onChange={setCategoryId} />
              </div>

              <div className="rounded-md border p-3 space-y-4 bg-muted/20">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary" />
                  <h4 className="text-sm font-semibold">الشعبة الأولى</h4>
                </div>

                <div className="space-y-2">
                  <Label>اسم الشعبة</Label>
                  <Input
                    placeholder="مثال: شعبة أ"
                    value={firstClassName}
                    onChange={(e) => setFirstClassName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>السنة الدراسية (الفوج)</Label>
                  <YearPicker value={firstClassYearId} onChange={setFirstClassYearId} />
                </div>

                <div className="space-y-2">
                  <Label>معلم الشعبة (اختياري)</Label>
                  <Input
                    placeholder="اسم المعلم — يُنشأ تلقائياً عند الحفظ"
                    value={newTeacherName}
                    onChange={(e) => setNewTeacherName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>الأيام والأوقات</Label>
                  <ScheduleEditor value={scheduleDetails} onChange={setScheduleDetails} />
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
                  disabled={busy || !title.trim()}
                >
                  {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "حفظ"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <div className="flex items-center gap-2">
          <Button
            variant={showArchived ? "default" : "outline"}
            size="sm"
            className="gap-2"
            onClick={() => {
              setShowArchived(!showArchived);
              setSelectedClassIds([]);
            }}
          >
            <Archive className="w-4 h-4" />
            {showArchived ? "إخفاء المؤرشفة" : "المؤرشفة"}
          </Button>
          <div className="relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="بحث..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ps-9 w-full sm:w-56"
            />
          </div>
        </div>
      </div>

      {/* Bulk actions bar */}
      {isAdmin && selectedClassIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-primary/5 px-4 py-3">
          <div className="flex items-center gap-2">
            <Button
              onClick={openBulkDialog}
              size="sm"
              className="gap-2"
              disabled={duplicateClassesMutation.isPending}
            >
              {duplicateClassesMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              نسخ لسنة جديدة
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSelectedClassIds([])}>
              إلغاء التحديد
            </Button>
          </div>
          <p className="text-sm font-medium">تم اختيار {selectedClassIds.length} شعبة</p>
        </div>
      )}

      {/* Bulk duplicate dialog */}
      <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>نسخ الشعب المحددة لسنة جديدة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground text-end">
              سيتم نسخ {selectedClassIds.length} شعبة مع معلميها، وتبقى كل شعبة ضمن دورتها
            </p>

            <div className="space-y-2">
              <Label>السنة الدراسية الجديدة</Label>
              <YearPicker value={bulkYearId} onChange={setBulkYearId} />
            </div>

            <div className="space-y-2">
              <Label>اسم الشعب الجديدة (اختياري)</Label>
              <Input
                placeholder="يبقى اسم كل شعبة كما هو"
                value={bulkName}
                onChange={(e) => setBulkName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>السنة (رقم - اختياري)</Label>
              <Input
                type="number"
                placeholder="2027"
                value={bulkYear}
                onChange={(e) => setBulkYear(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-end gap-2 rounded-md border p-3">
              <Label htmlFor="bulk-copy-students" className="cursor-pointer">
                نسخ كل الطلاب
              </Label>
              <Checkbox
                id="bulk-copy-students"
                checked={bulkCopyStudents}
                onCheckedChange={(checked) => setBulkCopyStudents(checked === true)}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setBulkDialogOpen(false)} className="flex-1">
                إلغاء
              </Button>
              <Button
                onClick={handleBulkDuplicate}
                className="flex-1"
                disabled={duplicateClassesMutation.isPending || !bulkYearId}
              >
                {duplicateClassesMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "نسخ"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Course list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="bg-card rounded-xl border overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-3 border-b bg-muted/30 text-xs font-semibold text-muted-foreground">
            {isAdmin && (
              <Checkbox
                checked={allVisibleSelected}
                onCheckedChange={toggleSelectAll}
                aria-label="تحديد كل الشعب"
                disabled={visibleClassIds.length === 0}
              />
            )}
            <span className="flex-1 text-start">اسم الدورة</span>
            <span className="w-20 text-center">الشعب</span>
            <span className="w-20 text-center">الطلاب</span>
            {isAdmin && <span className="w-32" />}
          </div>

          {filtered.map((course) => {
            const colorTag = toColorTag(course.color);
            const classes = course.classes ?? [];
            const expanded = expandedCourseIds.includes(course.id);

            return (
              <div key={course.id} className={course.archived_at ? "opacity-60" : ""}>
                {/* Course row */}
                <div className="flex items-center gap-3 px-5 py-4 border-b hover:bg-muted/20 transition-colors">
                  {isAdmin && <span className="w-4" />}
                  <button
                    className="flex items-center gap-3 text-start min-w-0 flex-1"
                    onClick={() => toggleExpanded(course.id)}
                  >
                    {expanded ? (
                      <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    ) : (
                      <ChevronLeft className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    )}
                    <div
                      className={`w-2 h-8 rounded-full course-tag-${colorTag} flex-shrink-0`}
                      style={{ minWidth: 8 }}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm">{course.title}</p>
                        {course.archived_at && (
                          <Badge variant="secondary" className="text-[10px] h-4 px-1">مؤرشف</Badge>
                        )}
                        {course.category && (
                          <Badge variant="outline" className="text-[10px] h-4 px-1">
                            {course.category.name}
                          </Badge>
                        )}
                      </div>
                      {course.description && (
                        <p className="text-xs text-muted-foreground">{course.description}</p>
                      )}
                    </div>
                  </button>

                  <div className="w-20 flex items-center justify-center gap-1 text-sm text-muted-foreground">
                    <Layers className="w-3.5 h-3.5" />
                    <span>{course.classes_count ?? classes.length}</span>
                  </div>
                  <div className="w-20 flex items-center justify-center gap-1 text-sm text-muted-foreground">
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>{course.students_count ?? 0}</span>
                  </div>

                  {isAdmin && (
                    <div className="w-32 flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        onClick={() => setAddClassCourse(course)}
                        title="إضافة شعبة"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        onClick={() => setEditCourse(course)}
                        title="تعديل الدورة"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      {course.archived_at ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          onClick={(e) => handleUnarchiveCourse(e, course.id)}
                          disabled={unarchiveCourseMutation.isPending}
                          title="استعادة الدورة"
                        >
                          <ArchiveRestore className="w-3.5 h-3.5" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-amber-600"
                          onClick={(e) => handleArchiveCourse(e, course.id)}
                          disabled={archiveCourseMutation.isPending}
                          title="أرشفة الدورة"
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Class rows */}
                {expanded && (
                  <div className="bg-muted/10 border-b">
                    {classes.length === 0 ? (
                      <div className="px-5 py-4 text-sm text-muted-foreground flex items-center justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5"
                          onClick={() => setAddClassCourse(course)}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          إضافة شعبة
                        </Button>
                        <span>لا توجد شعب في هذه الدورة</span>
                      </div>
                    ) : (
                      classes.map((courseClass) => (
                        <div
                          key={courseClass.id}
                          className="flex items-center gap-3 px-5 py-3 border-t first:border-t-0 hover:bg-muted/30 transition-colors"
                        >
                          {isAdmin && (
                            <Checkbox
                              checked={selectedClassIds.includes(courseClass.id)}
                              onCheckedChange={() => toggleSelectedClass(courseClass.id)}
                              aria-label={`تحديد ${courseClass.name}`}
                            />
                          )}
                          <button
                            className="flex items-center gap-2 text-start min-w-0 flex-1 ps-7"
                            onClick={() => setManageClassId(courseClass.id)}
                          >
                            <Layers className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-sm font-medium">{courseClass.name}</p>
                                {courseClass.is_pinned && (
                                  <Badge className="text-[10px] h-4 px-1 gap-1">
                                    <Pin className="w-2.5 h-2.5" />
                                    ثابت
                                  </Badge>
                                )}
                                {courseClass.academic_year && (
                                  <Badge variant="secondary" className="text-[10px] h-4 px-1">
                                    {courseClass.academic_year.name}
                                  </Badge>
                                )}
                                {courseClass.year && (
                                  <Badge variant="outline" className="text-[10px] h-4 px-1">
                                    {courseClass.year}
                                  </Badge>
                                )}
                              </div>
                              {(courseClass.teachers ?? []).length > 0 && (
                                <p className="text-xs text-muted-foreground">
                                  {courseClass.teachers!
                                    .map((t) => t.user?.name ?? `معلم #${t.id}`)
                                    .join("، ")}
                                </p>
                              )}
                            </div>
                          </button>

                          <div className="w-20 flex items-center justify-center gap-1 text-sm text-muted-foreground">
                            <Users className="w-3.5 h-3.5" />
                            <span>{courseClass.teachers_count ?? 0}</span>
                          </div>
                          <div className="w-20 flex items-center justify-center gap-1 text-sm text-muted-foreground">
                            <GraduationCap className="w-3.5 h-3.5" />
                            <span>{courseClass.students_count ?? 0}</span>
                          </div>

                          {isAdmin && (
                            <div className="w-32 flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className={`h-8 w-8 ${courseClass.is_pinned ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
                                onClick={(e) => handleTogglePinned(e, courseClass)}
                                disabled={updateClassMutation.isPending}
                                title={courseClass.is_pinned ? "إلغاء التثبيت" : "تثبيت الشعبة (تظهر في كل السنوات)"}
                              >
                                {courseClass.is_pinned ? (
                                  <PinOff className="w-3.5 h-3.5" />
                                ) : (
                                  <Pin className="w-3.5 h-3.5" />
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
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

      {/* Course edit dialog */}
      <CourseEditDialog course={editCourse} onClose={() => setEditCourse(null)} />

      {/* Add class dialog */}
      <AddClassDialog course={addClassCourse} onClose={() => setAddClassCourse(null)} />

      {/* Class management sheet */}
      <ClassManageSheet
        classId={manageClassId}
        open={manageClassId !== null}
        onClose={() => setManageClassId(null)}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Course edit / delete dialog
// ---------------------------------------------------------------------------

function CourseEditDialog({
  course,
  onClose,
}: {
  course: Course | null;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const updateCourse = useUpdateCourse();
  const deleteCourse = useDeleteCourse();

  const [title, setTitle] = useState("");
  const [color, setColor] = useState("teal");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");

  useEffect(() => {
    if (course) {
      setTitle(course.title);
      setColor(course.color || "teal");
      setDescription(course.description || "");
      setCategoryId(course.category_id?.toString() || "");
    }
  }, [course]);

  if (!course) return null;

  const handleUpdate = () => {
    updateCourse.mutate(
      {
        id: course.id,
        data: {
          title,
          color,
          description,
          category_id: categoryId ? parseInt(categoryId) : null,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "تم التحديث", description: "تم تحديث بيانات الدورة بنجاح" });
          onClose();
        },
        onError: (err: any) =>
          toast({
            title: "خطأ",
            description: err.response?.data?.message || "تعذّر التحديث",
            variant: "destructive",
          }),
      }
    );
  };

  const handleDelete = () => {
    if (
      !confirm(
        "سيتم حذف الدورة وكل شعبها وسجلات الحضور الخاصة بها. لا يمكن التراجع عن هذا الإجراء. هل أنت متأكد؟"
      )
    )
      return;

    deleteCourse.mutate(course.id, {
      onSuccess: () => {
        toast({ title: "تم الحذف", description: "تم حذف الدورة بنجاح" });
        onClose();
      },
      onError: (err: any) =>
        toast({
          title: "خطأ",
          description: err.response?.data?.message || "تعذّر الحذف",
          variant: "destructive",
        }),
    });
  };

  return (
    <Dialog open={!!course} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>تعديل الدورة</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>اسم الدورة</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
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
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>التصنيف</Label>
            <CategoryPicker value={categoryId} onChange={setCategoryId} />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteCourse.isPending}
              className="gap-2"
              title="حذف الدورة"
            >
              {deleteCourse.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              إلغاء
            </Button>
            <Button
              onClick={handleUpdate}
              className="flex-1"
              disabled={updateCourse.isPending || !title.trim()}
            >
              {updateCourse.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "حفظ"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Add a class to an existing course
// ---------------------------------------------------------------------------

function AddClassDialog({
  course,
  onClose,
}: {
  course: Course | null;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const createClass = useCreateClass();
  const duplicateClass = useDuplicateClassToYear();

  const [name, setName] = useState("");
  const [yearId, setYearId] = useState("");
  const [year, setYear] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  /** "" = start empty, otherwise the id of the class to copy from */
  const [copyFromClassId, setCopyFromClassId] = useState("");
  const [copyStudents, setCopyStudents] = useState(true);

  const existingClasses = course?.classes ?? [];

  useEffect(() => {
    if (course) {
      setName(`شعبة ${existingClasses.length + 1}`);
      setYearId("");
      setYear("");
      setIsPinned(false);
      setSchedule([]);
      setCopyFromClassId("");
      setCopyStudents(true);
    }
  }, [course]);

  if (!course) return null;

  const handleSubmit = () => {
    if (!name.trim()) return;

    const onSuccess = () => {
      toast({ title: "تمت الإضافة", description: `تمت إضافة ${name.trim()} إلى ${course.title}` });
      onClose();
    };
    const onError = (err: any) =>
      toast({
        title: "خطأ",
        description: err.response?.data?.message || "تعذّر إضافة الشعبة",
        variant: "destructive",
      });

    // Copying an existing class carries its teachers and – optionally – students
    if (copyFromClassId) {
      if (!yearId) {
        toast({
          title: "خطأ",
          description: "يرجى اختيار السنة الدراسية",
          variant: "destructive",
        });
        return;
      }
      duplicateClass.mutate(
        {
          id: Number(copyFromClassId),
          data: {
            year_id: Number(yearId),
            year: year.trim() ? Number(year) : null,
            name: name.trim(),
            copy_students: copyStudents,
          },
        },
        { onSuccess, onError }
      );
      return;
    }

    createClass.mutate(
      {
        course_id: course.id,
        name: name.trim(),
        year_id: yearId ? Number(yearId) : null,
        year: year.trim() ? Number(year) : null,
        schedule_details: schedule,
        is_pinned: isPinned,
      },
      { onSuccess, onError }
    );
  };

  const busy = createClass.isPending || duplicateClass.isPending;

  return (
    <Dialog open={!!course} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>إضافة شعبة إلى {course.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>اسم الشعبة</Label>
            <Input
              placeholder="مثال: شعبة أ"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>السنة الدراسية (الفوج)</Label>
            <YearPicker value={yearId} onChange={setYearId} />
          </div>

          <div className="space-y-2">
            <Label>السنة (رقم - اختياري)</Label>
            <Input
              type="number"
              placeholder="2027"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />
          </div>

          {existingClasses.length > 0 && (
            <div className="space-y-2">
              <Label>نسخ من شعبة موجودة (اختياري)</Label>
              <Select value={copyFromClassId || "none"} onValueChange={(v) => setCopyFromClassId(v === "none" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="البدء بشعبة فارغة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">البدء بشعبة فارغة</SelectItem>
                  {existingClasses.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                      {c.academic_year ? ` — ${c.academic_year.name}` : ""} ({c.students_count ?? 0} طالب)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">
                النسخ ينقل معلمي الشعبة ومواعيدها
              </p>
            </div>
          )}

          {copyFromClassId ? (
            <div className="flex items-center justify-end gap-2 rounded-md border p-3">
              <Label htmlFor="add-class-copy-students" className="cursor-pointer">
                نسخ أسماء الطلاب أيضاً
              </Label>
              <Checkbox
                id="add-class-copy-students"
                checked={copyStudents}
                onCheckedChange={(checked) => setCopyStudents(checked === true)}
              />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label>الأيام والأوقات</Label>
                <ScheduleEditor value={schedule} onChange={setSchedule} />
              </div>

              <div className="flex items-start justify-end gap-2 rounded-md border p-3">
                <div className="text-end">
                  <Label htmlFor="add-class-pinned" className="cursor-pointer">
                    شعبة ثابتة
                  </Label>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    تظهر في صفحة اليوم مهما كانت السنة المختارة
                  </p>
                </div>
                <Checkbox
                  id="add-class-pinned"
                  className="mt-1"
                  checked={isPinned}
                  onCheckedChange={(checked) => setIsPinned(checked === true)}
                />
              </div>
            </>
          )}

          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              إلغاء
            </Button>
            <Button onClick={handleSubmit} className="flex-1" disabled={busy || !name.trim()}>
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "حفظ"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Class management sheet – edit, assign / remove teachers & students
// ---------------------------------------------------------------------------

function ClassManageSheet({
  classId,
  open,
  onClose,
}: {
  classId: number | null;
  open: boolean;
  onClose: () => void;
}) {
  const { toast } = useToast();

  const { data: courseClass, isLoading: classLoading } = useClass(classId);

  const { data: allTeachersPage } = useTeachers();
  const { data: allStudentsData } = useAllStudents();
  const { data: coursesPage } = useCourses();
  const allTeachers = allTeachersPage?.data ?? [];
  const allCourses = coursesPage?.data ?? [];
  // Only show students in this course's category (or uncategorized)
  const categoryId = courseClass?.course?.category_id;
  const allStudents = (allStudentsData ?? []).filter((s) => {
    if (!categoryId) return true;
    return !s.category_id || s.category_id === categoryId;
  });

  const assignTeacher = useAssignTeacher();
  const removeTeacher = useRemoveTeacher();
  const assignStudent = useAssignStudent();
  const removeStudent = useRemoveStudent();
  const updateClass = useUpdateClass();
  const deleteClass = useDeleteClass();
  const archiveClass = useArchiveClass();
  const unarchiveClass = useUnarchiveClass();
  const duplicateClass = useDuplicateClassToYear();
  const createTeacherMutation = useCreateTeacher();
  const createStudentMutation = useCreateStudent();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const isArchived = !!courseClass?.archived_at;

  // Edit form state
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [courseId, setCourseId] = useState("");
  const [year, setYear] = useState("");
  const [yearId, setYearId] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [newTeacherName, setNewTeacherName] = useState("");
  const [scheduleDetails, setScheduleDetails] = useState<ScheduleItem[]>([]);

  // Duplicate dialog state
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [duplicateYearId, setDuplicateYearId] = useState("");
  const [duplicateYear, setDuplicateYear] = useState("");
  const [duplicateName, setDuplicateName] = useState("");
  const [duplicateCopyStudents, setDuplicateCopyStudents] = useState(false);

  // Sync edit form state when the class is loaded
  useEffect(() => {
    if (courseClass && !isEditing) {
      setName(courseClass.name);
      setCourseId(courseClass.course_id?.toString() || "");
      setYear(courseClass.year?.toString() || "");
      setYearId(courseClass.year_id?.toString() || "");
      setIsPinned(!!courseClass.is_pinned);
      setScheduleDetails(
        (courseClass.schedule_details || []).map((d: any) => ({
          day: d.day,
          from_time: d.from_time || d.time || "10:00",
          to_time: d.to_time || "12:00",
          note: d.note || "",
        }))
      );
    }
  }, [courseClass, isEditing]);

  // Local select values
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [studentComboOpen, setStudentComboOpen] = useState(false);
  const [createStudentDialogOpen, setCreateStudentDialogOpen] = useState(false);

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
    notes: "Active student",
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
      notes: "Active student",
    });
  };

  if (!open || !classId) return null;

  const handleCreateStudent = () => {
    if (!newStudentData.full_name.trim()) return;
    createStudentMutation.mutate(
      {
        ...newStudentData,
        date_of_birth: newStudentData.date_of_birth || undefined,
        category_id: categoryId ?? undefined,
      },
      {
        onSuccess: (student) => {
          toast({ title: "تمت الإضافة", description: "تم إنشاء الطالب بنجاح" });
          setCreateStudentDialogOpen(false);
          resetNewStudentForm();
          // Automatically assign
          assignStudent.mutate(
            { classId, studentId: student.id },
            {
              onSuccess: () =>
                toast({ title: "تم التسجيل", description: "تم تسجيل الطالب في الشعبة" }),
            }
          );
        },
        onError: (err: any) => {
          toast({
            title: "خطأ",
            description: err.response?.data?.message || "تعذّر انشاء الطالب",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleUpdate = () => {
    updateClass.mutate(
      {
        id: classId,
        data: {
          name,
          course_id: courseId ? parseInt(courseId) : undefined,
          year: year ? parseInt(year) : null,
          year_id: yearId ? parseInt(yearId) : null,
          is_pinned: isPinned,
          schedule_details: scheduleDetails,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "تم التحديث", description: "تم تحديث بيانات الشعبة بنجاح" });
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

  const openDuplicateDialog = () => {
    setDuplicateYearId("");
    setDuplicateYear(courseClass?.year ? String(courseClass.year + 1) : "");
    setDuplicateName("");
    setDuplicateCopyStudents(false);
    setDuplicateDialogOpen(true);
  };

  const handleDuplicateClass = () => {
    if (!duplicateYearId) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار السنة الجديدة",
        variant: "destructive",
      });
      return;
    }

    duplicateClass.mutate(
      {
        id: classId,
        data: {
          year_id: Number(duplicateYearId),
          year: duplicateYear.trim() ? Number(duplicateYear) : null,
          name: duplicateName.trim() || null,
          copy_students: duplicateCopyStudents,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "تم النسخ", description: "تم إنشاء الشعبة للسنة الجديدة" });
          setDuplicateDialogOpen(false);
          onClose();
        },
        onError: (err: any) => {
          toast({
            title: "خطأ",
            description: err.response?.data?.message || "تعذّر نسخ الشعبة",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleDelete = () => {
    if (!confirm("هل أنت متأكد من رغبتك في حذف هذه الشعبة؟ لا يمكن التراجع عن هذا الإجراء.")) return;

    deleteClass.mutate(classId, {
      onSuccess: () => {
        toast({ title: "تم الحذف", description: "تم حذف الشعبة بنجاح" });
        onClose();
      },
      onError: (err: any) => {
        toast({
          title: "خطأ",
          description: err.response?.data?.message || "تعذّر الحذف",
          variant: "destructive",
        });
      },
    });
  };

  const assignedTeacherIds = new Set((courseClass?.teachers ?? []).map((t) => t.id));
  const assignedStudentIds = new Set((courseClass?.students ?? []).map((s) => s.id));

  const availableTeachers = allTeachers.filter((t) => !assignedTeacherIds.has(t.id));
  const availableStudents = allStudents.filter((s) => !assignedStudentIds.has(s.id));

  const colorTag = toColorTag(courseClass?.course?.color);

  const handleAssignTeacher = () => {
    if (!selectedTeacherId) return;
    assignTeacher.mutate(
      { classId, teacherId: Number(selectedTeacherId) },
      {
        onSuccess: () => {
          toast({ title: "تم التعيين", description: "تم تعيين المعلم للشعبة" });
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

  const handleCreateAndAssignTeacher = async () => {
    if (!newTeacherName.trim()) return;
    try {
      const teacher = await createTeacherMutation.mutateAsync({
        name: newTeacherName.trim(),
      });
      await assignTeacher.mutateAsync({ classId, teacherId: teacher.id });
      setNewTeacherName("");
      toast({ title: "تم التعيين", description: "تم إنشاء المعلم وتعيينه للشعبة" });
    } catch (err: any) {
      toast({
        title: "خطأ",
        description: err.response?.data?.message || "تعذّر إنشاء المعلم",
        variant: "destructive",
      });
    }
  };

  const handleRemoveTeacher = (teacherId: number) => {
    removeTeacher.mutate(
      { classId, teacherId },
      {
        onSuccess: () =>
          toast({ title: "تمت الإزالة", description: "تمت إزالة المعلم من الشعبة" }),
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
      { classId, studentId: Number(selectedStudentId) },
      {
        onSuccess: () => {
          toast({ title: "تم التسجيل", description: "تم تسجيل الطالب في الشعبة" });
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
      { classId, studentId },
      {
        onSuccess: () =>
          toast({ title: "تمت الإزالة", description: "تمت إزالة الطالب من الشعبة" }),
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
      <SheetContent side="left" className="w-full sm:max-w-lg p-0 flex flex-col">
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
                <span className={`course-tag course-tag-${colorTag}`}>{colorTag}</span>
                <div className="text-end">
                  <span>{courseClass?.course?.title ?? "..."}</span>
                  <p className="text-xs font-normal text-muted-foreground">
                    {courseClass?.name}
                  </p>
                </div>
              </div>
            </div>
            {courseClass?.academic_year && !isEditing && (
              <p className="text-sm font-normal text-muted-foreground mt-1 text-end">
                {courseClass.academic_year.name}
              </p>
            )}
          </SheetTitle>
        </SheetHeader>

        {classLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {/* ---- Edit class form ---- */}
            {isEditing && (
              <div className="p-5 border-b bg-muted/20 space-y-4">
                <div className="space-y-2">
                  <Label>اسم الشعبة</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label>الدورة</Label>
                  <Select value={courseId} onValueChange={setCourseId}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الدورة" />
                    </SelectTrigger>
                    <SelectContent>
                      {allCourses.map((c) => (
                        <SelectItem key={c.id} value={c.id.toString()}>
                          {c.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-muted-foreground">
                    يمكن نقل الشعبة إلى دورة أخرى
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>السنة الدراسية (الفوج)</Label>
                  <YearPicker value={yearId} onChange={setYearId} />
                </div>

                <div className="space-y-2">
                  <Label>السنة (رقم - اختياري)</Label>
                  <Input type="number" value={year} onChange={(e) => setYear(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label>الأيام والأوقات</Label>
                  <ScheduleEditor value={scheduleDetails} onChange={setScheduleDetails} />
                </div>

                <div className="flex items-start justify-end gap-2 rounded-md border bg-card p-3">
                  <div className="text-end">
                    <Label htmlFor="edit-class-pinned" className="cursor-pointer">
                      شعبة ثابتة
                    </Label>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      تظهر في صفحة اليوم مهما كانت السنة المختارة
                    </p>
                  </div>
                  <Checkbox
                    id="edit-class-pinned"
                    className="mt-1"
                    checked={isPinned}
                    onCheckedChange={(checked) => setIsPinned(checked === true)}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleUpdate}
                    className="flex-1"
                    disabled={updateClass.isPending || !name.trim()}
                  >
                    {updateClass.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin ms-2" />
                    ) : null}
                    حفظ التعديلات
                  </Button>
                </div>
              </div>
            )}

            {/* ---- Teachers section ---- */}
            <div className="p-5 border-b text-end">
              <div className="flex items-center justify-end gap-2 mb-4">
                <Badge variant="secondary" className="text-xs">
                  {courseClass?.teachers?.length ?? 0}
                </Badge>
                <h3 className="font-semibold text-sm">المعلمون</h3>
                <Users className="w-4 h-4 text-primary" />
              </div>

              {(courseClass?.teachers ?? []).length > 0 ? (
                <div className="space-y-2 mb-4">
                  {courseClass!.teachers!.map((teacher) => (
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
                          <p className="text-xs text-muted-foreground">{teacher.user.email}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mb-4">
                  لا يوجد معلمون معيّنون لهذه الشعبة
                </p>
              )}

              {/* Add teacher */}
              <div className="space-y-3">
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
                    <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
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

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCreateAndAssignTeacher}
                    disabled={
                      !newTeacherName.trim() ||
                      createTeacherMutation.isPending ||
                      assignTeacher.isPending
                    }
                    className="gap-1.5 flex-shrink-0"
                  >
                    {createTeacherMutation.isPending || assignTeacher.isPending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                    إضافة
                  </Button>
                  <Input
                    placeholder="إضافة معلم بالاسم فقط..."
                    value={newTeacherName}
                    onChange={(e) => setNewTeacherName(e.target.value)}
                    className="flex-1 h-9"
                  />
                </div>
              </div>
            </div>

            {/* ---- Students section ---- */}
            <div className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm">الطلاب</h3>
                <Badge variant="secondary" className="text-xs">
                  {courseClass?.students?.length ?? 0}
                </Badge>
                {courseClass?.course?.category && (
                  <Badge variant="outline" className="text-xs">
                    {courseClass.course.category.name}
                  </Badge>
                )}
              </div>

              {categoryId && (
                <p className="text-xs text-muted-foreground mb-3 text-end">
                  يظهر الطلاب من تصنيف الدورة فقط
                </p>
              )}

              {(courseClass?.students ?? []).length > 0 ? (
                <div className="space-y-2 mb-4">
                  {courseClass!.students!.map((student) => (
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
                        <p className="text-sm font-medium">{student.full_name}</p>
                        {student.external_code && (
                          <p className="text-xs text-muted-foreground">{student.external_code}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mb-4">
                  لا يوجد طلاب مسجّلون في هذه الشعبة
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
                          ? availableStudents.find((s) => String(s.id) === selectedStudentId)
                            ?.full_name
                          : "اختر طالباً..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="بحث عن طالب..." />
                        <CommandList className="max-h-[250px] overflow-y-auto">
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
                          <CommandSeparator />
                          <CommandEmpty>لم يتم العثور على طالب.</CommandEmpty>
                          <CommandGroup>
                            {availableStudents.map((student) => (
                              <CommandItem
                                key={student.id}
                                value={student.full_name}
                                onSelect={() => {
                                  setSelectedStudentId(
                                    String(student.id) === selectedStudentId
                                      ? ""
                                      : String(student.id)
                                  );
                                  setStudentComboOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedStudentId === String(student.id)
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {student.full_name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {isAdmin && (
                <div className="flex flex-wrap justify-end gap-2 mt-8">
                  <Button
                    variant="outline"
                    onClick={openDuplicateDialog}
                    disabled={duplicateClass.isPending}
                    className="gap-2"
                  >
                    {duplicateClass.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    نسخ لسنة جديدة
                  </Button>
                  {isArchived ? (
                    <Button
                      variant="outline"
                      onClick={() => {
                        unarchiveClass.mutate(classId, {
                          onSuccess: () =>
                            toast({
                              title: "تمت الاستعادة",
                              description: "تم استعادة الشعبة بنجاح",
                            }),
                          onError: (err: any) =>
                            toast({
                              title: "خطأ",
                              description: err.response?.data?.message || "تعذّر الاستعادة",
                              variant: "destructive",
                            }),
                        });
                      }}
                      disabled={unarchiveClass.isPending}
                      className="gap-2"
                    >
                      {unarchiveClass.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <ArchiveRestore className="w-4 h-4" />
                      )}
                      استعادة الشعبة
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => {
                        archiveClass.mutate(classId, {
                          onSuccess: () => {
                            toast({ title: "تمت الأرشفة", description: "تم أرشفة الشعبة بنجاح" });
                            onClose();
                          },
                          onError: (err: any) =>
                            toast({
                              title: "خطأ",
                              description: err.response?.data?.message || "تعذّر الأرشفة",
                              variant: "destructive",
                            }),
                        });
                      }}
                      disabled={archiveClass.isPending}
                      className="gap-2 text-amber-600 border-amber-300 hover:bg-amber-50"
                    >
                      {archiveClass.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Archive className="w-4 h-4" />
                      )}
                      أرشفة الشعبة
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={deleteClass.isPending}
                    className="flex align-items-center gap-2"
                    title="حذف الشعبة"
                  >
                    {deleteClass.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" /> حذف الشعبة
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Duplicate class dialog */}
              <Dialog open={duplicateDialogOpen} onOpenChange={setDuplicateDialogOpen}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>نسخ الشعبة لسنة جديدة</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-2">
                    <p className="text-sm text-muted-foreground text-end">
                      تبقى الشعبة الجديدة ضمن دورة {courseClass?.course?.title}
                    </p>

                    <div className="space-y-2">
                      <Label>السنة الدراسية الجديدة</Label>
                      <YearPicker value={duplicateYearId} onChange={setDuplicateYearId} />
                    </div>

                    <div className="space-y-2">
                      <Label>اسم الشعبة الجديدة (اختياري)</Label>
                      <Input
                        placeholder={courseClass?.name}
                        value={duplicateName}
                        onChange={(e) => setDuplicateName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>السنة (رقم - اختياري)</Label>
                      <Input
                        type="number"
                        placeholder="2027"
                        value={duplicateYear}
                        onChange={(e) => setDuplicateYear(e.target.value)}
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 rounded-md border p-3">
                      <Label htmlFor="copy-class-students" className="cursor-pointer">
                        نسخ كل الطلاب
                      </Label>
                      <Checkbox
                        id="copy-class-students"
                        checked={duplicateCopyStudents}
                        onCheckedChange={(checked) => setDuplicateCopyStudents(checked === true)}
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        onClick={() => setDuplicateDialogOpen(false)}
                        className="flex-1"
                      >
                        إلغاء
                      </Button>
                      <Button
                        onClick={handleDuplicateClass}
                        className="flex-1"
                        disabled={duplicateClass.isPending || !duplicateYearId}
                      >
                        {duplicateClass.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "نسخ"
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Create student dialog */}
              <Dialog open={createStudentDialogOpen} onOpenChange={setCreateStudentDialogOpen}>
                <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>إضافة طالب جديد</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>
                          اسم الطالب <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          placeholder="الاسم الكامل"
                          value={newStudentData.full_name}
                          onChange={(e) =>
                            setNewStudentData({ ...newStudentData, full_name: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>رقم الهوية</Label>
                        <Input
                          placeholder="رقم الهوية"
                          value={newStudentData.identity_number}
                          onChange={(e) =>
                            setNewStudentData({
                              ...newStudentData,
                              identity_number: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>تاريخ الميلاد</Label>
                        <Input
                          type="date"
                          value={newStudentData.date_of_birth}
                          onChange={(e) =>
                            setNewStudentData({ ...newStudentData, date_of_birth: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>الصف</Label>
                        <Input
                          placeholder="مثال: الخامس أ"
                          value={newStudentData.grade_level}
                          onChange={(e) =>
                            setNewStudentData({ ...newStudentData, grade_level: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>المدرسة</Label>
                        <Input
                          placeholder="اسم المدرسة"
                          value={newStudentData.school_name}
                          onChange={(e) =>
                            setNewStudentData({ ...newStudentData, school_name: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>العنوان</Label>
                        <Input
                          placeholder="المدينة / الشارع"
                          value={newStudentData.address}
                          onChange={(e) =>
                            setNewStudentData({ ...newStudentData, address: e.target.value })
                          }
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
                            onChange={(e) =>
                              setNewStudentData({ ...newStudentData, mother_name: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>هاتف الأم</Label>
                          <Input
                            placeholder="05XXXXXXXX"
                            value={newStudentData.mother_phone}
                            onChange={(e) =>
                              setNewStudentData({ ...newStudentData, mother_phone: e.target.value })
                            }
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
                            onChange={(e) =>
                              setNewStudentData({ ...newStudentData, father_name: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>هاتف الأب</Label>
                          <Input
                            placeholder="05XXXXXXXX"
                            value={newStudentData.father_phone}
                            onChange={(e) =>
                              setNewStudentData({ ...newStudentData, father_phone: e.target.value })
                            }
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
                        onChange={(e) =>
                          setNewStudentData({ ...newStudentData, notes: e.target.value })
                        }
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
                        disabled={
                          createStudentMutation.isPending || !newStudentData.full_name.trim()
                        }
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
