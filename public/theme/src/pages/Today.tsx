import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getTodayCourses, getCourseAttendanceStats, courses as allCourses, Course } from "@/data/mockData";
import SummaryCards from "@/components/SummaryCards";
import WeekStrip from "@/components/WeekStrip";
import CourseCard from "@/components/CourseCard";
import AttendanceDrawer from "@/components/AttendanceDrawer";
import FloatingActionButton from "@/components/FloatingActionButton";
import { CalendarDays, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Today() {
  const { user } = useAuth();
  const [selectedDay, setSelectedDay] = useState(12);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState("");

  const isAdmin = user?.role === "admin";

  // Get today's courses (for teacher, filter by their assignments)
  let todayCourses = getTodayCourses();
  if (!isAdmin && user?.teacherId) {
    todayCourses = todayCourses.filter((c) => c.teacherIds.includes(user.teacherId!));
  }

  // Search filter
  const filteredCourses = search
    ? todayCourses.filter((c) => c.name.includes(search))
    : todayCourses;

  // Aggregate stats
  const totalStats = todayCourses.reduce(
    (acc, c) => {
      const s = getCourseAttendanceStats(c.id);
      return {
        total: acc.total + s.total,
        present: acc.present + s.present,
        absent: acc.absent + s.absent,
        unmarked: acc.unmarked + s.unmarked,
      };
    },
    { total: 0, present: 0, absent: 0, unmarked: 0 }
  );

  const openDrawer = (course: Course) => {
    setSelectedCourse(course);
    setDrawerOpen(true);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Top bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="page-header mb-0">
          <h1 className="page-title flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-primary" />
            لوحة اليوم
          </h1>
          <p className="page-subtitle">
            الخميس، ١٢ فبراير ٢٠٢٦ • {isAdmin ? "عرض المدير" : "عرض المعلم"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <CalendarDays className="w-4 h-4" />
            اليوم
          </Button>
          <div className="relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="بحث في الدورات..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ps-9 h-9 w-48"
            />
          </div>
        </div>
      </div>

      {/* Week strip */}
      <WeekStrip selectedDay={selectedDay} onDayChange={setSelectedDay} />

      {/* Summary cards */}
      <SummaryCards {...totalStats} />

      {/* Section header */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{filteredCourses.length} دورة</span>
        <h2 className="text-lg font-semibold">دورات اليوم</h2>
      </div>

      {/* Course grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} onClick={() => openDrawer(course)} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-card rounded-2xl border">
          <CalendarDays className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">لا توجد دورات اليوم</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            {search ? "لم يتم العثور على نتائج" : "لا توجد دورات مجدولة لهذا اليوم"}
          </p>
        </div>
      )}

      {/* Attendance Drawer */}
      <AttendanceDrawer
        course={selectedCourse}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      {/* Mobile FAB */}
      <FloatingActionButton
        onClick={() => {
          if (filteredCourses.length > 0) {
            openDrawer(filteredCourses[0]);
          }
        }}
      />
    </div>
  );
}
