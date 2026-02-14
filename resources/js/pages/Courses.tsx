import { useState } from "react";
import { toColorTag } from "@/lib/api";
import { useCourses, useCreateCourse } from "@/hooks/useApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookOpen, Plus, Search, Users, GraduationCap, Loader2 } from "lucide-react";
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
  const { toast } = useToast();

  // Form state
  const [title, setTitle] = useState("");
  const [color, setColor] = useState("teal");
  const [description, setDescription] = useState("");

  // API
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
      { title: title.trim(), color, description: description.trim() || undefined },
      {
        onSuccess: () => {
          toast({ title: "تمت الإضافة", description: "تمت إضافة الدورة بنجاح" });
          resetForm();
          setDialogOpen(false);
        },
        onError: (err: any) => {
          toast({
            title: "خطأ",
            description: err.response?.data?.message || "تعذّر إضافة الدورة",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title ms-4">الدورات</h1>
        <p className="page-subtitle">إدارة الدورات والمواد الدراسية</p>
      </div>

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
              <div
                key={course.id}
                className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-4 border-b last:border-b-0 hover:bg-muted/20 transition-colors items-center"
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
                <span className={`course-tag course-tag-${colorTag} text-[10px]`}>
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
    </div>
  );
}
