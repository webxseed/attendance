import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, Moon, Globe } from "lucide-react";

export default function Settings() {
  const { user, logout } = useAuth();

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
            <span className="text-xl font-bold text-primary">{user?.name?.charAt(0)}</span>
          </div>
          <div>
            <p className="font-medium text-lg">{user?.name}</p>
            <p className="text-sm text-muted-foreground">{user?.role === "admin" ? "مدير المدرسة" : "معلم"}</p>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-card rounded-xl border p-6 space-y-4">
        <h2 className="font-semibold mb-2">التفضيلات</h2>
        <div className="flex items-center justify-between py-3 border-b last:border-b-0">
          <Button variant="outline" size="sm" disabled>قريباً</Button>
          <div className="flex items-center gap-3">
            <div>
              <p className="text-sm font-medium">اللغة</p>
              <p className="text-xs text-muted-foreground">العربية</p>
            </div>
            <Globe className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>
        <div className="flex items-center justify-between py-3">
          <Button variant="outline" size="sm" disabled>قريباً</Button>
          <div className="flex items-center gap-3">
            <div>
              <p className="text-sm font-medium">الوضع الداكن</p>
              <p className="text-xs text-muted-foreground">معطّل</p>
            </div>
            <Moon className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Logout */}
      <Button variant="outline" onClick={logout} className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/5">
        <LogOut className="w-4 h-4" />
        تسجيل الخروج
      </Button>
    </div>
  );
}
