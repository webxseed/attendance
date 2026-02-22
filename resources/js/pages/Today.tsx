import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Course, fmtDate } from "@/lib/api";
import { useCourses, useTodayStats, useYears } from "@/hooks/useApi";
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

  // Fetch courses and years
  const { data: coursesPage, isLoading: coursesLoading } = useCourses();
  const { data: years, isLoading: yearsLoading } = useYears();
  const courses = coursesPage?.data ?? [];
  const allYears = years ?? [];

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

  const isLoading = coursesLoading || yearsLoading;
  const coursesWithoutYear = filteredCourses.filter((c) => !c.year_id);

  return (
    <div className="space-y-2 pb-20 lg:pb-8">
      {/* Top bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-center gap-4 text-center">
        <div className="page-header mb-0">

          {allYears.map((year) => {
            const yearCourses = filteredCourses.filter((c) => c.year_id === year.id);
            if (yearCourses.length === 0) return null;

            return (
              <div key={year.id} className="space-y-4">
                <div className="border-b pb-3 relative">
                  <div className="flex items-center gap-2">
                    <img
                      src="/logo.png"
                      alt="Logo"
                      className="w-8 h-8 object-contain flex-shrink-0"
                    />
                    <h1 className="text-2xl font-extrabold text-primary">مدرسة موال</h1>
                  </div>

                  {(year.start_year && year.end_year) && (
                    <p className=" font-semibold text-gray-700 mt-2">
                      السنة الدراسية {year.start_year}-{year.end_year}
                    </p>
                  )}

                  <h3 className="text-base font-medium text-gray-600">
                    {year.title}
                  </h3>
                </div>


                {/* render yearCourses here */}
              </div>
            );
          })}

          <p className="page-subtitle">
            {formattedDate}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search removed as per previous code context, but keeping div for layout if needed */}
        </div>
      </div>

      {/* Week strip */}
      <WeekStrip selectedDate={selectedDate} onDateChange={setSelectedDate} />

      {/* Summary cards */}
      <SummaryCards {...totalStats} />

      {/* Content */}
      {
        isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Years Sections */}
            {allYears.map((year) => {
              const yearCourses = filteredCourses.filter(
                (c) => c.year_id === year.id
              );
              if (yearCourses.length === 0) return null;

              return (
                <div key={year.id} className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">

                    <span className="text-sm text-muted-foreground">
                      {yearCourses.length} دورات
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {yearCourses.map((course) => (
                      <CourseCard
                        key={course.id}
                        course={course}
                        stats={statsMap[course.id]}
                        onClick={() => openDrawer(course)}
                        selectedDate={selectedDate}
                      />
                    ))}
                  </div>
                </div>
              );
            })}



            {filteredCourses.length === 0 && (
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
          </div>
        )
      }

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
