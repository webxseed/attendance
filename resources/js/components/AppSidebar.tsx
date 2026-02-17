import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  CalendarDays,
  BookOpen,
  Users,
  GraduationCap,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const adminLinks = [
  { to: "/today", label: "لوحة اليوم", icon: LayoutDashboard },
  { to: "/courses", label: "الدورات", icon: BookOpen },
  { to: "/users", label: "المستخدمون", icon: Users },
  { to: "/students", label: "الطلاب", icon: GraduationCap },
  { to: "/reports", label: "التقارير", icon: BarChart3 },
  { to: "/settings", label: "الإعدادات", icon: Settings },
];

const teacherLinks = [
  { to: "/today", label: "لوحة اليوم", icon: LayoutDashboard },
  { to: "/reports", label: "التقارير", icon: BarChart3 },
  { to: "/settings", label: "الإعدادات", icon: Settings },
];

export default function AppSidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = user?.role === "admin" ? adminLinks : teacherLinks;

  const handleLogout = async () => {
    await logout();
  };

  const sidebar = (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="p-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Logo"
            className="w-10 h-10 object-contain"
          />
          <div className="min-w-0">
            <h2 className="font-bold text-sm text-sidebar-foreground truncate">
              مدرسة موال
            </h2>
            <p className="text-xs text-muted-foreground truncate">
              منصة الحضور
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {links.map((link) => {
          const isActive = location.pathname === link.to;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <link.icon className="w-5 h-5 flex-shrink-0" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-primary">
              {user?.name?.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {user?.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {user?.role === "admin" ? "مدير" : "معلم"}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="text-muted-foreground hover:text-destructive transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 start-4 z-50 w-10 h-10 rounded-xl bg-card border shadow-sm flex items-center justify-center"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 start-0 z-40 h-screen w-64 bg-sidebar border-e border-sidebar-border transition-transform duration-300 lg:relative lg:translate-x-0",
          mobileOpen
            ? "translate-x-0"
            : "translate-x-full lg:translate-x-0"
        )}
      >
        {sidebar}
      </aside>
    </>
  );
}
