import { useState, useEffect, useRef } from "react";
import { useDarkMode } from "../contexts/DarkModeContext";
import { useAudio } from "../contexts/AudioContext";
import { usePannellum } from "../hooks/usePannellum";
import { Link, useLocation } from "react-router";
import {
  ArrowLeft,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  MapPin,
  ChevronDown,
  Home,
  Loader2,
} from "lucide-react";
import { getSupabaseClient } from "/utils/supabase/client";


interface VirtualTour {
  id: string;
  name: string;
  description: string;
  panoramaUrl: string;
  thumbnailUrl?: string;
  order: number;
  showInDropdown?: boolean; // Filter untuk dropdown menu
  initialView?: {
    pitch: number;
    yaw: number;
    hfov: number;
  };
  hotspots?: Array<{
    pitch: number;
    yaw: number;
    type: "scene" | "info";
    text?: string;
    targetId?: string; // ID tour tujuan untuk navigasi
  }>;
  autoRotate?: boolean;
  compass?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

declare global {
  interface Window {
    pannellum: any;
  }
}

export function VirtualTourPage() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { isPlaying, toggleAudio } = useAudio();
  const { isLoaded: pannellumLoaded, error: pannellumError } = usePannellum();
  const location = useLocation();
  const [tours, setTours] = useState<VirtualTour[]>([]);
  const [currentTour, setCurrentTour] = useState<VirtualTour | null>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const panoramaRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const toursRef = useRef<VirtualTour[]>([]);

  // Check if coming from admin dashboard
  const fromAdmin = location.state?.from === 'admin';

  // Log error if Pannellum fails to load
  useEffect(() => {
    if (pannellumError) {
      console.error("Gagal memuat Pannellum: " + pannellumError);
    }
  }, [pannellumError]);

  useEffect(() => {
    fetchTours();
  }, []);

  useEffect(() => {
    if (currentTour && panoramaRef.current && pannellumLoaded) {
      // Small delay to ensure container has stable dimensions
      const timer = setTimeout(() => {
        initPannellum();
      }, 50);
      return () => clearTimeout(timer);
    }

    return () => {
      if (viewerRef.current) {
        try {
          viewerRef.current.destroy();
        } catch (e) {
          console.error("Error destroying viewer:", e);
        }
      }
    };
  }, [currentTour?.id, pannellumLoaded]);

  const fetchTours = async () => {
    try {
      setLoading(true);

      const supabase = getSupabaseClient();

      // Fetch dari Supabase table
      const { data, error } = await supabase
        .from("panoramas")
        .select("*")
        .order("order_index", { ascending: true });

      if (error) {
        console.error("Fetch panoramas error:", error);
        setTours([]);
        return;
      }

      if (!data || data.length === 0) {
        console.info("Belum ada data virtual tour.");
        setTours([]);
        return;
      }

      // Convert snake_case (database) to camelCase (React state)
      const mappedTours: VirtualTour[] = data.map((row: any) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        panoramaUrl: row.panorama_url,
        thumbnailUrl: row.thumbnail_url,
        order: row.order_index,
        showInDropdown: row.show_in_dropdown,
        initialView: {
          pitch: row.initial_pitch,
          yaw: row.initial_yaw,
          hfov: row.initial_hfov,
        },
        autoRotate: row.auto_rotate,
        compass: row.compass,
        hotspots: row.hotspots || [],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));

      toursRef.current = mappedTours;
      setTours(mappedTours);
      setCurrentTour(mappedTours[0]);
      console.log("✅ Loaded", mappedTours.length, "panoramas for virtual tour");

      // Debug: Show panorama data
      if (mappedTours.length > 0) {
        console.log("🔍 First panorama data:", {
          name: mappedTours[0].name,
          panoramaUrl: mappedTours[0].panoramaUrl,
          hotspots: mappedTours[0].hotspots,
          hotspotCount: mappedTours[0].hotspots?.length || 0
        });
      }
    } catch (error) {
      console.error("Fetch tours error:", error);
      setTours([]);
    } finally {
      setLoading(false);
    }
  };

  const loadScene = (targetId: string) => {
    // Always read from ref to avoid stale closure issues
    const allTours = toursRef.current;
    const targetTour = allTours.find((t) => t.id === targetId);
    if (targetTour) {
      console.log("🔄 Navigating to:", targetTour.name, "(ID:", targetId, ")");
      setCurrentTour(targetTour);
      setDropdownOpen(false);
    } else {
      console.warn("⚠️ Target tour not found for ID:", targetId, ". Available IDs:", allTours.map(t => t.id));
    }
  };

  const initPannellum = () => {
    if (!currentTour || !panoramaRef.current) return;

    // Destroy existing viewer
    if (viewerRef.current) {
      try {
        viewerRef.current.destroy();
      } catch (e) {
        console.error("Error destroying previous viewer:", e);
      }
    }

    try {
      // Prepare hot spots with click handlers
      const hotspots = (currentTour.hotspots || []).map((hs: any) => {
        // Convert X/Y percentages to Pitch/Yaw if needed (backward compatibility)
        let pitch = hs.pitch;
        let yaw = hs.yaw;

        // Check if hotspot uses old X/Y format
        if (hs.x !== undefined && hs.y !== undefined) {
          // X% (0-100) → Yaw (-180 to 180)
          yaw = parseFloat(((hs.x - 50) * 3.6).toFixed(1));
          // Y% (0-100) → Pitch (-90 to 90)
          pitch = parseFloat(((50 - hs.y) * 1.8).toFixed(1));
          console.log(`🔄 Converting hotspot: X:${hs.x}% Y:${hs.y}% → Pitch:${pitch}° Yaw:${yaw}°`);
        }

        const hotspotConfig: any = {
          pitch,
          yaw,
          type: hs.type,
          cssClass: hs.type === "scene" ? "hotspot-scene" : "hotspot-info",
        };

        // Custom tooltip: append visible icon inside the hotspot div
        hotspotConfig.createTooltipFunc = (hotSpotDiv: HTMLElement) => {
          // Build a clickable icon wrapper
          const wrapper = document.createElement('div');
          wrapper.style.cssText = 'width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:rgba(59,130,246,0.92);box-shadow:0 2px 10px rgba(0,0,0,0.35);cursor:pointer;border:2.5px solid rgba(255,255,255,0.85);transition:transform .2s;';

          // SVG icon
          const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          svg.setAttribute('width', '18');
          svg.setAttribute('height', '18');
          svg.setAttribute('viewBox', '0 0 24 24');
          svg.setAttribute('fill', 'none');
          svg.setAttribute('stroke', 'white');
          svg.setAttribute('stroke-width', '2.5');
          svg.setAttribute('stroke-linecap', 'round');
          svg.setAttribute('stroke-linejoin', 'round');

          if (hs.type === 'scene') {
            svg.innerHTML = '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>';
          } else {
            svg.innerHTML = '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>';
          }
          wrapper.appendChild(svg);

          // Tooltip label on hover
          if (hs.text) {
            const label = document.createElement('div');
            label.textContent = hs.text;
            label.style.cssText = 'position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%);padding:5px 10px;background:rgba(15,23,42,0.92);color:#fff;border-radius:6px;font-size:13px;white-space:nowrap;opacity:0;pointer-events:none;transition:opacity .2s;';
            wrapper.appendChild(label);
            wrapper.addEventListener('mouseenter', () => { label.style.opacity = '1'; wrapper.style.transform = 'scale(1.12)'; });
            wrapper.addEventListener('mouseleave', () => { label.style.opacity = '0'; wrapper.style.transform = 'scale(1)'; });
          }

          hotSpotDiv.appendChild(wrapper);
        };

        // Add click handler using Pannellum's official API
        if (hs.type === "scene" && hs.targetId) {
          hotspotConfig.clickHandlerFunc = () => {
            console.log("🖱️ Scene hotspot clicked! Target:", hs.targetId);
            loadScene(hs.targetId);
          };
        } else if (hs.type === "info") {
          hotspotConfig.clickHandlerFunc = () => {
            console.log("ℹ️ Info hotspot clicked:", hs.text || "Informasi");
          };
        }

        return hotspotConfig;
      });

      console.log("🔍 DEBUG: Hotspots to render:", hotspots);
      console.log("🔍 DEBUG: Total hotspots:", hotspots.length);
      console.log("🔍 DEBUG: Panorama URL to load:", currentTour.panoramaUrl);
      console.log("🧪 COPY URL INI DAN BUKA DI TAB BARU UNTUK TEST APAKAH BISA DIAKSES:", currentTour.panoramaUrl);
      console.log("🔍 DEBUG: Current tour data:", {
        name: currentTour.name,
        autoRotate: currentTour.autoRotate,
        compass: currentTour.compass,
        initialPitch: currentTour.initialView?.pitch,
        initialYaw: currentTour.initialView?.yaw,
        initialHfov: currentTour.initialView?.hfov
      });

      // Initialize Pannellum
      viewerRef.current = window.pannellum.viewer(panoramaRef.current, {
        type: "equirectangular",
        panorama: currentTour.panoramaUrl,
        autoLoad: true,
        autoRotate: currentTour.autoRotate ? -2 : 0,
        compass: currentTour.compass || false,
        showControls: true,
        showFullscreenCtrl: true,
        showZoomCtrl: true,
        mouseZoom: true,
        draggable: true,
        disableKeyboardCtrl: false,
        dynamicUpdate: false,
        pitch: currentTour.initialView?.pitch || 0,
        yaw: currentTour.initialView?.yaw || 0,
        hfov: currentTour.initialView?.hfov || 100,
        minHfov: 50,
        maxHfov: 120,
        hotSpots: hotspots,
      });

      console.log("✅ Pannellum initialized for:", currentTour.name);
      console.log("✅ Hotspots rendered:", hotspots.length);

      // Add event listener to check if panorama loads successfully
      viewerRef.current.on('load', () => {
        console.log("✅ Panorama image loaded successfully!");
      });

      viewerRef.current.on('error', (err: any) => {
        console.error("❌ Error loading panorama image:", err);
        console.error("❌ Panorama URL that failed:", currentTour.panoramaUrl);
      });

      viewerRef.current.on('errorcleared', () => {
        console.log("✅ Error cleared, panorama loading...");
      });
    } catch (error) {
      console.error("❌ Pannellum initialization error:", error);
      console.error("❌ Current tour data:", currentTour);
    }
  };

  const handleTourChange = (tour: VirtualTour) => {
    setCurrentTour(tour);
    setDropdownOpen(false);
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDarkMode ? "bg-slate-900" : "bg-white"
        }`}
      >
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-500" />
          <p className={`${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
            Memuat Virtual Tour...
          </p>
        </div>
      </div>
    );
  }

  if (tours.length === 0) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDarkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"
        }`}
      >
        <div className="text-center">
          <MapPin className="w-16 h-16 mx-auto mb-4 text-slate-400" />
          <h2 className="text-2xl font-bold mb-2">Belum Ada Virtual Tour</h2>
          <p className={`mb-6 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
            Silakan tambahkan data virtual tour melalui admin panel
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all"
          >
            <Home size={18} />
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden">
      {/* Pannellum Container - Full screen */}
      <div
        ref={panoramaRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          overflow: "hidden",
        }}
      />

      {/* Top Navigation Bar */}
      <div
        className={`absolute top-0 left-0 right-0 z-10 backdrop-blur-md ${
          isDarkMode ? "bg-slate-900/80" : "bg-white/80"
        } border-b ${isDarkMode ? "border-slate-800" : "border-slate-200"} transition-colors`}
      >
        <div className="container mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
          {/* Left: Back Button */}
          <Link
            to={fromAdmin ? "/admin-dashboard" : "/"}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              isDarkMode
                ? "text-white hover:bg-slate-800"
                : "text-slate-900 hover:bg-slate-100"
            }`}
          >
            <ArrowLeft size={20} />
            <span className="hidden md:inline">{fromAdmin ? "Admin Dashboard" : "Beranda"}</span>
          </Link>

          {/* Center: Location Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isDarkMode
                  ? "bg-slate-800 hover:bg-slate-700 text-white"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-900"
              }`}
            >
              <MapPin size={18} />
              <span className="font-medium">{currentTour?.name || "Pilih Lokasi"}</span>
              <ChevronDown
                size={16}
                className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown Menu - Only show tours with showInDropdown */}
            {dropdownOpen && (
              <div
                className={`absolute top-full mt-2 left-1/2 -translate-x-1/2 w-64 max-h-96 overflow-y-auto rounded-xl shadow-2xl border ${
                  isDarkMode
                    ? "bg-slate-800 border-slate-700"
                    : "bg-white border-slate-200"
                }`}
              >
                {tours.filter((tour) => tour.showInDropdown !== false).map((tour) => (
                  <button
                    key={tour.id}
                    onClick={() => handleTourChange(tour)}
                    className={`w-full px-4 py-3 text-left transition-colors border-b ${
                      isDarkMode ? "border-slate-700" : "border-slate-200"
                    } ${
                      currentTour?.id === tour.id
                        ? isDarkMode
                          ? "bg-blue-500/20 text-blue-300"
                          : "bg-blue-50 text-blue-600"
                        : isDarkMode
                        ? "hover:bg-slate-700 text-white"
                        : "hover:bg-slate-50 text-slate-900"
                    } last:border-b-0`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          currentTour?.id === tour.id
                            ? "bg-blue-500 text-white"
                            : isDarkMode
                            ? "bg-slate-700 text-slate-400"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {tour.order}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{tour.name}</div>
                        {tour.description && (
                          <div
                            className={`text-xs mt-1 line-clamp-1 ${
                              isDarkMode ? "text-slate-400" : "text-slate-600"
                            }`}
                          >
                            {tour.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-2">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode
                  ? "bg-slate-800 hover:bg-slate-700 text-yellow-400"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
              title={isDarkMode ? "Mode Siang" : "Mode Malam"}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Audio Toggle */}
            <button
              onClick={toggleAudio}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode
                  ? "bg-slate-800 hover:bg-slate-700 text-white"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-900"
              }`}
              title={isPlaying ? "Matikan Musik" : "Nyalakan Musik"}
            >
              {isPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Info Bar */}
      {currentTour && (
        <div
          className={`absolute bottom-0 left-0 right-0 z-10 backdrop-blur-md ${
            isDarkMode ? "bg-slate-900/80" : "bg-white/80"
          } border-t ${isDarkMode ? "border-slate-800" : "border-slate-200"} transition-colors`}
        >
          <div className="container mx-auto px-4 md:px-6 py-4">
            <div className="flex items-start gap-4">
              {/* Thumbnail */}
              {currentTour.thumbnailUrl && (
                <img
                  src={currentTour.thumbnailUrl}
                  alt={currentTour.name}
                  className="w-16 h-16 rounded-lg object-cover hidden md:block"
                />
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h2
                  className={`font-bold text-lg mb-1 truncate ${
                    isDarkMode ? "text-white" : "text-slate-900"
                  }`}
                >
                  {currentTour.name}
                </h2>
                {currentTour.description && (
                  <p
                    className={`text-sm line-clamp-2 ${
                      isDarkMode ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    {currentTour.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close dropdown */}
      {dropdownOpen && (
        <div
          className="fixed inset-0 z-[5]"
          onClick={() => setDropdownOpen(false)}
        />
      )}
    </div>
  );
}