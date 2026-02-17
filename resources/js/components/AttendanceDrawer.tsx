import { useState, useMemo, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Course, toColorTag } from "@/lib/api";
import { useAttendanceSession, useSaveAttendance } from "@/hooks/useApi";
import { CheckCircle2, Save, RotateCcw, CheckCheck, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type UiStatus = "present" | "absent" | "unmarked";

interface AttendanceDrawerProps {
  course: Course | null;
  date: string; // YYYY-MM-DD
  open: boolean;
  onClose: () => void;
}

interface StudentAttendance {
  studentId: number;
  name: string;
  status: UiStatus;
  note: string;
}

export default function AttendanceDrawer({
  course,
  date,
  open,
  onClose,
}: AttendanceDrawerProps) {
  const { toast } = useToast();

  // Fetch the attendance session from the API
  const { data: session, isLoading } = useAttendanceSession(
    open && course ? course.id : null,
    date
  );

  const saveMutation = useSaveAttendance();

  const [sessionNote, setSessionNote] = useState("");

  // Build editable attendance list from the API session
  const initialAttendance = useMemo((): StudentAttendance[] => {
    if (!session?.records) return [];
    return session.records.map((r) => ({
      studentId: r.student_id,
      name: r.student?.full_name ?? `طالب #${r.student_id}`,
      status: r.status === null ? "unmarked" : (r.status as UiStatus),
      note: r.note ?? "",
    }));
  }, [session]);

  const [attendance, setAttendance] =
    useState<StudentAttendance[]>(initialAttendance);

  // Reset when session changes (new course or date)
  useEffect(() => {
    setAttendance(initialAttendance);
    setSessionNote(session?.note ?? "");
  }, [initialAttendance, session?.note]);

  const markedCount = attendance.filter((a) => a.status !== "unmarked").length;
  const presentCount = attendance.filter((a) => a.status === "present").length;
  const completionPct =
    attendance.length > 0
      ? Math.round((markedCount / attendance.length) * 100)
      : 0;

  const toggleStudent = (studentId: number) => {
    setAttendance((prev) =>
      prev.map((a) =>
        a.studentId === studentId
          ? {
            ...a,
            status: a.status === "present" ? "absent" : "present",
          }
          : a
      )
    );
  };

  const updateNote = (studentId: number, note: string) => {
    setAttendance((prev) =>
      prev.map((a) => (a.studentId === studentId ? { ...a, note } : a))
    );
  };

  const markAllPresent = () => {
    setAttendance((prev) =>
      prev.map((a) => ({ ...a, status: "present" as UiStatus }))
    );
  };

  const clearAll = () => {
    setAttendance((prev) =>
      prev.map((a) => ({ ...a, status: "unmarked" as UiStatus, note: "" }))
    );
    setSessionNote("");
  };

  const handleSave = async () => {
    if (!course) return;

    // Only send marked students (present/absent) to the API
    const records = attendance
      .filter((a) => a.status !== "unmarked")
      .map((a) => ({
        student_id: a.studentId,
        status: a.status,
        note: a.note || undefined,
      }));

    if (records.length === 0 && sessionNote === (session?.note ?? "")) {
      toast({
        title: "لا يوجد تغييرات",
        description: "يرجى تسجيل حضور طالب واحد على الأقل أو تعديل الملاحظة العامة",
        variant: "destructive",
      });
      return;
    }

    saveMutation.mutate(
      {
        courseId: course.id,
        date,
        records: records.length > 0 ? records : undefined,
        note: sessionNote !== (session?.note ?? "") ? sessionNote : undefined
      },
      {
        onSuccess: () => {
          toast({
            title: "تم الحفظ بنجاح",
            description: `تم حفظ حضور ${course.title} - ${presentCount} حاضر من ${attendance.length}`,
          });
        },
        onError: () => {
          toast({
            title: "خطأ في الحفظ",
            description: "تعذّر حفظ الحضور. يرجى المحاولة مرة أخرى.",
            variant: "destructive",
          });
        },
      }
    );
  };

  if (!course) return null;
  const colorTag = toColorTag(course.color);

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="left"
        className="w-full sm:max-w-lg p-0 flex flex-col"
      >
        <SheetHeader className="p-5 pb-4 border-b">
          <SheetTitle className="text-start">
            <div className="flex items-center justify-between">
              <span className={`course-tag course-tag-${colorTag}`}>
                {date}
              </span>
              <span>{course.title}</span>
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
          <Button
            variant="outline"
            size="sm"
            onClick={markAllPresent}
            className="gap-1.5 text-xs"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            تحديد الكل حاضر
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="gap-1.5 text-xs text-muted-foreground"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            مسح الكل
          </Button>
        </div>

        {/* General Note */}
        <div className="px-5 py-3 border-b bg-muted/10">
          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block">ملاحظة عامة (مثال: توقيت رمضان)</Label>
          <Input
            value={sessionNote}
            onChange={(e) => setSessionNote(e.target.value)}
            placeholder="أدخل ملاحظة عامة لليوم..."
            className="h-8 text-sm"
          />
        </div>

        {/* Student list */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : attendance.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <p>لا يوجد طلاب مسجّلون في هذه الدورة</p>
            </div>
          ) : (
            attendance.map((student) => (
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
                  <div className="flex items-center justify-start gap-2">
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
                    <p className="text-sm font-medium text-foreground">
                      {student.name}
                    </p>
                  </div>
                  <Input
                    value={student.note}
                    onChange={(e) =>
                      updateNote(student.studentId, e.target.value)
                    }
                    placeholder="ملاحظة..."
                    className="mt-1.5 h-7 text-xs bg-transparent border-dashed"
                  />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Sticky save bar */}
        <div className="p-4 border-t bg-card shadow-[0_-4px_12px_-4px_rgba(0,0,0,0.05)]">
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              إلغاء
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 gap-2"
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              حفظ التغييرات
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
