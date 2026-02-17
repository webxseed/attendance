import { useState } from "react";
import { useStudents, useCreateStudent, useUpdateStudent } from "@/hooks/useApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { GraduationCap, Plus, Search, Loader2, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Student } from "@/lib/api";

export default function Students() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  // Form state
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [fullName, setFullName] = useState("");
  const [externalCode, setExternalCode] = useState("");
  const [notes, setNotes] = useState("");

  // New Fields
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [identityNumber, setIdentityNumber] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [address, setAddress] = useState("");
  const [motherName, setMotherName] = useState("");
  const [motherPhone, setMotherPhone] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [fatherPhone, setFatherPhone] = useState("");

  // API
  const { data: studentsPage, isLoading } = useStudents();
  const createMutation = useCreateStudent();
  const updateMutation = useUpdateStudent();
  const students = studentsPage?.data ?? [];

  const filtered = search
    ? students.filter((s) => s.full_name.includes(search))
    : students;

  const resetForm = () => {
    setEditingStudent(null);
    setFullName("");
    setExternalCode("");
    setNotes("");
    setDateOfBirth("");
    setIdentityNumber("");
    setGradeLevel("");
    setSchoolName("");
    setAddress("");
    setMotherName("");
    setMotherPhone("");
    setFatherName("");
    setFatherPhone("");
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFullName(student.full_name);
    setExternalCode(student.external_code || "");
    setNotes(student.notes || "");
    setDateOfBirth(student.date_of_birth || "");
    setIdentityNumber(student.identity_number || "");
    setGradeLevel(student.grade_level || "");
    setSchoolName(student.school_name || "");
    setAddress(student.address || "");
    setMotherName(student.mother_name || "");
    setMotherPhone(student.mother_phone || "");
    setFatherName(student.father_name || "");
    setFatherPhone(student.father_phone || "");
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!fullName.trim()) return;

    const data = {
      full_name: fullName.trim(),
      external_code: externalCode.trim() || undefined,
      notes: notes.trim() || undefined,
      date_of_birth: dateOfBirth || undefined,
      identity_number: identityNumber.trim() || undefined,
      grade_level: gradeLevel.trim() || undefined,
      school_name: schoolName.trim() || undefined,
      address: address.trim() || undefined,
      mother_name: motherName.trim() || undefined,
      mother_phone: motherPhone.trim() || undefined,
      father_name: fatherName.trim() || undefined,
      father_phone: fatherPhone.trim() || undefined,
    };

    if (editingStudent) {
      updateMutation.mutate(
        {
          id: editingStudent.id,
          data,
        },
        {
          onSuccess: () => {
            toast({
              title: "تم التحديث",
              description: "تم تحديث بيانات الطالب بنجاح",
            });
            resetForm();
            setDialogOpen(false);
          },
          onError: (err: any) => {
            toast({
              title: "خطأ",
              description: err.response?.data?.message || "تعذّر تحديث الطالب",
              variant: "destructive",
            });
          },
        }
      );
    } else {
      createMutation.mutate(
        data,
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
              description: err.response?.data?.message || "تعذّر إضافة الطالب",
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
        <h1 className="page-title ms-4">الطلاب</h1>
        <p className="page-subtitle">إدارة الطلاب وتسجيلهم في الدورات</p>
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
              إضافة طالب
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingStudent ? "تعديل بيانات الطالب" : "إضافة طالب جديد"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>اسم الطالب <span className="text-destructive">*</span></Label>
                  <Input
                    placeholder="الاسم الكامل"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>رقم الهوية</Label>
                  <Input
                    placeholder="رقم الهوية"
                    value={identityNumber}
                    onChange={(e) => setIdentityNumber(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>تاريخ الميلاد</Label>
                  <Input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>الرقم التعريفي (اختياري)</Label>
                  <Input
                    placeholder="Code"
                    value={externalCode}
                    onChange={(e) => setExternalCode(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>الصف</Label>
                  <Input
                    placeholder="مثال: الخامس أ"
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>المدرسة</Label>
                  <Input
                    placeholder="اسم المدرسة"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>العنوان</Label>
                <Input
                  placeholder="المدينة / الشارع / رقم البيت"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div className="border-t pt-2 mt-2">
                <h3 className="font-semibold text-sm mb-3">بيانات الوالدين</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div className="space-y-2">
                    <Label>اسم الأم</Label>
                    <Input
                      placeholder="اسم الأم"
                      value={motherName}
                      onChange={(e) => setMotherName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>هاتف الأم</Label>
                    <Input
                      placeholder="05XXXXXXXX"
                      value={motherPhone}
                      onChange={(e) => setMotherPhone(e.target.value)}
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>اسم الأب</Label>
                    <Input
                      placeholder="اسم الأب"
                      value={fatherName}
                      onChange={(e) => setFatherName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>هاتف الأب</Label>
                    <Input
                      placeholder="05XXXXXXXX"
                      value={fatherPhone}
                      onChange={(e) => setFatherPhone(e.target.value)}
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>ملاحظات</Label>
                <Textarea
                  placeholder="ملاحظات إضافية ..."
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
                  onClick={handleSubmit}
                  className="flex-1"
                  disabled={
                    (editingStudent ? updateMutation.isPending : createMutation.isPending) ||
                    !fullName.trim()
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

      {/* Students table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="bg-card rounded-xl border overflow-hidden">
          <div className="grid grid-cols-[auto_1fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b bg-muted/30 text-xs font-semibold text-muted-foreground">
            <span className="w-8"></span>
            <span className="text-start">الاسم</span>
            <span>المدرسة / الصف</span>
            <span>الهوية</span>
            <span>ملاحظات</span>
          </div>
          {filtered.map((student) => (
            <div
              key={student.id}
              className="grid grid-cols-[auto_1fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b last:border-b-0 hover:bg-muted/20 transition-colors items-center"
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground"
                onClick={() => handleEdit(student)}
              >
                <Pencil className="w-3.5 h-3.5" />
              </Button>

              <div className="flex flex-col">
                <span className="font-medium text-sm">{student.full_name}</span>
                {student.external_code && <span className="text-xs text-muted-foreground">#{student.external_code}</span>}
              </div>

              <div className="flex flex-col text-sm text-muted-foreground">
                <span>{student.school_name || "—"}</span>
                {student.grade_level && <span className="text-xs">{student.grade_level}</span>}
              </div>

              <span className="text-sm text-muted-foreground">
                {student.identity_number || "—"}
              </span>

              <span className="text-sm text-muted-foreground truncate max-w-[150px]">
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
