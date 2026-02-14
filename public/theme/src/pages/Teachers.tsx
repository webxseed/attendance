import { useState } from "react";
import { teachers as allTeachers, getCoursesByIds } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Plus, Search, Mail, Phone } from "lucide-react";

export default function Teachers() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const filtered = search
    ? allTeachers.filter((t) => t.name.includes(search) || t.email.includes(search))
    : allTeachers;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">المعلمون</h1>
        <p className="page-subtitle">إدارة المعلمين وتعيينهم للدورات</p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              إضافة معلم
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>إضافة معلم جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>الاسم الكامل</Label>
                <Input placeholder="أدخل اسم المعلم" />
              </div>
              <div className="space-y-2">
                <Label>البريد الإلكتروني</Label>
                <Input type="email" placeholder="example@mowal.edu" />
              </div>
              <div className="space-y-2">
                <Label>رقم الهاتف</Label>
                <Input placeholder="05XXXXXXXX" />
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">إلغاء</Button>
                <Button onClick={() => setDialogOpen(false)} className="flex-1">حفظ</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <div className="relative w-full sm:w-auto">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="بحث..." value={search} onChange={(e) => setSearch(e.target.value)} className="ps-9 w-full sm:w-56" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((teacher) => {
          const teacherCourses = getCoursesByIds(teacher.courseIds);
          return (
            <div key={teacher.id} className="stat-card animate-fade-in">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {teacherCourses.map((c) => (
                    <span key={c.id} className={`course-tag course-tag-${c.colorTag}`}>{c.name}</span>
                  ))}
                </div>
                <h3 className="font-semibold">{teacher.name}</h3>
              </div>
              <div className="space-y-1.5 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span>{teacher.email}</span>
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <div className="flex items-center gap-2">
                  <span>{teacher.phone}</span>
                  <Phone className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-2 text-center py-12 text-muted-foreground bg-card rounded-xl border">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p>لا يوجد معلمون</p>
          </div>
        )}
      </div>
    </div>
  );
}
