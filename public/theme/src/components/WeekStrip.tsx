import { cn } from "@/lib/utils";

const days = [
  { key: "sun", label: "أحد", date: 8 },
  { key: "mon", label: "إثنين", date: 9 },
  { key: "tue", label: "ثلاثاء", date: 10 },
  { key: "wed", label: "أربعاء", date: 11 },
  { key: "thu", label: "خميس", date: 12 },
];

interface WeekStripProps {
  selectedDay: number;
  onDayChange: (date: number) => void;
}

export default function WeekStrip({ selectedDay, onDayChange }: WeekStripProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      {days.map((day) => (
        <button
          key={day.key}
          onClick={() => onDayChange(day.date)}
          className={cn(
            "flex flex-col items-center px-4 py-2 rounded-xl transition-colors min-w-[4rem]",
            selectedDay === day.date
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-card border text-foreground hover:bg-accent"
          )}
        >
          <span className="text-xs font-medium">{day.label}</span>
          <span className="text-lg font-bold mt-0.5">{day.date}</span>
        </button>
      ))}
    </div>
  );
}
