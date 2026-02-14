import { CheckCircle2 } from "lucide-react";

interface FloatingActionButtonProps {
  onClick: () => void;
}

export default function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden fixed bottom-6 start-6 z-30 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center"
      aria-label="تسجيل الحضور"
    >
      <CheckCircle2 className="w-6 h-6" />
    </button>
  );
}
