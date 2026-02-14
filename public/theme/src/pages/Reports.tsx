import { useState } from "react";
import { courses, teachers, getCourseAttendanceStats } from "@/data/mockData";
import { BarChart3, Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Reports() {
  const [courseFilter, setCourseFilter] = useState("all");
  const [teacherFilter, setTeacherFilter] = useState("all");

  const filteredCourses = courses.filter((c) => {
    if (courseFilter !== "all" && c.id !== courseFilter) return false;
    if (teacherFilter !== "all" && !c.teacherIds.includes(teacherFilter)) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">التقارير</h1>
        <p className="page-subtitle">عرض وتصدير تقارير الحضور والغياب</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">تصفية:</span>
        </div>
        <Select value={courseFilter} onValueChange={setCourseFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="حسب الدورة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الدورات</SelectItem>
            {courses.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={teacherFilter} onValueChange={setTeacherFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="حسب المعلم" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع المعلمين</SelectItem>
            {teachers.map((t) => (
              <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" className="gap-1.5 ms-auto">
          <Download className="w-4 h-4" />
          تصدير
        </Button>
      </div>

      {/* Report cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCourses.map((course) => {
          const stats = getCourseAttendanceStats(course.id);
          const rate = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;
          return (
            <div key={course.id} className="stat-card animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <span className={`course-tag course-tag-${course.colorTag}`}>{course.time}</span>
                <h3 className="font-semibold">{course.name}</h3>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center mb-4">
                <div>
                  <p className="text-2xl font-bold text-success">{stats.present}</p>
                  <p className="text-xs text-muted-foreground">حاضر</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-destructive">{stats.absent}</p>
                  <p className="text-xs text-muted-foreground">غائب</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-warning">{stats.unmarked}</p>
                  <p className="text-xs text-muted-foreground">غير مسجّل</p>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-foreground">{rate}%</span>
                  <span className="text-muted-foreground">نسبة الحضور</span>
                </div>
                <Progress value={rate} className="h-2" />
              </div>
            </div>
          );
        })}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-16 bg-card rounded-2xl border">
          <BarChart3 className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">لا توجد تقارير</p>
          <p className="text-sm text-muted-foreground/70 mt-1">عدّل التصفية لعرض النتائج</p>
        </div>
      )}
    </div>
  );
}
