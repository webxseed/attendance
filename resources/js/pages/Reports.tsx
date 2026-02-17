import { useState } from "react";
import { fmtDate } from "@/lib/api";
import { useDailyOverview, useCourses } from "@/hooks/useApi";
import { BarChart3, Download, Filter, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Reports() {
  const today = fmtDate(new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const [courseFilter, setCourseFilter] = useState("all");

  // Fetch data
  const { data: overview, isLoading } = useDailyOverview(selectedDate);
  const { data: coursesPage } = useCourses();
  const courses = coursesPage?.data ?? [];

  // Apply filter
  const filteredOverview = (overview ?? []).filter((item) => {
    if (courseFilter !== "all" && String(item.course_id) !== courseFilter)
      return false;
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
          <span className="text-sm font-medium text-muted-foreground">
            تصفية:
          </span>
        </div>

        {/* Date picker */}
        <Input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-44"
        />

        {/* Course filter */}
        <Select value={courseFilter} onValueChange={setCourseFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="حسب الدورة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الدورات</SelectItem>
            {courses.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm" className="gap-1.5 ms-auto">
          <Download className="w-4 h-4" />
          تصدير
        </Button>
      </div>

      {/* Report cards */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredOverview.map((item) => {
            const rate =
              item.total_students > 0
                ? Math.round(
                  (item.present_count / item.total_students) * 100
                )
                : 0;
            return (
              <div key={item.course_id} className="stat-card animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-muted-foreground">
                    {selectedDate}
                  </span>
                  <h3 className="font-semibold">{item.course_title}</h3>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center mb-4">
                  <div>
                    <p className="text-2xl font-bold text-success">
                      {item.present_count}
                    </p>
                    <p className="text-xs text-muted-foreground">عدد الحضور</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-destructive">
                      {item.absent_count}
                    </p>
                    <p className="text-xs text-muted-foreground">عدد الغياب</p>
                  </div>

                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-foreground">
                      {rate}%
                    </span>
                    <span className="text-muted-foreground">نسبة الحضور</span>
                  </div>
                  <Progress value={rate} className="h-2" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!isLoading && filteredOverview.length === 0 && (
        <div className="text-center py-16 bg-card rounded-2xl border">
          <BarChart3 className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">لا توجد تقارير</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            عدّل التصفية لعرض النتائج
          </p>
        </div>
      )}
    </div>
  );
}
