import { useMemo, useState } from "react";
import type { AttendanceRecord } from "@/lib/api";
import { fmtDate } from "@/lib/api";
import { useReportGenerate, useCourses, useAllStudents } from "@/hooks/useApi";
import { BarChart3, Download, Filter, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const statusConfig: Record<string, { label: string; className: string }> = {
  present: { label: "حاضر", className: "bg-success/10 text-success border-success/30" },
  absent:  { label: "غائب", className: "bg-destructive/10 text-destructive border-destructive/30" },
  late:    { label: "متأخر", className: "bg-amber-100 text-amber-700 border-amber-300" },
  excused: { label: "معذور", className: "bg-blue-100 text-blue-700 border-blue-300" },
};

function recordSortKey(r: AttendanceRecord): string {
  const d = r.session?.date?.slice(0, 10) ?? "";
  const course = r.session?.course?.title ?? "";
  const name = r.student?.full_name ?? "";
  return `${d}\t${course}\t${name}`;
}

export default function Reports() {
  const today = fmtDate(new Date());
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [courseFilter, setCourseFilter] = useState("all");
  const [studentFilter, setStudentFilter] = useState("all");
  const [dateOrder, setDateOrder] = useState<"desc" | "asc">("desc");

  const reportParams = useMemo(() => {
    const p: {
      from_date: string;
      to_date: string;
      course_id?: number;
      student_id?: number;
    } = { from_date: fromDate, to_date: toDate };
    if (courseFilter !== "all") p.course_id = Number(courseFilter);
    if (studentFilter !== "all") p.student_id = Number(studentFilter);
    return p;
  }, [fromDate, toDate, courseFilter, studentFilter]);

  const { data: report, isLoading } = useReportGenerate(reportParams);
  const { data: coursesPage } = useCourses();
  const courses = coursesPage?.data ?? [];
  const { data: students = [] } = useAllStudents(false);

  const sortedRecords = useMemo(() => {
    const list = [...(report?.records ?? [])];
    const mult = dateOrder === "desc" ? -1 : 1;
    list.sort((a, b) => mult * recordSortKey(a).localeCompare(recordSortKey(b)));
    return list;
  }, [report?.records, dateOrder]);

  const summary = report?.summary;

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

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">من</span>
          <Input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-40"
          />
          <span className="text-sm text-muted-foreground">إلى</span>
          <Input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-40"
          />
        </div>

        <Select value={courseFilter} onValueChange={setCourseFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="الدورة" />
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

        <Select value={studentFilter} onValueChange={setStudentFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="الطالب" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الطلاب</SelectItem>
            {students.map((s) => (
              <SelectItem key={s.id} value={String(s.id)}>
                {s.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={dateOrder} onValueChange={(v) => setDateOrder(v as "desc" | "asc")}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="ترتيب التاريخ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">التاريخ: الأحدث أولاً</SelectItem>
            <SelectItem value="asc">التاريخ: الأقدم أولاً</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm" className="gap-1.5 ms-auto">
          <Download className="w-4 h-4" />
          تصدير
        </Button>
      </div>

      {fromDate > toDate && (
        <p className="text-sm text-destructive">
          تاريخ البداية يجب أن يكون قبل أو يساوي تاريخ النهاية.
        </p>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : summary ? (
        <>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs">
              إجمالي السجلات: {summary.total_records_found}
            </Badge>
            <Badge variant="outline" className={`text-xs ${statusConfig.present.className}`}>
              حاضر: {summary.present}
            </Badge>
            <Badge variant="outline" className={`text-xs ${statusConfig.absent.className}`}>
              غائب: {summary.absent}
            </Badge>
            <Badge variant="outline" className={`text-xs ${statusConfig.late.className}`}>
              متأخر: {summary.late}
            </Badge>
            <Badge variant="outline" className={`text-xs ${statusConfig.excused.className}`}>
              معذور: {summary.excused}
            </Badge>
            <Badge variant="outline" className="text-xs text-muted-foreground">
              نسبة الحضور: {summary.attendance_rate}
            </Badge>
          </div>

          {sortedRecords.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-2xl border">
              <BarChart3 className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">لا توجد سجلات</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                جرّب توسيع الفترة أو تغيير التصفية
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40 text-muted-foreground">
                      <th className="text-end py-3 px-4 font-medium">التاريخ</th>
                      <th className="text-end py-3 px-4 font-medium">الدورة</th>
                      <th className="text-end py-3 px-4 font-medium">الطالب</th>
                      <th className="text-end py-3 px-4 font-medium">الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedRecords.map((record) => {
                      const cfg = record.status ? statusConfig[record.status] : null;
                      const dateStr = record.session?.date?.slice(0, 10) ?? "—";
                      const courseTitle = record.session?.course?.title ?? "—";
                      return (
                        <tr key={record.id} className="border-b border-border/60 last:border-0">
                          <td className="py-2.5 px-4 tabular-nums">{dateStr}</td>
                          <td className="py-2.5 px-4">{courseTitle}</td>
                          <td className="py-2.5 px-4 font-medium">
                            {record.student?.full_name ?? `طالب #${record.student_id}`}
                          </td>
                          <td className="py-2.5 px-4">
                            <Badge
                              variant="outline"
                              className={`text-xs ${cfg ? cfg.className : "text-muted-foreground"}`}
                            >
                              {cfg ? cfg.label : "غير محدد"}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
