import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { fmtDate } from "@/lib/api";

const arabicDayLabels = [
  "أحد",
  "إثنين",
  "ثلاثاء",
  "أربعاء",
  "خميس",
  "جمعة",
  "سبت",
];

interface WeekStripProps {
  selectedDate: string; // YYYY-MM-DD
  onDateChange: (date: string) => void;
}

export default function WeekStrip({ selectedDate, onDateChange }: WeekStripProps) {
  // Generate the 7 days of the week containing `selectedDate`
  const weekDays = useMemo(() => {
    const sel = new Date(selectedDate + "T00:00:00");
    // getDay(): 0=Sun, 6=Sat
    const dayOfWeek = sel.getDay();
    const startOfWeek = new Date(sel);
    startOfWeek.setDate(sel.getDate() - dayOfWeek); // Sunday

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return {
        date: fmtDate(d),
        dayNum: d.getDate(),
        label: arabicDayLabels[d.getDay()],
      };
    });
  }, [selectedDate]);

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      {weekDays.map((day) => (
        <button
          key={day.date}
          onClick={() => onDateChange(day.date)}
          className={cn(
            "flex flex-col items-center px-4 py-2 rounded-xl transition-colors min-w-[4rem]",
            selectedDate === day.date
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-card border text-foreground hover:bg-accent"
          )}
        >
          <span className="text-xs font-medium">{day.label}</span>
          <span className="text-lg font-bold mt-0.5">{day.dayNum}</span>
        </button>
      ))}
    </div>
  );
}
