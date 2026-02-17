import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext";
import { Button } from "@/components/ui/button";
import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";

function LayoutContent() {
  const { isVisible, toggle } = useSidebar();

  return (
    <div className="flex min-h-screen w-full bg-background relative">
      {/* Sidebar - Desktop: Conditional */}
      {isVisible && (
        <div className="h-screen sticky top-0 z-30 hidden lg:block border-e">
          <AppSidebar />
        </div>
      )}

      {/* Sidebar - Mobile: Always rendered (handles its own visibility state internally) */}
      <div className="lg:hidden">
        <AppSidebar />
      </div>

      <main className="flex-1 min-w-0 transition-all duration-300 flex flex-col">
        {/* Toggle Button Area - Desktop Only */}
        <div className="p-4 pb-0 hidden lg:flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            className="text-muted-foreground hover:text-foreground"
          >
            {isVisible ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
          </Button>
        </div>

        <div className={`p-4 lg:p-8 max-w-7xl mx-auto w-full ${!isVisible ? 'lg:max-w-screen-2xl' : ''}`}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default function Layout() {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  )
}
