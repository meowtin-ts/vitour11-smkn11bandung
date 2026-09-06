import { useState, ReactNode } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { useDarkMode } from "../contexts/DarkModeContext";

interface AdminLayoutProps {
  children: ReactNode;
  onLogout: () => void;
  userName?: string;
}

export function AdminLayout({ children, onLogout, userName }: AdminLayoutProps) {
  const { isDarkMode } = useDarkMode();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={`min-h-screen ${isDarkMode ? "bg-slate-950" : "bg-slate-50"}`}>
      <AdminSidebar
        onLogout={onLogout}
        userName={userName}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        <div className="p-4 lg:p-8 pt-20 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}
