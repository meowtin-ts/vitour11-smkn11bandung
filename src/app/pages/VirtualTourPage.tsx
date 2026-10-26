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
  multiResBasePath?: string;
  multiResMaxLevel?: number;
  multiResCubeResolution?: number;
  createdAt?: string;
  updatedAt?: string;
}

declare global {
  interface Window {
    pannellum: any;
  }
}

// ─── Wave Loading Screen ──────────────────────────────────────────────────────
// Day: bright ice-cream palette  |  Night: vivid but not heavy
const WAVE_STOPS_DAY = [
  { offset: "0%",   color: "#ff90b3" }, // strawberry
  { offset: "20%",  color: "#ffb347" }, // peach
  { offset: "40%",  color: "#ffe066" }, // lemon
  { offset: "60%",  color: "#72e5c0" }, // mint
  { offset: "80%",  color: "#7dd3fc" }, // sky
  { offset: "100%", color: "#c4a7e7" }, // lavender
];
const WAVE_STOPS_NIGHT = [
  { offset: "0%",   color: "#f472b6" }, // pink
  { offset: "20%",  color: "#fb923c" }, // orange
  { offset: "40%",  color: "#fbbf24" }, // amber
  { offset: "60%",  color: "#34d399" }, // emerald
  { offset: "80%",  color: "#60a5fa" }, // blue
  { offset: "100%", color: "#a78bfa" }, // violet
];

function PreloadingScreen({ pct, onSkip, isDarkMode }: { pct: number; onSkip: () => void; isDarkMode: boolean }) {
  const wavePath = useRef<SVGPathElement | null>(null);
  const metaRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number>(0);
  const progressRef = useRef(0);
  const pctRef = useRef(pct);
  const t0Ref = useRef(performance.now());

  // Keep pctRef in sync without restarting the loop
  useEffect(() => { pctRef.current = pct; }, [pct]);

  useEffect(() => {
    const run = (now: number) => {
      const t = (now - t0Ref.current) / 1000;
      const target = pctRef.current;
      progressRef.current += (target - progressRef.current) * 0.06;
      if (target >= 100 && progressRef.current > 99.5) progressRef.current = 100;

      const el = wavePath.current;
      if (el) {
        const W = 1000, top = 40, bottom = 290;
        const p = progressRef.current;
        const y = bottom - (bottom - top) * p / 100;
        const amp = 26 * Math.sin(Math.PI * Math.min(p, 100) / 100) + 4;
        let d = `M0 ${y}`;
        for (let x = 0; x <= W; x += 20) {
          const yy = y + Math.sin(x / 110 + t * 2.2) * amp + Math.sin(x / 47 - t * 1.4) * amp * 0.25;
          d += ` L${x} ${yy.toFixed(1)}`;
        }
        d += ` L${W} 320 L0 320 Z`;
        el.setAttribute("d", d);
      }

      if (metaRef.current) {
        metaRef.current.textContent = `loading...  ${Math.round(progressRef.current)} %`;
      }
      rafRef.current = requestAnimationFrame(run);
    };
    rafRef.current = requestAnimationFrame(run);
    return () => cancelAnimationFrame(rafRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stops = isDarkMode ? WAVE_STOPS_NIGHT : WAVE_STOPS_DAY;

  return (
    <div
      className="fixed inset-0 z-50 select-none overflow-hidden flex items-center justify-center"
      style={{ background: isDarkMode ? "#0f1117" : "#eef4ff", transition: "background 0.4s ease" }}
    >
      <div style={{ width: "min(82vw, 1400px)", position: "relative" }}>
        <svg
          viewBox="0 0 1000 300"
          style={{ display: "block", width: "100%", height: "auto", overflow: "visible" }}
          role="img"
          aria-label="vitour11, memuat"
        >
          <defs>
            <linearGradient id="fill-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              {stops.map((s) => (
                <stop key={s.offset} offset={s.offset} stopColor={s.color} />
              ))}
            </linearGradient>
            <clipPath id="txt-clip">
              <text
                fontFamily="'Archivo Black', 'Arial Black', Impact, sans-serif"
                fontSize="300"
                letterSpacing="-6"
                x="0"
                y="268"
                textLength="1000"
                lengthAdjust="spacingAndGlyphs"
              >
                vitour11
              </text>
            </clipPath>
          </defs>
          {/* Ghost text */}
          <text
            fontFamily="'Archivo Black', 'Arial Black', Impact, sans-serif"
            fontSize="300"
            letterSpacing="-6"
            x="0"
            y="268"
            textLength="1000"
            lengthAdjust="spacingAndGlyphs"
            fill={isDarkMode ? "#1a1030" : "#dde8f8"}
          >
            vitour11
          </text>
          {/* Colorful wave fill clipped to text shape */}
          <g clipPath="url(#txt-clip)">
            <path ref={wavePath} fill="url(#fill-grad)" d="" />
          </g>
        </svg>

        {/* loading % — right-aligned below SVG */}
        <div
          ref={metaRef}
          style={{
            position: "absolute",
            right: 0,
            top: "100%",
            marginTop: "8px",
            color: isDarkMode ? "rgba(167,139,250,0.55)" : "rgba(255,144,179,0.65)",
            fontFamily: "'Plus Jakarta Sans', 'Helvetica Neue', Arial, sans-serif",
            fontSize: "clamp(13px, 1.2vw, 20px)",
            fontWeight: 500,
            whiteSpace: "pre",
            letterSpacing: "0.08em",
          }}
        >
          loading...  0 %
        </div>
      </div>

      {/* Skip */}
      <button
        onClick={onSkip}
        style={{
          position: "absolute",
          bottom: "2rem",
          right: "2rem",
          color: isDarkMode ? "rgba(167,139,250,0.3)" : "rgba(255,144,179,0.4)",
          fontSize: "0.75rem",
          letterSpacing: "0.2em",
          textTransform: "lowercase",
          background: "none",
          border: "none",
          cursor: "pointer",
          transition: "color 0.2s",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
        onMouseEnter={e => (e.currentTarget.style.color = isDarkMode ? "rgba(167,139,250,0.75)" : "rgba(255,144,179,0.85)")}
        onMouseLeave={e => (e.currentTarget.style.color = isDarkMode ? "rgba(167,139,250,0.3)" : "rgba(255,144,179,0.4)")}
      >
        skip
      </button>
    </div>
  );
}

export function VirtualTourPage() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { isPlaying, toggleAudio } = useAudio();
  const { isLoaded: pannellumLoaded, error: pannellumError } = usePannellum();
  const location = useLocation();
  const [tours, setTours] = useState<VirtualTour[]>([]);
  const [currentTour, setCurrentTour] = useState<VirtualTour | null>(null);
  const [loading, setLoading] = useState(true);
  const [preloading, setPreloading] = useState(false);
  const [preloadedCount, setPreloadedCount] = useState(0);
  const [totalToPreload, setTotalToPreload] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const panoramaRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const toursRef = useRef<VirtualTour[]>([]);
  // Keep strong refs to prevent browser GC of preloaded images
  const preloadedImagesRef = useRef<HTMLImageElement[]>([]);

  // Check if coming from admin dashboard
  const fromAdmin = location.state?.from === 'admin';

  useEffect(() => {
    if (pannellumError) console.error("Gagal memuat Pannellum:", pannellumError);
  }, [pannellumError]);

  useEffect(() => {
    fetchTours();
  }, []);

  useEffect(() => {
    // Tunggu sampai loading screen selesai: panorama pertama baru diinisialisasi
    // setelah container benar-benar tampil & ukurannya stabil.
    if (!currentTour || !panoramaRef.current || !pannellumLoaded || preloading) return;

    const timer = setTimeout(() => {
      initPannellum();
    }, 50);

    return () => clearTimeout(timer);
  }, [currentTour?.id, pannellumLoaded, preloading]);

  // Destroy viewer hanya saat halaman ditinggalkan
  useEffect(() => {
    return () => {
      if (viewerRef.current) {
        try {
          viewerRef.current.destroy();
        } catch (e) {
          console.error("Error destroying viewer:", e);
        }
        viewerRef.current = null;
      }
    };
  }, []);

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
        setLoading(false);
        return;
      }

      if (!data || data.length === 0) {
        console.info("Belum ada data virtual tour.");
        setTours([]);
        setLoading(false);
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
        multiResBasePath: row.multi_res_base_path || undefined,
        multiResMaxLevel: row.multi_res_max_level || undefined,
        multiResCubeResolution: row.multi_res_cube_resolution || undefined,
        hotspots: row.hotspots || [],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));

      toursRef.current = mappedTours;
      setTours(mappedTours);
      setCurrentTour(mappedTours[0]);
      setLoading(false);
      // Start preloading all panoramas right after data is ready
      await preloadAllPanoramas(mappedTours);
    } catch (error) {
      console.error("Fetch tours error:", error);
      setTours([]);
      setLoading(false);
    }
  };

  const preloadAllPanoramas = async (tourList: VirtualTour[]) => {
    const urls = tourList
      .map((t) => t.panoramaUrl)
      .filter((url): url is string => Boolean(url));

    if (urls.length === 0) return;

    setPreloading(true);
    setTotalToPreload(urls.length);
    setPreloadedCount(0);
    preloadedImagesRef.current = [];

    await Promise.allSettled(
      urls.map(
        (url) =>
          new Promise<void>((resolve) => {
            const img = new Image();
            preloadedImagesRef.current.push(img);
            img.onload = () => {
              setPreloadedCount((prev) => prev + 1);
              resolve();
            };
            img.onerror = () => {
              setPreloadedCount((prev) => prev + 1);
              resolve();
            };
            img.src = url;
          })
      )
    );

    setPreloading(false);
  };

  const loadScene = (targetId: string) => {
    const targetTour = toursRef.current.find((t) => t.id === targetId);
    if (targetTour) {
      setCurrentTour(targetTour);
      setDropdownOpen(false);
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

    if (typeof window.pannellum?.viewer !== "function") {
      console.error("Pannellum belum siap: window.pannellum tidak tersedia");
      return;
    }

    try {
      // Prepare hot spots with click handlers
      const hotspots = (currentTour.hotspots || []).map((hs: any) => {
        // Convert X/Y percentages to Pitch/Yaw if needed (backward compatibility)
        let pitch = hs.pitch;
        let yaw = hs.yaw;

        // Check if hotspot uses old X/Y format
        if (hs.x !== undefined && hs.y !== undefined) {
          yaw = parseFloat(((hs.x - 50) * 3.6).toFixed(1));
          pitch = parseFloat(((50 - hs.y) * 1.8).toFixed(1));
        }

        const hotspotConfig: any = {
          pitch,
          yaw,
          type: hs.type,
          cssClass: hs.type === "scene" ? "hotspot-scene" : "hotspot-info",
        };

        // Custom tooltip: append visible icon inside the hotspot div
        hotspotConfig.createTooltipFunc = (hotSpotDiv: HTMLElement) => {
          // Color: Scene = Blue, Info = Green
          const isScene = hs.type === 'scene';
          const bgColor = isScene ? 'rgba(59,130,246,0.92)' : 'rgba(34,197,94,0.92)';
          const glowColor = isScene ? 'rgba(59,130,246,0.4)' : 'rgba(34,197,94,0.4)';

          // Build a clickable icon wrapper
          const wrapper = document.createElement('div');
          wrapper.style.cssText = `width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:${bgColor};box-shadow:0 2px 10px ${glowColor};cursor:pointer;border:2.5px solid rgba(255,255,255,0.85);transition:transform .2s;`;

          // SVG icon
          const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          svg.setAttribute('width', '12');
          svg.setAttribute('height', '12');
          svg.setAttribute('viewBox', '0 0 24 24');
          svg.setAttribute('fill', 'none');
          svg.setAttribute('stroke', 'white');
          svg.setAttribute('stroke-width', '2.5');
          svg.setAttribute('stroke-linecap', 'round');
          svg.setAttribute('stroke-linejoin', 'round');

          if (isScene) {
            // Biru: MapPin icon untuk navigasi antar panorama
            svg.innerHTML = '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>';
          } else {
            // Hijau: Compass/Navigation icon untuk info
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
            loadScene(hs.targetId);
          };
        } else if (hs.type === "info") {
          hotspotConfig.clickHandlerFunc = () => {
            console.log("ℹ️ Info hotspot clicked:", hs.text || "Informasi");
          };
        }

        return hotspotConfig;
      });

      // Shared viewer options
      const sharedConfig = {
        autoLoad: true,
        autoRotate: currentTour.autoRotate ? -2 : 0,
        compass: currentTour.compass || false,
        showControls: true,
        showFullscreenCtrl: true,
        showZoomCtrl: true,
        mouseZoom: true,
        draggable: true,
        disableKeyboardCtrl: false,
        pitch: currentTour.initialView?.pitch || 0,
        yaw: currentTour.initialView?.yaw || 0,
        hfov: currentTour.initialView?.hfov || 100,
        minHfov: 50,
        maxHfov: 120,
        hotSpots: hotspots,
      };

      viewerRef.current = window.pannellum.viewer(panoramaRef.current, {
        type: "equirectangular",
        panorama: currentTour.panoramaUrl,
        ...sharedConfig,
      });
    } catch (error) {
      console.error("Pannellum initialization error:", error);
    }
  };

  const handleTourChange = (tour: VirtualTour) => {
    setCurrentTour(tour);
    setDropdownOpen(false);
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: isDarkMode ? "#0f1117" : "#eef4ff", transition: "background 0.4s ease" }}
      >
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4" style={{ color: "#3b82f6" }} />
          <p style={{ color: isDarkMode ? "rgba(148,163,184,0.5)" : "rgba(71,100,140,0.6)", fontSize: "0.8rem", letterSpacing: "0.1em", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            menghubungkan ke server...
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

  const pct = totalToPreload > 0 ? Math.round((preloadedCount / totalToPreload) * 100) : 0;

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden">
      {preloading && (
        <PreloadingScreen pct={pct} onSkip={() => setPreloading(false)} isDarkMode={isDarkMode} />
      )}

      {/* Pannellum Container - Full screen */}
      <div ref={panoramaRef} className="absolute inset-0 w-full h-full" />

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