import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useLocation } from "react-router-dom";

interface SidebarContextType {
    isVisible: boolean;
    toggle: () => void;
    show: () => void;
    hide: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
    const [isVisible, setIsVisible] = useState(true);
    const location = useLocation();

    // Hide sidebar by default on 'Today' page (/today)
    useEffect(() => {
        if (location.pathname === "/today") {
            setIsVisible(false);
        } else {
            // Optionally default to true for others
            // setIsVisible(true);
        }
    }, [location.pathname]);

    const toggle = () => setIsVisible((prev) => !prev);
    const show = () => setIsVisible(true);
    const hide = () => setIsVisible(false);

    return (
        <SidebarContext.Provider value={{ isVisible, toggle, show, hide }}>
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    const context = useContext(SidebarContext);
    if (context === undefined) {
        throw new Error("useSidebar must be used within a SidebarProvider");
    }
    return context;
}
