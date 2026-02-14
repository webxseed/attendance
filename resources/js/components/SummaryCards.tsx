import { Users, CheckCircle2, XCircle, Clock } from "lucide-react";

interface SummaryCardsProps {
  total: number;
  present: number;
  absent: number;
  unmarked: number;
}

const cards = [
  { key: "total", label: "إجمالي الطلاب", icon: Users, colorClass: "text-primary" },
  { key: "present", label: "حاضر", icon: CheckCircle2, colorClass: "text-success" },
  { key: "absent", label: "غائب", icon: XCircle, colorClass: "text-destructive" },
  { key: "unmarked", label: "غير مُسجّل", icon: Clock, colorClass: "text-warning" },
] as const;

export default function SummaryCards({ total, present, absent, unmarked }: SummaryCardsProps) {
  const values = { total, present, absent, unmarked };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
      {cards.map((card) => (
        <div key={card.key} className="stat-card animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <card.icon className={`w-5 h-5 ${card.colorClass}`} />
            <span className="text-xs text-muted-foreground">{card.label}</span>
          </div>
          <p className="text-3xl font-bold text-foreground">{values[card.key]}</p>
        </div>
      ))}
    </div>
  );
}
