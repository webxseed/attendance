import { Users, CheckCircle2, XCircle, Clock } from "lucide-react";

interface SummaryCardsProps {
  total: number;
  present: number;
  absent: number;
  unmarked: number;
}

const cards = [
  { key: "total", label: "إجمالي", icon: Users, colorClass: "text-primary" },
  { key: "present", label: "الحضور", icon: CheckCircle2, colorClass: "text-success" },
  { key: "absent", label: "الغياب", icon: XCircle, colorClass: "text-destructive" },
] as const;

export default function SummaryCards({ total, present, absent, unmarked }: SummaryCardsProps) {
  const values = { total, present, absent, unmarked };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 lg:flex ">
      {cards.map((card) => (
        <div key={card.key} className="stat-card animate-fade-in text-lg p-4">
          <div className="flex items-center justify-between mb-3 gap-2">
            <card.icon className={`w-5 h-5 text-xl ${card.colorClass}`} />
            <span className="font-bold text-xl">{card.label}</span>
          </div>
          <p className="text-3xl font-bold text-foreground">{values[card.key]}</p>
        </div>
      ))}
    </div>
  );
}
