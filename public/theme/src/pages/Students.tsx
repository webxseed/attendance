import { useState } from "react";
import { students as allStudents, getCoursesByIds } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { GraduationCap, Plus, Search } from "lucide-react";

export default function Students() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const filtered = search
    ? allStudents.filter((s) => s.name.includes(search))
    : allStudents;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">الطلاب</h1>
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
                <Input placeholder="أدخل اسم الطالب" />
              </div>
              <div className="space-y-2">
                <Label>المجموعة</Label>
                <Input placeholder="مثال: أ" />
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

      {/* Students table */}
      <div className="bg-card rounded-xl border overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-5 py-3 border-b bg-muted/30 text-xs font-semibold text-muted-foreground">
          <span className="text-start">الاسم</span>
          <span>المجموعة</span>
          <span>الدورات</span>
        </div>
        {filtered.map((student) => {
          const studentCourses = getCoursesByIds(student.courseIds);
          return (
            <div
              key={student.id}
              className="grid grid-cols-[1fr_auto_auto] gap-4 px-5 py-4 border-b last:border-b-0 hover:bg-muted/20 transition-colors items-center"
            >
              <p className="font-medium text-sm">{student.name}</p>
              <span className="text-sm bg-muted px-2.5 py-0.5 rounded-full text-muted-foreground">
                {student.group}
              </span>
              <div className="flex flex-wrap gap-1 justify-end">
                {studentCourses.map((c) => (
                  <span key={c.id} className={`course-tag course-tag-${c.colorTag} text-[10px]`}>
                    {c.name}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <GraduationCap className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p>لا يوجد طلاب</p>
          </div>
        )}
      </div>
    </div>
  );
}
