import { useEffect, useState } from "react";
import { Course, fmtDate } from "@/lib/api";
import { useCourses, useTodayStats, useYears } from "@/hooks/useApi";
import SummaryCards from "@/components/SummaryCards";
import WeekStrip from "@/components/WeekStrip";
import CourseCard from "@/components/CourseCard";
import AttendanceDrawer from "@/components/AttendanceDrawer";
import FloatingActionButton from "@/components/FloatingActionButton";
import { CalendarDays, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Today() {
  const today = fmtDate(new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedYearId, setSelectedYearId] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search] = useState("");

  // Fetch years, then load courses for the selected year only
  const { data: years, isLoading: yearsLoading } = useYears();
  const allYears = years ?? [];
  const yearOptions = [...allYears].sort((a, b) => {
    const aValue = Number(a.end_year ?? a.start_year ?? a.id) || a.id;
    const bValue = Number(b.end_year ?? b.start_year ?? b.id) || b.id;
    return bValue - aValue;
  });
  const selectedYearIdNumber = selectedYearId ? Number(selectedYearId) : undefined;
  const selectedYear = allYears.find((year) => String(year.id) === selectedYearId);

  useEffect(() => {
    if (yearOptions.length === 0) {
      if (selectedYearId) setSelectedYearId("");
      return;
    }

    if (selectedYearId && yearOptions.some((year) => String(year.id) === selectedYearId)) {
      return;
    }

    setSelectedYearId(String(yearOptions[0].id));
  }, [selectedYearId, years]);

  const { data: coursesPage, isLoading: coursesLoading } = useCourses(
    false,
    selectedYearIdNumber,
    !!selectedYearIdNumber
  );
  const courses = coursesPage?.data ?? [];

  // Fetch attendance stats for the selected date
  const { statsMap, isLoading: statsLoading } = useTodayStats(
    courses,
    selectedDate,
    selectedYearIdNumber,
    !!selectedYearIdNumber
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
  const formattedDate = dateObj.toLocaleDateString("ar-SA-u-ca-gregory", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const isLoading =
    yearsLoading || (!!selectedYearIdNumber && (coursesLoading || statsLoading));

  return (
    <div className="space-y-2 pb-20 lg:pb-8 " >
      {/* Top bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4  pl-4 pr-4">

        <div className="page-header mb-0">
          <div className="pb-3">
            <div className="flex gap-2 items-center">
              <img
                src="/logo.png"
                alt="Logo"
                className="w-14 h-14 object-contain flex-shrink-0"
              />
              <h1 className="text-2xl font-extrabold text-primary">مدرسة موال</h1>
            </div>

            {selectedYear?.start_year && selectedYear?.end_year && (
              <p className="font-bold text-gray-700 mt-2">
                السنة الدراسية {selectedYear.start_year}-{selectedYear.end_year}
              </p>
            )}

            {selectedYear?.title && (
              <h3 className="text-base font-medium text-black">
                {selectedYear.title}
              </h3>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <Select
            value={selectedYearId}
            onValueChange={(value) => {
              setSelectedYearId(value);
              setSelectedCourse(null);
              setDrawerOpen(false);
            }}
            disabled={yearOptions.length === 0}
          >
            <SelectTrigger className="w-full sm:w-56 bg-card">
              <SelectValue placeholder="اختر السنة الدراسية" />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((year) => (
                <SelectItem key={year.id} value={year.id.toString()}>
                  {year.name || year.title || `سنة #${year.id}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <SummaryCards {...totalStats} />

        </div>
      </div>

      {/* Week strip */}
      <div className="flex items-center gap-2 justify-between">
        <WeekStrip selectedDate={selectedDate} onDateChange={setSelectedDate} />
        <p className=" font-bold text-black">
          {formattedDate}
        </p>
      </div>
      {/* Summary cards */}


      {/* Content */}
      {
        isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-8">
            {selectedYear && filteredCourses.length > 0 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    {selectedYear.name || selectedYear.title}
                  </h2>
                  {selectedYear.start_year && selectedYear.end_year && (
                    <p className="text-sm text-muted-foreground">
                      {selectedYear.start_year}-{selectedYear.end_year}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
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
              </div>
            )}

            {filteredCourses.length === 0 && (
              <div className="text-center py-16 bg-card rounded-2xl border">
                <CalendarDays className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-muted-foreground font-medium">
                  {yearOptions.length === 0
                    ? "لا توجد سنوات دراسية"
                    : "لا توجد دورات في السنة المحددة"}
                </p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  {search ? "لم يتم العثور على نتائج" : "اختر سنة أخرى من القائمة"}
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
    </div >
  );
}
