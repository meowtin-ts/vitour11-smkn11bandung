import { useState, useEffect } from "react";
import { useDarkMode } from "../contexts/DarkModeContext";
import { Link } from "react-router";
import {
  Map, MessageSquare, TrendingUp, Users, Home, Eye,
  Building2, ExternalLink,
} from "lucide-react";
import { getSupabaseClient } from "/utils/supabase/client";

interface Stats {
  panoramas: number;
  komentar: number;
  ruangan: number;
}

export function AdminDashboardHome() {
  const { isDarkMode } = useDarkMode();
  const [stats, setStats] = useState<Stats>({ panoramas: 0, komentar: 0, ruangan: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const supabase = getSupabaseClient();
      const [
        { count: panoramaCount },
        { count: komentarCount },
        { count: ruanganCount },
      ] = await Promise.all([
        supabase.from("panoramas").select("*", { count: "exact", head: true }),
        supabase.from("komentar").select("*", { count: "exact", head: true }),
        supabase.from("denah_ruangan").select("*", { count: "exact", head: true }),
      ]);
      setStats({
        panoramas: panoramaCount || 0,
        komentar: komentarCount || 0,
        ruangan: ruanganCount || 0,
      });
    } catch (error) {
      console.error("Fetch stats error:", error);
      setStats({ panoramas: 0, komentar: 0, ruangan: 0 });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Panorama",
      value: stats.panoramas,
      icon: Map,
      color: "blue",
      link: "/admin-dashboard/panorama",
    },
    {
      title: "Data Ruangan",
      value: stats.ruangan,
      icon: Building2,
      color: "cyan",
      link: "/admin-dashboard/denah-ruangan",
    },
    {
      title: "Komentar",
      value: stats.komentar,
      icon: MessageSquare,
      color: "pink",
      link: "/admin-dashboard/komentar",
    },
  ];

  const colorMap: Record<string, { bg: string; text: string; icon: string }> = {
    blue: {
      bg: isDarkMode ? "bg-blue-500/10" : "bg-blue-50",
      text: isDarkMode ? "text-blue-400" : "text-blue-600",
      icon: isDarkMode ? "bg-blue-500/20" : "bg-blue-100",
    },
    cyan: {
      bg: isDarkMode ? "bg-cyan-500/10" : "bg-cyan-50",
      text: isDarkMode ? "text-cyan-400" : "text-cyan-600",
      icon: isDarkMode ? "bg-cyan-500/20" : "bg-cyan-100",
    },
    pink: {
      bg: isDarkMode ? "bg-pink-500/10" : "bg-pink-50",
      text: isDarkMode ? "text-pink-400" : "text-pink-600",
      icon: isDarkMode ? "bg-pink-500/20" : "bg-pink-100",
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className={isDarkMode ? "text-slate-400" : "text-slate-600"}>Memuat statistik...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
            Dashboard
          </h1>
          <p className={isDarkMode ? "text-slate-400" : "text-slate-600"}>
            Overview konten website SMK Negeri 11 Bandung
          </p>
        </div>
        <Link
          to="/"
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            isDarkMode
              ? "bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30"
              : "bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200"
          }`}
        >
          <Home size={18} />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>

      {/* Overview Konten — 3 stat cards */}
      <div>
        <h2 className={`text-sm font-semibold uppercase tracking-widest mb-3 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
          Overview Konten
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {statCards.map((card) => {
            const Icon = card.icon;
            const colors = colorMap[card.color];
            return (
              <Link
                key={card.title}
                to={card.link}
                className={`p-6 rounded-2xl border transition-all hover:scale-105 ${
                  isDarkMode
                    ? "bg-slate-900 border-slate-800 hover:border-slate-700"
                    : "bg-white border-slate-200 hover:border-slate-300"
                } ${colors.bg}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className={`text-sm font-medium mb-1 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                      {card.title}
                    </p>
                    <p className={`text-3xl font-bold ${colors.text}`}>{card.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${colors.icon}`}>
                    <Icon className={colors.text} size={24} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className={`p-6 rounded-2xl border ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
        <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { to: "/admin-dashboard/panorama", icon: Map, color: "text-blue-500", label: "Kelola Panorama", internal: true },
            { to: "/admin-dashboard/denah-ruangan", icon: Building2, color: "text-cyan-500", label: "Kelola Denah Ruangan", internal: true },
            { to: "/admin-dashboard/komentar", icon: MessageSquare, color: "text-pink-500", label: "Kelola Komentar", internal: true },
            { to: "/virtual-tour", icon: Eye, color: "text-indigo-500", label: "Lihat Virtual Tour", internal: false },
            { to: "/denah-interaktif", icon: ExternalLink, color: "text-emerald-500", label: "Lihat Denah Interaktif", internal: false },
          ].map(({ to, icon: Icon, color, label, internal }) => (
            <Link
              key={label}
              to={to}
              target={internal ? undefined : "_blank"}
              className={`p-4 rounded-xl border transition-colors flex flex-col gap-2 ${
                isDarkMode
                  ? "bg-slate-800 border-slate-700 hover:bg-slate-700"
                  : "bg-slate-50 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <Icon className={color} size={22} />
              <p className={`text-sm font-semibold leading-snug ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                {label}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Statistik Konten */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`p-6 rounded-2xl border ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
          <div className="flex items-center gap-3 mb-5">
            <TrendingUp className="text-green-500" size={22} />
            <h3 className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}>
              Statistik Konten
            </h3>
          </div>
          <div className="space-y-3">
            {[
              { label: "Total Panorama", value: stats.panoramas, color: "bg-blue-500" },
              { label: "Data Ruangan (Denah)", value: stats.ruangan, color: "bg-cyan-500" },
              { label: "Total Komentar", value: stats.komentar, color: "bg-pink-500" },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>{label}</span>
                  <span className={`text-sm font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}>{value}</span>
                </div>
                <div className={`h-1.5 rounded-full ${isDarkMode ? "bg-slate-800" : "bg-slate-100"}`}>
                  <div
                    className={`h-1.5 rounded-full ${color} transition-all`}
                    style={{ width: `${Math.min(100, (value / (Math.max(stats.panoramas, stats.ruangan, stats.komentar) || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`p-6 rounded-2xl border ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
          <div className="flex items-center gap-3 mb-4">
            <Users className="text-blue-500" size={22} />
            <h3 className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}>Informasi</h3>
          </div>
          <p className={`text-sm leading-relaxed ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
            Selamat datang di Admin Panel SMK Negeri 11 Bandung. Kelola konten virtual tour, denah ruangan interaktif, dan komentar pengunjung dari dashboard ini.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className={`p-3 rounded-xl text-center ${isDarkMode ? "bg-slate-800" : "bg-slate-50"}`}>
              <p className={`text-2xl font-bold text-blue-500`}>{stats.panoramas + stats.ruangan}</p>
              <p className={`text-xs mt-0.5 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>Total Konten</p>
            </div>
            <div className={`p-3 rounded-xl text-center ${isDarkMode ? "bg-slate-800" : "bg-slate-50"}`}>
              <p className={`text-2xl font-bold text-pink-500`}>{stats.komentar}</p>
              <p className={`text-xs mt-0.5 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>Ulasan Masuk</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
