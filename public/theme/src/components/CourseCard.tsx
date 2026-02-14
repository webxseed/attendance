import { Course, getCourseAttendanceStats, getTeachersByIds } from "@/data/mockData";
import { Progress } from "@/components/ui/progress";
import { Users, Clock } from "lucide-react";

interface CourseCardProps {
  course: Course;
  onClick: () => void;
}

export default function CourseCard({ course, onClick }: CourseCardProps) {
  const stats = getCourseAttendanceStats(course.id);
  const teachers = getTeachersByIds(course.teacherIds);
  const completionPct = stats.total > 0 ? Math.round(((stats.present + stats.absent) / stats.total) * 100) : 0;

  return (
    <button
      onClick={onClick}
      className="stat-card text-start w-full animate-fade-in hover:border-primary/30 transition-all group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <span className={`course-tag course-tag-${course.colorTag}`}>{course.time}</span>
        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
          {course.name}
        </h3>
      </div>

      {/* Teachers */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
        <span>{teachers.map((t) => t.name).join("، ")}</span>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 text-xs mb-3">
        <div className="flex items-center gap-1">
          <Users className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">{stats.total}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-success" />
          <span className="text-muted-foreground">{stats.present}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-destructive" />
          <span className="text-muted-foreground">{stats.absent}</span>
        </div>
        {stats.unmarked > 0 && (
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-warning" />
            <span className="text-warning font-medium">{stats.unmarked}</span>
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
