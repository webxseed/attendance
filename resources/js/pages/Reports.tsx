import { useState } from "react";
import { fmtDate } from "@/lib/api";
import { useDailyOverview, useCourses, useAttendanceSession } from "@/hooks/useApi";
import { BarChart3, Download, Filter, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const statusConfig: Record<string, { label: string; className: string }> = {
  present: { label: "حاضر", className: "bg-success/10 text-success border-success/30" },
  absent:  { label: "غائب", className: "bg-destructive/10 text-destructive border-destructive/30" },
  late:    { label: "متأخر", className: "bg-amber-100 text-amber-700 border-amber-300" },
  excused: { label: "معذور", className: "bg-blue-100 text-blue-700 border-blue-300" },
};

export default function Reports() {
  const today = fmtDate(new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const [courseFilter, setCourseFilter] = useState("all");
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [selectedCourseTitle, setSelectedCourseTitle] = useState("");

  // Fetch data
  const { data: overview, isLoading } = useDailyOverview(selectedDate);
  const { data: coursesPage } = useCourses();
  const courses = coursesPage?.data ?? [];

  // Attendance session for the selected course (lazy – only fetches when courseId is set)
  const { data: session, isLoading: sessionLoading } = useAttendanceSession(
    selectedCourseId,
    selectedDate
  );

  // Apply filter
  const filteredOverview = (overview ?? []).filter((item) => {
    if (courseFilter !== "all" && String(item.course_id) !== courseFilter)
      return false;
    return true;
  });

  const handleCourseClick = (courseId: number, courseTitle: string) => {
    setSelectedCourseId(courseId);
    setSelectedCourseTitle(courseTitle);
  };

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
              <button
                key={item.course_id}
                className="stat-card animate-fade-in text-start hover:border-primary/40 hover:ring-1 hover:ring-primary/20 transition-all cursor-pointer"
                onClick={() => handleCourseClick(item.course_id, item.course_title)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="w-3.5 h-3.5" />
                    <span>عرض الطلاب</span>
                  </div>
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
                  <div>
                    <p className="text-2xl font-bold text-muted-foreground">
                      {item.not_marked_count}
                    </p>
                    <p className="text-xs text-muted-foreground">غير محدد</p>
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
              </button>
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

      {/* Student attendance modal */}
      <Dialog
        open={selectedCourseId !== null}
        onOpenChange={(open) => { if (!open) setSelectedCourseId(null); }}
      >
        <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-end">
              <span className="text-sm font-normal text-muted-foreground ms-2">{selectedDate}</span>
              {selectedCourseTitle}
            </DialogTitle>
          </DialogHeader>

          {sessionLoading ? (
            <div className="flex-1 flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : !session || session.records.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">لا توجد سجلات لهذا اليوم</p>
            </div>
          ) : (
            <div className="overflow-y-auto flex-1">
              {/* Summary chips */}
              <div className="flex gap-2 flex-wrap mb-4 pb-4 border-b">
                {(["present", "absent", "late", "excused"] as const).map((status) => {
                  const count = session.records.filter((r) => r.status === status).length;
                  if (count === 0) return null;
                  const cfg = statusConfig[status];
                  return (
                    <Badge key={status} variant="outline" className={`text-xs ${cfg.className}`}>
                      {cfg.label}: {count}
                    </Badge>
                  );
                })}
                {(() => {
                  const unmarked = session.records.filter((r) => !r.status).length;
                  return unmarked > 0 ? (
                    <Badge variant="outline" className="text-xs text-muted-foreground">
                      غير محدد: {unmarked}
                    </Badge>
                  ) : null;
                })()}
              </div>

              {/* Student list */}
              <div className="space-y-2">
                {session.records.map((record) => {
                  const cfg = record.status ? statusConfig[record.status] : null;
                  return (
                    <div
                      key={record.id}
                      className="flex items-center justify-between rounded-lg px-3 py-2.5 bg-muted/40"
                    >
                      <Badge
                        variant="outline"
                        className={`text-xs ${cfg ? cfg.className : "text-muted-foreground"}`}
                      >
                        {cfg ? cfg.label : "غير محدد"}
                      </Badge>
                      <div className="text-end">
                        <p className="text-sm font-medium">
                          {record.student?.full_name ?? `طالب #${record.student_id}`}
                        </p>
                        {record.note && (
                          <p className="text-xs text-muted-foreground">{record.note}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
