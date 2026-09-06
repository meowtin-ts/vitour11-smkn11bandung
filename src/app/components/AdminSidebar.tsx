import { Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  Map,
  MessageSquare,
  LogOut,
  Menu,
  X,
  Building2,
} from "lucide-react";
import { useDarkMode } from "../contexts/DarkModeContext";

interface AdminSidebarProps {
  onLogout: () => void;
  userName?: string;
  isOpen: boolean;
  onToggle: () => void;
}

export function AdminSidebar({ onLogout, userName, isOpen, onToggle }: AdminSidebarProps) {
  const { isDarkMode } = useDarkMode();
  const location = useLocation();

  const menuItems = [
    {
      path: "/admin-dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
      exact: true,
    },
    {
      path: "/admin-dashboard/panorama",
      icon: Map,
      label: "Panorama",
    },
    {
      path: "/admin-dashboard/denah-ruangan",
      icon: Building2,
      label: "Denah Ruangan",
    },
    {
      path: "/admin-dashboard/komentar",
      icon: MessageSquare,
      label: "Komentar",
    },
  ];

  const isActive = (path: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={onToggle}
        className={`lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg ${
          isDarkMode ? "bg-slate-800 text-white" : "bg-white text-slate-900"
        } shadow-lg`}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-40 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"} border-r w-64`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={`p-6 border-b ${isDarkMode ? "border-slate-800" : "border-slate-200"}`}>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
              Admin Panel
            </h1>
            {userName && (
              <p className={`text-sm mt-1 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                {userName}
              </p>
            )}
          </div>

          {/* Menu */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path, item.exact);

                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => {
                        if (window.innerWidth < 1024) {
                          onToggle();
                        }
                      }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        active
                          ? isDarkMode
                            ? "bg-blue-500/20 text-blue-400 font-semibold"
                            : "bg-blue-50 text-blue-600 font-semibold"
                          : isDarkMode
                          ? "text-slate-400 hover:bg-slate-800 hover:text-white"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Logout Button */}
          <div className={`p-4 border-t ${isDarkMode ? "border-slate-800" : "border-slate-200"}`}>
            <button
              onClick={onLogout}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isDarkMode
                  ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                  : "bg-red-50 text-red-600 hover:bg-red-100"
              }`}
            >
              <LogOut size={20} />
              <span className="font-semibold">Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
