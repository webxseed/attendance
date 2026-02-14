import { useState } from "react";
import { courses as allCourses, teachers, students, Course } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BookOpen, Plus, Search, Users, GraduationCap, Pencil } from "lucide-react";

export default function Courses() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const filtered = search
    ? allCourses.filter((c) => c.name.includes(search))
    : allCourses;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">الدورات</h1>
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
                <Input placeholder="مثال: تجويد القرآن" />
              </div>
              <div className="space-y-2">
                <Label>الأيام</Label>
                <div className="flex flex-wrap gap-2">
                  {["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس"].map((day) => (
                    <button
                      key={day}
                      className="px-3 py-1.5 text-xs rounded-full border hover:bg-accent transition-colors"
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>الوقت</Label>
                <Input type="time" />
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">
                  إلغاء
                </Button>
                <Button onClick={() => setDialogOpen(false)} className="flex-1">
                  حفظ
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
      <div className="bg-card rounded-xl border overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-3 border-b bg-muted/30 text-xs font-semibold text-muted-foreground">
          <span className="text-start">اسم الدورة</span>
          <span>الأيام</span>
          <span>المعلمون</span>
          <span>الطلاب</span>
        </div>
        {filtered.map((course) => (
          <div
            key={course.id}
            className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-4 border-b last:border-b-0 hover:bg-muted/20 transition-colors items-center"
          >
            <div className="flex items-center gap-3">
              <div className={`w-2 h-8 rounded-full course-tag-${course.colorTag}`} style={{ minWidth: 8 }} />
              <div>
                <p className="font-medium text-sm">{course.name}</p>
                <p className="text-xs text-muted-foreground">{course.time}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1 justify-end">
              {course.days.map((d) => (
                <span key={d} className="text-xs bg-muted px-2 py-0.5 rounded-full">{d}</span>
              ))}
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="w-3.5 h-3.5" />
              <span>{course.teacherIds.length}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>{course.studentIds.length}</span>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p>لا توجد دورات</p>
          </div>
        )}
      </div>
    </div>
  );
}
