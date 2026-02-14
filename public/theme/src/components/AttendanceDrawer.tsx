import { useState, useMemo } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Course, getStudentsByIds, getAttendanceForCourse, AttendanceStatus } from "@/data/mockData";
import { CheckCircle2, Save, RotateCcw, CheckCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AttendanceDrawerProps {
  course: Course | null;
  open: boolean;
  onClose: () => void;
}

interface StudentAttendance {
  studentId: string;
  name: string;
  status: AttendanceStatus;
  note: string;
}

export default function AttendanceDrawer({ course, open, onClose }: AttendanceDrawerProps) {
  const { toast } = useToast();
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const initialAttendance = useMemo(() => {
    if (!course) return [];
    const students = getStudentsByIds(course.studentIds);
    const records = getAttendanceForCourse(course.id);
    return students.map((s) => {
      const record = records.find((r) => r.studentId === s.id);
      return {
        studentId: s.id,
        name: s.name,
        status: record?.status || ("unmarked" as AttendanceStatus),
        note: record?.note || "",
      };
    });
  }, [course]);

  const [attendance, setAttendance] = useState<StudentAttendance[]>(initialAttendance);

  // Reset when course changes
  useMemo(() => {
    setAttendance(initialAttendance);
    setLastSaved(null);
  }, [initialAttendance]);

  const markedCount = attendance.filter((a) => a.status !== "unmarked").length;
  const presentCount = attendance.filter((a) => a.status === "present").length;
  const completionPct = attendance.length > 0 ? Math.round((markedCount / attendance.length) * 100) : 0;

  const toggleStudent = (studentId: string) => {
    setAttendance((prev) =>
      prev.map((a) =>
        a.studentId === studentId
          ? { ...a, status: a.status === "present" ? "absent" : "present" }
          : a
      )
    );
  };

  const updateNote = (studentId: string, note: string) => {
    setAttendance((prev) =>
      prev.map((a) => (a.studentId === studentId ? { ...a, note } : a))
    );
  };

  const markAllPresent = () => {
    setAttendance((prev) => prev.map((a) => ({ ...a, status: "present" as AttendanceStatus })));
  };

  const clearAll = () => {
    setAttendance((prev) => prev.map((a) => ({ ...a, status: "unmarked" as AttendanceStatus, note: "" })));
  };

  const handleSave = () => {
    const now = new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" });
    setLastSaved(now);
    toast({
      title: "تم الحفظ بنجاح",
      description: `تم حفظ حضور ${course?.name} - ${presentCount} حاضر من ${attendance.length}`,
    });
  };

  if (!course) return null;

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="left" className="w-full sm:max-w-lg p-0 flex flex-col">
        <SheetHeader className="p-5 pb-4 border-b">
          <SheetTitle className="text-start">
            <div className="flex items-center justify-between">
              <span className={`course-tag course-tag-${course.colorTag}`}>{course.time}</span>
              <span>{course.name}</span>
            </div>
          </SheetTitle>
          {/* Progress */}
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{completionPct}%</span>
              <span className="text-muted-foreground">
                {markedCount}/{attendance.length} مسجّل
              </span>
            </div>
            <Progress value={completionPct} className="h-2" />
          </div>
        </SheetHeader>

        {/* Bulk actions */}
        <div className="flex items-center gap-2 px-5 py-3 border-b bg-muted/30">
          <Button variant="outline" size="sm" onClick={markAllPresent} className="gap-1.5 text-xs">
            <CheckCheck className="w-3.5 h-3.5" />
            تحديد الكل حاضر
          </Button>
          <Button variant="ghost" size="sm" onClick={clearAll} className="gap-1.5 text-xs text-muted-foreground">
            <RotateCcw className="w-3.5 h-3.5" />
            مسح الكل
          </Button>
        </div>

        {/* Student list */}
        <div className="flex-1 overflow-y-auto">
          {attendance.map((student, i) => (
            <div
              key={student.studentId}
              className="flex items-center gap-3 px-5 py-3 border-b last:border-b-0 hover:bg-muted/30 transition-colors"
            >
              <Checkbox
                checked={student.status === "present"}
                onCheckedChange={() => toggleStudent(student.studentId)}
                className="w-5 h-5"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {student.status === "present" && (
                      <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                    )}
                    {student.status === "absent" && (
                      <span className="w-4 h-4 rounded-full border-2 border-destructive flex-shrink-0" />
                    )}
                    {student.status === "unmarked" && (
                      <span className="w-4 h-4 rounded-full border-2 border-muted-foreground/30 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm font-medium text-foreground">{student.name}</p>
                </div>
                <Input
                  value={student.note}
                  onChange={(e) => updateNote(student.studentId, e.target.value)}
                  placeholder="ملاحظة..."
                  className="mt-1.5 h-7 text-xs bg-transparent border-dashed"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Sticky save bar */}
        <div className="p-4 border-t bg-card shadow-[0_-4px_12px_-4px_rgba(0,0,0,0.05)]">
          {lastSaved && (
            <p className="text-xs text-muted-foreground mb-2 text-center">
              آخر حفظ: {lastSaved}
            </p>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              إلغاء
            </Button>
            <Button onClick={handleSave} className="flex-1 gap-2">
              <Save className="w-4 h-4" />
              حفظ التغييرات
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
