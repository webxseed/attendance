import { useState } from "react";
import { useTeachers, useCreateTeacher, useUpdateTeacher } from "@/hooks/useApi";
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
import { Users, Plus, Search, Mail, Phone, Loader2, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Teacher } from "@/lib/api";

export default function Teachers() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  // Form state
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // API
  const { data: teachersPage, isLoading } = useTeachers();
  const createMutation = useCreateTeacher();
  const updateMutation = useUpdateTeacher();
  const teachers = teachersPage?.data ?? [];

  const filtered = search
    ? teachers.filter(
      (t) =>
        (t.user?.name ?? "").includes(search) ||
        (t.user?.email ?? "").includes(search)
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
    setPhone(teacher.phone ?? "");
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingTeacher) {
      // Update
      if (!name.trim()) return;
      updateMutation.mutate(
        {
          id: editingTeacher.id,
          data: {
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim() || undefined,
          },
        },
        {
          onSuccess: () => {
            toast({
              title: "تم التحديث",
              description: "تم تحديث بيانات المعلم بنجاح",
            });
            resetForm();
            setDialogOpen(false);
          },
          onError: (err: any) => {
            toast({
              title: "خطأ",
              description:
                err.response?.data?.message || "تعذّر تحديث المعلم",
              variant: "destructive",
            });
          },
        }
      );
    } else {
      // Create
      if (!name.trim()) return;
      createMutation.mutate(
        {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
        },
        {
          onSuccess: () => {
            toast({
              title: "تمت الإضافة",
              description: "تمت إضافة المعلم بنجاح",
            });
            resetForm();
            setDialogOpen(false);
          },
          onError: (err: any) => {
            toast({
              title: "خطأ",
              description:
                err.response?.data?.message || "تعذّر إضافة المعلم",
              variant: "destructive",
            });
          },
        }
      );
    }
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
                <Label>الاسم الكامل</Label>
                <Input
                  placeholder="أدخل اسم المعلم"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>رقم الهاتف</Label>
                <Input
                  placeholder="05XXXXXXXX (اختياري)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((teacher) => (
            <div key={teacher.id} className="stat-card animate-fade-in relative group">
              <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleEdit(teacher)}
                >
                  <Pencil className="w-4 h-4 text-muted-foreground" />
                </Button>
              </div>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {teacher.phone && (
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      {teacher.phone}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold pe-8">
                  {teacher.user?.name ?? "—"}
                </h3>
              </div>
              <div className="space-y-1.5 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span>{teacher.user?.email ?? "—"}</span>
                  <Mail className="w-3.5 h-3.5" />
                </div>
                {teacher.phone && (
                  <div className="flex items-center gap-2">
                    <span>{teacher.phone}</span>
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-2 text-center py-12 text-muted-foreground bg-card rounded-xl border">
              <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p>لا يوجد معلمون</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
