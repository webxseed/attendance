import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Course, fmtDate } from "@/lib/api";
import { useCourses, useTodayStats } from "@/hooks/useApi";
import SummaryCards from "@/components/SummaryCards";
import WeekStrip from "@/components/WeekStrip";
import CourseCard from "@/components/CourseCard";
import AttendanceDrawer from "@/components/AttendanceDrawer";
import FloatingActionButton from "@/components/FloatingActionButton";
import { CalendarDays, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Today() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const today = fmtDate(new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Fetch courses
  const { data: coursesPage, isLoading: coursesLoading } = useCourses();
  const courses = coursesPage?.data ?? [];

  // Fetch attendance stats for the selected date
  const { statsMap, isLoading: statsLoading } = useTodayStats(
    courses,
    selectedDate
  );

  // Search filter
  const filteredCourses = search
    ? courses.filter((c) => c.title.includes(search))
    : courses;

  // Aggregate stats across all courses
  const totalStats = courses.reduce(
    (acc, c) => {
      const s = statsMap[c.id] ?? {
        total: c.students_count ?? 0,
        present: 0,
        absent: 0,
        unmarked: c.students_count ?? 0,
      };
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

  // Format date for display
  const dateObj = new Date(selectedDate + "T00:00:00");
  const formattedDate = dateObj.toLocaleDateString("ar-SA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Top bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="page-header mb-0">
          <h1 className="page-title flex items-center gap-2 ms-4">
            <CalendarDays className="w-6 h-6 text-primary" />
            لوحة اليوم
          </h1>
          <p className="page-subtitle">
            {formattedDate} • {isAdmin ? "عرض المدير" : "عرض المعلم"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setSelectedDate(today)}
          >
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
      <WeekStrip selectedDate={selectedDate} onDateChange={setSelectedDate} />

      {/* Summary cards */}
      <SummaryCards {...totalStats} />

      {/* Section header */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {filteredCourses.length} دورة
        </span>
        <h2 className="text-lg font-semibold">دورات اليوم</h2>
      </div>

      {/* Course grid */}
      {coursesLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              stats={statsMap[course.id]}
              onClick={() => openDrawer(course)}
              selectedDate={selectedDate}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-card rounded-2xl border">
          <CalendarDays className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">
            لا توجد دورات اليوم
          </p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            {search
              ? "لم يتم العثور على نتائج"
              : "لا توجد دورات مجدولة لهذا اليوم"}
          </p>
        </div>
      )}

      {/* Attendance Drawer */}
      <AttendanceDrawer
        course={selectedCourse}
        date={selectedDate}
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
