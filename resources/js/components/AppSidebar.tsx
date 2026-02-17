import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSidebar } from "@/contexts/SidebarContext";
import {
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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
  const { isVisible } = useSidebar(); // isVisible = true (start expanded), false (start collapsed)
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = user?.role === "admin" ? adminLinks : teacherLinks;

  const handleLogout = async () => {
    await logout();
  };

  const isCollapsed = !isVisible; // On desktop, !isVisible means collapsed icons-only mode

  const sidebar = (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className={cn("p-5 border-b border-sidebar-border h-[73px] flex items-center", isCollapsed ? "justify-center px-2" : "")}>
        <div className="flex items-center gap-3 overflow-hidden">
          <img
            src="/logo.png"
            alt="Logo"
            className="w-8 h-8 object-contain flex-shrink-0"
          />
          <div className={cn("min-w-0 transition-opacity duration-200", isCollapsed ? "hidden opacity-0 w-0" : "opacity-100")}>
            <h2 className="font-bold text-sm text-sidebar-foreground truncate whitespace-nowrap">
              مدرسة موال
            </h2>
            <p className="text-xs text-muted-foreground truncate whitespace-nowrap">
              منصة الحضور
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-x-hidden">
        {links.map((link) => {
          const isActive = location.pathname === link.to;

          if (isCollapsed) {
            return (
              <Tooltip key={link.to} delayDuration={0}>
                <TooltipTrigger asChild>
                  <NavLink
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center justify-center w-full h-10 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                    )}
                  >
                    <link.icon className="w-5 h-5 flex-shrink-0" />
                    <span className="sr-only">{link.label}</span>
                  </NavLink>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {link.label}
                </TooltipContent>
              </Tooltip>
            )
          }

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
              <span className="truncate">{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-sidebar-border">
        <div className={cn("flex items-center gap-3 px-3 py-2", isCollapsed ? "justify-center px-0" : "")}>
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-primary">
              {user?.name?.charAt(0)}
            </span>
          </div>
          <div className={cn("flex-1 min-w-0 transition-all duration-200 overflow-hidden", isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100")}>
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {user?.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {user?.role === "admin" ? "مدير" : "معلم"}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className={cn("text-muted-foreground hover:text-destructive transition-colors flex-shrink-0", isCollapsed ? "hidden" : "")}
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
          "fixed top-0 start-0 z-40 h-screen bg-sidebar border-e border-sidebar-border transition-all duration-300",
          // Mobile: always w-64, handled by translate
          "w-64 lg:static lg:translate-x-0 lg:h-full",
          // Desktop Collapsed/Expanded width logic
          isCollapsed ? "lg:w-[70px]" : "lg:w-64",

          mobileOpen
            ? "translate-x-0"
            : "translate-x-full lg:translate-x-0" // Mobile hidden (full right)
        )}
      >
        {sidebar}
      </aside>
    </>
  );
}
