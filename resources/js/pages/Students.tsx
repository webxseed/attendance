import { useState } from "react";
import { useStudents, useCreateStudent } from "@/hooks/useApi";
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
import { GraduationCap, Plus, Search, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Students() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  // Form state
  const [fullName, setFullName] = useState("");
  const [externalCode, setExternalCode] = useState("");
  const [notes, setNotes] = useState("");

  // API
  const { data: studentsPage, isLoading } = useStudents();
  const createMutation = useCreateStudent();
  const students = studentsPage?.data ?? [];

  const filtered = search
    ? students.filter((s) => s.full_name.includes(search))
    : students;

  const resetForm = () => {
    setFullName("");
    setExternalCode("");
    setNotes("");
  };

  const handleCreate = () => {
    if (!fullName.trim()) return;
    createMutation.mutate(
      {
        full_name: fullName.trim(),
        external_code: externalCode.trim() || undefined,
        notes: notes.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast({
            title: "تمت الإضافة",
            description: "تمت إضافة الطالب بنجاح",
          });
          resetForm();
          setDialogOpen(false);
        },
        onError: (err: any) => {
          toast({
            title: "خطأ",
            description:
              err.response?.data?.message || "تعذّر إضافة الطالب",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title ms-4">الطلاب</h1>
        <p className="page-subtitle">إدارة الطلاب وتسجيلهم في الدورات</p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              إضافة طالب
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>إضافة طالب جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>اسم الطالب</Label>
                <Input
                  placeholder="أدخل اسم الطالب الكامل"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>الرقم التعريفي</Label>
                <Input
                  placeholder="رقم تعريفي (اختياري)"
                  value={externalCode}
                  onChange={(e) => setExternalCode(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>ملاحظات</Label>
                <Input
                  placeholder="ملاحظات إضافية (اختياري)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
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
                  disabled={createMutation.isPending || !fullName.trim()}
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

      {/* Students table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="bg-card rounded-xl border overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-5 py-3 border-b bg-muted/30 text-xs font-semibold text-muted-foreground">
            <span className="text-start">الاسم</span>
            <span>الرقم التعريفي</span>
            <span>ملاحظات</span>
          </div>
          {filtered.map((student) => (
            <div
              key={student.id}
              className="grid grid-cols-[1fr_auto_auto] gap-4 px-5 py-4 border-b last:border-b-0 hover:bg-muted/20 transition-colors items-center"
            >
              <p className="font-medium text-sm">{student.full_name}</p>
              <span className="text-sm bg-muted px-2.5 py-0.5 rounded-full text-muted-foreground">
                {student.external_code || "—"}
              </span>
              <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                {student.notes || "—"}
              </span>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <GraduationCap className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p>لا يوجد طلاب</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
