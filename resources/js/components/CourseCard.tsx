import { Course, CourseStats, toColorTag } from "@/lib/api";
import { Progress } from "@/components/ui/progress";
import { Users, Clock } from "lucide-react";

interface CourseCardProps {
  course: Course;
  stats?: CourseStats;
  onClick: () => void;
  selectedDate?: string;
}

export default function CourseCard({ course, stats, onClick, selectedDate }: CourseCardProps) {
  const colorTag = toColorTag(course.color);

  const total = stats?.total ?? course.students_count ?? 0;
  const present = stats?.present ?? 0;
  const absent = stats?.absent ?? 0;
  const unmarked = stats?.unmarked ?? total;
  const marked = present + absent;
  const completionPct = total > 0 ? Math.round((marked / total) * 100) : 0;

  // Check if course is scheduled for the selected date
  const dayName = selectedDate
    ? new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long" })
    : "";
  const todaySchedule = course.schedule_details?.find((s) => s.day === dayName);

  return (
    <button
      onClick={onClick}
      className={`stat-card text-start w-full animate-fade-in hover:border-primary/30 transition-all group ${todaySchedule ? "bg-primary/5 border-primary/40 ring-1 ring-primary/20" : ""
        }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {course.teachers && course.teachers.length > 0 ? (
            <span className="text-xs text-muted-foreground">
              {course.teachers.map((t) => t.user?.name ?? `معلم #${t.id}`).join("، ")}
            </span>
          ) : course.teachers_count != null && course.teachers_count > 0 ? (
            <span className="text-xs text-muted-foreground">
              {course.teachers_count} معلم
            </span>
          ) : null}
        </div>
        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
          {course.title}
        </h3>
      </div>

      {/* Color indicator */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className={`course-tag course-tag-${colorTag}`}>
          {course.description || course.title}
        </span>
        {todaySchedule && (todaySchedule.from_time || todaySchedule.to_time) && (
          <span className="text-[10px] bg-background/80 px-1.5 py-0.5 rounded border text-muted-foreground dir-ltr">
            {todaySchedule.from_time || "???"} - {todaySchedule.to_time || "???"}
          </span>
        )}
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 text-xs mb-3">

        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-success" />
          <span className="">{present}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-destructive" />
          <span className="">{absent}</span>
        </div>
        {unmarked > 0 && (
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-warning" />
            <span className="text-warning font-medium">{unmarked}</span>
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="space-y-1.5">

        <Progress value={completionPct} className="h-1.5" />
      </div>
    </button>
  );
}
