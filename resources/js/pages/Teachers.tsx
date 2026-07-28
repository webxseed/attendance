import { useState } from "react";
import {
  useTeachers,
  useCreateTeacher,
  useUpdateTeacher,
  useDeleteTeacher,
} from "@/hooks/useApi";
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
  GraduationCap,
  Plus,
  Search,
  Mail,
  Phone,
  Loader2,
  Pencil,
  Trash2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Teacher } from "@/lib/api";

export default function Teachers() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const { data: teachersPage, isLoading } = useTeachers();
  const createMutation = useCreateTeacher();
  const updateMutation = useUpdateTeacher();
  const deleteMutation = useDeleteTeacher();
  const teachers = teachersPage?.data ?? [];

  const filtered = search
    ? teachers.filter(
        (t) =>
          (t.user?.name ?? "").includes(search) ||
          (t.user?.email ?? "").includes(search) ||
          (t.phone ?? t.user?.phone ?? "").includes(search)
      )
    : teachers;

  const resetForm = () => {
    setEditingTeacher(null);
    setName("");
    setEmail("");
    setPhone("");
  };

  const handleEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setName(teacher.user?.name ?? "");
    setEmail(teacher.user?.email ?? "");
    setPhone(teacher.phone ?? teacher.user?.phone ?? "");
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!name.trim()) return;

    if (editingTeacher) {
      updateMutation.mutate(
        {
          id: editingTeacher.id,
          data: {
            name: name.trim(),
            email: email.trim() || null,
            phone: phone.trim() || null,
          },
        },
        {
          onSuccess: () => {
            toast({ title: "تم التحديث", description: "تم تحديث بيانات المعلم بنجاح" });
            resetForm();
            setDialogOpen(false);
          },
          onError: (err: any) => {
            toast({
              title: "خطأ",
              description: err.response?.data?.message || "تعذّر تحديث المعلم",
              variant: "destructive",
            });
          },
        }
      );
    } else {
      createMutation.mutate(
        {
          name: name.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
        },
        {
          onSuccess: () => {
            toast({ title: "تمت الإضافة", description: "تمت إضافة المعلم بنجاح" });
            resetForm();
            setDialogOpen(false);
          },
          onError: (err: any) => {
            toast({
              title: "خطأ",
              description: err.response?.data?.message || "تعذّر إضافة المعلم",
              variant: "destructive",
            });
          },
        }
      );
    }
  };

  const handleDelete = (teacher: Teacher) => {
    if (!confirm(`هل تريد حذف المعلم "${teacher.user?.name}"؟`)) return;
    deleteMutation.mutate(teacher.id, {
      onSuccess: () => toast({ title: "تم الحذف", description: "تم حذف المعلم بنجاح" }),
      onError: (err: any) =>
        toast({
          title: "خطأ",
          description: err.response?.data?.message || "تعذّر الحذف",
          variant: "destructive",
        }),
    });
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">المعلمون</h1>
        <p className="page-subtitle">إدارة المعلمين وتعيينهم للدورات</p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            if (!open) resetForm();
            setDialogOpen(open);
          }}
        >
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              إضافة معلم
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingTeacher ? "تعديل بيانات المعلم" : "إضافة معلم جديد"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>
                  الاسم الكامل <span className="text-destructive">*</span>
                </Label>
                <Input
                  placeholder="اسم المعلم"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>رقم الهاتف (اختياري)</Label>
                <Input
                  placeholder="يُنشأ تلقائياً إن تُرك فارغاً"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  dir="ltr"
                  className="text-right"
                />
              </div>

              <div className="space-y-2">
                <Label>البريد الإلكتروني (اختياري)</Label>
                <Input
                  placeholder="يُنشأ تلقائياً إن تُرك فارغاً"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  dir="ltr"
                  className="text-right"
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
                  onClick={handleSubmit}
                  className="flex-1"
                  disabled={
                    (editingTeacher ? updateMutation.isPending : createMutation.isPending) ||
                    !name.trim()
                  }
                >
                  {createMutation.isPending || updateMutation.isPending ? (
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

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((teacher) => (
            <div
              key={teacher.id}
              className="stat-card animate-fade-in relative group flex flex-col"
            >
              <div className="absolute top-3 left-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleEdit(teacher)}
                >
                  <Pencil className="w-4 h-4 text-muted-foreground" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleDelete(teacher)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-secondary text-secondary-foreground">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">{teacher.user?.name ?? `معلم #${teacher.id}`}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    معلم
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-sm text-muted-foreground mt-auto">
                {(teacher.phone || teacher.user?.phone) && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5" />
                    <span dir="ltr">{teacher.phone || teacher.user?.phone}</span>
                  </div>
                )}
                {teacher.user?.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5" />
                    <span>{teacher.user.email}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground bg-card rounded-xl border">
              <GraduationCap className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p>لا يوجد معلمون</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
