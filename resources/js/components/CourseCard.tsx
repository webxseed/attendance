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
      <div className="flex items-start justify-between mb-3 flex-col">
        <h3 className="font-bold text-foreground group-hover:text-primary transition-colors text-lg">
          {course.title}
        </h3>
        <div className="flex items-center gap-2">
          {course.teachers && course.teachers.length > 0 ? (
            <span className="text-base ">
              {course.teachers.map((t) => t.user?.name ?? `معلم #${t.id}`).join("، ")}
            </span>
          ) : course.teachers_count != null && course.teachers_count > 0 ? (
            <span className="text-base ">
              {course.teachers_count} معلم
            </span>
          ) : null}
        </div>
        
      </div>

      {/* Color indicator */}
      <div className="flex flex-wrap flex-col items-start gap-2 mb-4">
        <span className={`course-tag course-tag-${colorTag}`}>
          {course.description || ''}
        </span>
        {todaySchedule && (todaySchedule.from_time || todaySchedule.to_time) && (
          <p className="text-[10px] bg-background/80 px-1.5 py-0.5 rounded border text-black font-bold dir-ltr text-base flex items-center gap-1">
            <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" class="ionicon" viewBox="0 0 512 512"><path d="M112.91 128A191.85 191.85 0 0064 254c-1.18 106.35 85.65 193.8 192 194 106.2.2 192-85.83 192-192 0-104.54-83.55-189.61-187.5-192a4.36 4.36 0 00-4.5 4.37V152" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"/><path d="M233.38 278.63l-79-113a8.13 8.13 0 0111.32-11.32l113 79a32.5 32.5 0 01-37.25 53.26 33.21 33.21 0 01-8.07-7.94z"/></svg> {todaySchedule.from_time || "???"} - {todaySchedule.to_time || "???"}
          </p>
        )}
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 text-xs mb-3">

        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-success" />
          <h3 className="text-base">حضور: <span className="">{present}</span></h3>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-destructive" />
          <h3 className="text-base">غياب: <span className="">{unmarked}</span></h3>
        </div>
      
      </div>

      {/* Progress */}
      <div className="space-y-1.5">

        <Progress value={completionPct} className="h-1.5" />
      </div>
    </button>
  );
}
