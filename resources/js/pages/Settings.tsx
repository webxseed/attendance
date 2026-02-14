import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, Moon, Globe } from "lucide-react";

export default function Settings() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="page-header">
        <h1 className="page-title">الإعدادات</h1>
        <p className="page-subtitle">إعدادات الحساب والتطبيق</p>
      </div>

      {/* Profile */}
      <div className="bg-card rounded-xl border p-6">
        <h2 className="font-semibold mb-4">الملف الشخصي</h2>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xl font-bold text-primary">
              {user?.name?.charAt(0)}
            </span>
          </div>
          <div>
            <p className="font-medium text-lg">{user?.name}</p>
            <p className="text-sm text-muted-foreground">
              {user?.role === "admin" ? "مدير المدرسة" : "معلم"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {user?.email}
            </p>
          </div>
        </div>
      </div>

     

      {/* Logout */}
      <Button
        variant="outline"
        onClick={handleLogout}
        className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/5"
      >
        <LogOut className="w-4 h-4" />
        تسجيل الخروج
      </Button>
    </div>
  );
}
