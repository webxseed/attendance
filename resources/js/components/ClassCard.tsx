import { CourseClass, CourseStats, toColorTag } from "@/lib/api";
import { Progress } from "@/components/ui/progress";
import { Pin } from "lucide-react";

const daysTranslation: Record<string, string> = {
  Sunday: "الأحد",
  Monday: "الاثنين",
  Tuesday: "الثلاثاء",
  Wednesday: "الأربعاء",
  Thursday: "الخميس",
  Friday: "الجمعة",
  Saturday: "السبت",
};

interface ClassCardProps {
  courseClass: CourseClass;
  stats?: CourseStats;
  onClick: () => void;
  selectedDate?: string;
}

export default function ClassCard({
  courseClass,
  stats,
  onClick,
  selectedDate,
}: ClassCardProps) {
  const colorTag = toColorTag(courseClass.course?.color);

  const total = stats?.total ?? courseClass.students_count ?? 0;

  // Check if the class is scheduled for the selected date
  const dayName = selectedDate
    ? new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long" })
    : "";
  const todaySchedule = courseClass.schedule_details?.find((s) => s.day === dayName);

  // Show 0/0 if no attendance stats, or if the class has a schedule but no lesson today
  const hasSchedule = courseClass.schedule_details && courseClass.schedule_details.length > 0;
  const noLessonToday = selectedDate && hasSchedule && !todaySchedule;
  const showStats = !!stats && !noLessonToday;

  const present = showStats ? (stats?.present ?? 0) : 0;
  const absent = showStats ? (stats?.absent ?? 0) : 0;
  const unmarked = showStats ? (stats?.unmarked ?? 0) : 0;
  const marked = present + absent;
  const completionPct = showStats && total > 0 ? Math.round((marked / total) * 100) : 0;

  return (
    <button
      onClick={onClick}
      className={`stat-card text-start w-full animate-fade-in hover:border-primary/30 transition-all group ${todaySchedule ? "bg-primary/5 border-primary/40 ring-1 ring-primary/20" : ""
        }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-1 flex-row p-2">
        <div className="min-w-0">
          <h3 className="font-bold text-foreground group-hover:text-primary transition-colors text-lg p-0 m-0 flex items-center gap-1.5">
            {courseClass.is_pinned && (
              <Pin className="w-4 h-4 text-primary flex-shrink-0" aria-label="شعبة ثابتة" />
            )}
            {courseClass.course?.title ?? "دورة"}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">{courseClass.name}</p>
        </div>
        <div className="flex items-center gap-2">
          {courseClass.teachers && courseClass.teachers.length > 0 ? (
            <span className="text-sm ">
              {courseClass.teachers.map((t) => t.user?.name ?? `معلم #${t.id}`).join("، ")}
            </span>
          ) : courseClass.teachers_count != null && courseClass.teachers_count > 0 ? (
            <span className="text-sm ">
              {courseClass.teachers_count} معلم
            </span>
          ) : null}
        </div>

      </div>

      {/* Color indicator */}
      <div className="flex flex-wrap flex-col items-start gap-2 mb-4">
        <span className={`course-tag p-0 course-tag-${colorTag}`}>
          {courseClass.course?.description || ''}
        </span>
        {courseClass.schedule_details && courseClass.schedule_details.length > 0 && (
          <div className="flex flex-wrap gap-2 w-full mt-1">
            {courseClass.schedule_details.map((schedule, idx) => (
              (schedule.from_time || schedule.to_time) ? (
                <p key={idx} className={`text-[10px] px-0 py-0.5 rounded border text-black font-bold dir-ltr  flex items-center gap-1 ${schedule.day === dayName ? 'bg-primary/20 border-primary/40' : 'bg-background/80'}`}>
                  <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" className="ionicon" viewBox="0 0 512 512"><path d="M112.91 128A191.85 191.85 0 0064 254c-1.18 106.35 85.65 193.8 192 194 106.2.2 192-85.83 192-192 0-104.54-83.55-189.61-187.5-192a4.36 4.36 0 00-4.5 4.37V152" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" /><path d="M233.38 278.63l-79-113a8.13 8.13 0 0111.32-11.32l113 79a32.5 32.5 0 01-37.25 53.26 33.21 33.21 0 01-8.07-7.94z" /></svg> {schedule.day ? (daysTranslation[schedule.day] || schedule.day) : ""}: {schedule.from_time || ""} - {schedule.to_time || ""}
                </p>
              ) : null
            ))}
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 text-xs mb-3">

        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-success" />
          <h3 className="text-sm">حضور: <span className="">{present}</span></h3>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-destructive" />
          <h3 className="text-sm">غياب: <span className="">{unmarked}</span></h3>
        </div>

      </div>

      {/* Progress */}
      <div className="space-y-1">

        <Progress value={completionPct} className="h-1" />
      </div>
    </button>
  );
}
