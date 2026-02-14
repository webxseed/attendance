import { Course, CourseStats, toColorTag } from "@/lib/api";
import { Progress } from "@/components/ui/progress";
import { Users, Clock } from "lucide-react";

interface CourseCardProps {
  course: Course;
  stats?: CourseStats;
  onClick: () => void;
}

export default function CourseCard({ course, stats, onClick }: CourseCardProps) {
  const colorTag = toColorTag(course.color);

  const total = stats?.total ?? course.students_count ?? 0;
  const present = stats?.present ?? 0;
  const absent = stats?.absent ?? 0;
  const unmarked = stats?.unmarked ?? total;
  const marked = present + absent;
  const completionPct = total > 0 ? Math.round((marked / total) * 100) : 0;

  return (
    <button
      onClick={onClick}
      className="stat-card text-start w-full animate-fade-in hover:border-primary/30 transition-all group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {course.teachers_count != null && (
            <span className="text-xs text-muted-foreground">
              {course.teachers_count} معلم
            </span>
          )}
        </div>
        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
          {course.title}
        </h3>
      </div>

      {/* Color indicator */}
      <div className="flex items-center gap-1.5 mb-4">
        <span className={`course-tag course-tag-${colorTag}`}>
          {course.description || course.title}
        </span>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 text-xs mb-3">
        <div className="flex items-center gap-1">
          <Users className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">{total}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-success" />
          <span className="text-muted-foreground">{present}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-destructive" />
          <span className="text-muted-foreground">{absent}</span>
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
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{completionPct}%</span>
          <span className="text-muted-foreground">اكتمال التسجيل</span>
        </div>
        <Progress value={completionPct} className="h-1.5" />
      </div>
    </button>
  );
}
