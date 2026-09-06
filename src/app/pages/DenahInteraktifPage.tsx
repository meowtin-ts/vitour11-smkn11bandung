import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Building2,
  Ruler,
  CheckCircle2,
  Images,
  Loader2,
} from "lucide-react";
import { useDarkMode } from "../contexts/DarkModeContext";
import { useAudio } from "../contexts/AudioContext";
import { AnimatedFloatingShapes } from "../components/AnimatedFloatingShapes";
import { getSupabaseClient } from "/utils/supabase/client";
import { FloorPlanChart, type FloorRoom } from "../components/FloorPlanChart";
import denahImage from "../../imports/Denah_SMKN_11_BANDUNG.jpeg";

// ── Types ──────────────────────────────────────────────────────────────
type View = "intro" | "lantai-atas" | "lantai-bawah";

interface DbRoomFoto {
  id: string;
  ruangan_id: string;
  foto_url: string;
  urutan: number;
}

// ── Top bar ────────────────────────────────────────────────────────────
function DenahTopBar({
  onBack,
  backLabel,
}: {
  onBack?: () => void;
  backLabel?: string;
}) {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { isPlaying, toggleAudio } = useAudio();
  const navigate = useNavigate();

  const handleBack = onBack ?? (() => navigate("/"));

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b transition-colors ${
        isDarkMode
          ? "bg-slate-900/80 border-slate-800"
          : "bg-white/80 border-slate-200"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
        <button
          onClick={handleBack}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
            isDarkMode
              ? "text-white hover:bg-slate-800"
              : "text-slate-900 hover:bg-slate-100"
          }`}
        >
          <ArrowLeft size={20} />
          <span className="hidden md:inline">{backLabel ?? "Kembali"}</span>
        </button>
        <div className="flex items-center gap-2">
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
  );
}

// ── Stair icons ────────────────────────────────────────────────────────
function IconStairsUp({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20 L4 15 L9 15 L9 10 L14 10 L14 5 L20 5" />
      <polyline points="16 5 20 5 20 9" />
    </svg>
  );
}

function IconStairsDown({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4 L10 4 L10 9 L15 9 L15 14 L20 14 L20 20" />
      <polyline points="16 20 20 20 20 16" />
    </svg>
  );
}

// ── Zoomable image for intro view ──────────────────────────────────────
function ZoomableImage() {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  // Use refs to avoid stale closures in mouse event handlers
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const panRef = useRef({ x: 0, y: 0 });
  const { isDarkMode } = useDarkMode();

  const clampZoom = (z: number) => Math.min(Math.max(z, 1), 5);

  const resetPan = () => {
    setPan({ x: 0, y: 0 });
    panRef.current = { x: 0, y: 0 };
  };

  const handleWheel = useCallback((e: Event) => {
    e.preventDefault();
    const we = e as globalThis.WheelEvent;
    setZoom((z) => {
      const next = clampZoom(z - we.deltaY * 0.001);
      if (next <= 1) {
        setPan({ x: 0, y: 0 });
        panRef.current = { x: 0, y: 0 };
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    document.addEventListener("webkitfullscreenchange", handler);
    return () => {
      document.removeEventListener("fullscreenchange", handler);
      document.removeEventListener("webkitfullscreenchange", handler);
    };
  }, []);

  const onMouseDown = (e: ReactMouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    if (zoom <= 1) return;
    isDraggingRef.current = true;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - panRef.current.x,
      y: e.clientY - panRef.current.y,
    };
  };

  const onMouseMove = (e: ReactMouseEvent) => {
    if (!isDraggingRef.current) return;
    const next = {
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    };
    panRef.current = next;
    setPan(next);
  };

  const stopDrag = () => {
    isDraggingRef.current = false;
    setIsDragging(false);
  };

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!document.fullscreenElement) {
      el?.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  };

  const handleZoomIn = () => setZoom((z) => clampZoom(z + 0.4));
  const handleZoomOut = () => {
    setZoom((z) => {
      const next = clampZoom(z - 0.4);
      if (next <= 1) resetPan();
      return next;
    });
  };

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      className={`denah-fullscreen-container absolute inset-0 overflow-hidden select-none ${
        isDarkMode ? "bg-slate-900" : "bg-white"
      } ${isDragging ? "cursor-grabbing" : zoom > 1 ? "cursor-grab" : "cursor-default"}`}
      style={{ outline: "none" }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={stopDrag}
      onMouseLeave={stopDrag}
    >
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: "center center",
          transition: isDragging ? "none" : "transform 0.12s ease-out",
        }}
      >
        <img
          src={denahImage}
          alt="Denah SMKN 11 Bandung"
          className="max-w-full max-h-full object-contain pointer-events-none"
          draggable={false}
        />
      </div>
      <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
        {[
          { icon: ZoomIn,  fn: handleZoomIn,      title: "Zoom in" },
          { icon: ZoomOut, fn: handleZoomOut,     title: "Zoom out" },
          { icon: isFullscreen ? Minimize2 : Maximize2, fn: toggleFullscreen, title: "Fullscreen" },
        ].map(({ icon: Icon, fn, title }) => (
          <button
            key={title}
            onClick={(e) => { e.stopPropagation(); fn(); }}
            title={title}
            className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-lg transition-all hover:scale-110 border ${
              isDarkMode
                ? "bg-slate-700/90 hover:bg-slate-600 text-white border-slate-600"
                : "bg-white/90 hover:bg-white text-slate-700 border-slate-200"
            }`}
          >
            <Icon size={15} />
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Floor row button ───────────────────────────────────────────────────
function FloorRow({
  title,
  isUp,
  accentColor,
  isDarkMode,
  onClick,
}: {
  title: string;
  isUp: boolean;
  accentColor: string;
  isDarkMode: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "tween", ease: "easeOut", duration: 0.18 }}
      className={`group w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 transition-colors text-left ${
        isDarkMode
          ? "bg-slate-800/70 border-slate-700 hover:border-blue-500/60 hover:bg-slate-800"
          : "bg-white border-slate-200 hover:border-blue-400/70 hover:bg-blue-50/30"
      }`}
    >
      <div
        className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: `${accentColor}22` }}
      >
        <span style={{ color: accentColor }}>
          {isUp ? <IconStairsUp size={20} /> : <IconStairsDown size={20} />}
        </span>
      </div>
      <span className={`flex-1 font-semibold text-base ${isDarkMode ? "text-white" : "text-slate-900"}`}>
        {title}
      </span>
      <ChevronRight
        size={18}
        className={`transition-transform group-hover:translate-x-1 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}
      />
    </motion.button>
  );
}

// ── Room detail — halaman mandiri 50/50 ───────────────────────────────
function RoomDetailPage({
  room,
  onBack,
  isDarkMode,
}: {
  room: FloorRoom;
  onBack: () => void;
  isDarkMode: boolean;
}) {
  const [photos, setPhotos] = useState<DbRoomFoto[]>([]);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [loadingPhotos, setLoadingPhotos] = useState(true);

  useEffect(() => {
    getSupabaseClient()
      .from("denah_ruangan_foto")
      .select("*")
      .eq("ruangan_id", room.id)
      .order("urutan")
      .then(({ data }) => {
        setPhotos(data ?? []);
        setLoadingPhotos(false);
      });
  }, [room.id]);

  useEffect(() => {
    if (photos.length <= 1) return;
    const t = setInterval(() => setPhotoIdx((i) => (i + 1) % photos.length), 3500);
    return () => clearInterval(t);
  }, [photos.length]);

  const prevPhoto = () => setPhotoIdx((i) => (i - 1 + photos.length) % photos.length);
  const nextPhoto = () => setPhotoIdx((i) => (i + 1) % photos.length);

  const kondisiColor = (k?: string) => {
    if (!k) return "";
    if (k === "Baik") return "text-emerald-500";
    if (k === "Rusak Ringan") return "text-amber-500";
    if (k === "Rusak Sedang") return "text-orange-500";
    return "text-red-500";
  };

  const kondisiBg = (k?: string) => {
    if (!k) return isDarkMode ? "bg-slate-800" : "bg-slate-50";
    if (k === "Baik") return isDarkMode ? "bg-emerald-500/10" : "bg-emerald-50";
    if (k === "Rusak Ringan") return isDarkMode ? "bg-amber-500/10" : "bg-amber-50";
    if (k === "Rusak Sedang") return isDarkMode ? "bg-orange-500/10" : "bg-orange-50";
    return isDarkMode ? "bg-red-500/10" : "bg-red-50";
  };

  return (
    <>
      <DenahTopBar onBack={onBack} backLabel="Kembali ke Denah" />
      <motion.div
        initial={{ opacity: 0, x: 32 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 32 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        className="flex flex-col lg:flex-row"
        style={{ height: "calc(100vh - 56px)", marginTop: 56, overflow: "hidden" }}
      >
        {/* ── LEFT: Informasi ruangan ── */}
        <div
          className={`flex-1 overflow-y-auto ${
            isDarkMode
              ? "bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/20"
              : "bg-gradient-to-br from-slate-50 via-white to-blue-50/30"
          }`}
        >
          <div className="max-w-lg mx-auto px-8 py-10 flex flex-col gap-6">
            {/* Nama + badge */}
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                  room.lantai === "atas"
                    ? isDarkMode ? "bg-violet-500/15 text-violet-400" : "bg-violet-50 text-violet-600"
                    : isDarkMode ? "bg-cyan-500/15 text-cyan-400" : "bg-cyan-50 text-cyan-600"
                }`}>
                  {room.lantai === "atas" ? "Lantai Atas" : "Lantai Bawah"}
                </span>
                {room.kode_ruang && (
                  <span className={`text-xs font-mono px-2.5 py-1 rounded-lg ${
                    isDarkMode ? "bg-blue-500/15 text-blue-400" : "bg-blue-50 text-blue-600"
                  }`}>
                    {room.kode_ruang}
                  </span>
                )}
              </div>
              <h1 className={`text-3xl font-extrabold leading-tight ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                {room.nama_ruangan}
              </h1>
            </div>

            {/* Info cards */}
            <div className="grid grid-cols-2 gap-3">
              {room.gedung && (
                <div className={`flex items-start gap-3 p-4 rounded-2xl border ${
                  isDarkMode ? "bg-slate-800/70 border-slate-700" : "bg-white border-slate-200 shadow-sm"
                }`}>
                  <Building2 size={16} className={`mt-0.5 shrink-0 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`} />
                  <div>
                    <p className={`text-[0.6rem] font-bold uppercase tracking-widest ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>Gedung</p>
                    <p className={`text-sm font-semibold mt-1 ${isDarkMode ? "text-white" : "text-slate-800"}`}>{room.gedung}</p>
                  </div>
                </div>
              )}
              {room.ukuran_ruangan && (
                <div className={`flex items-start gap-3 p-4 rounded-2xl border ${
                  isDarkMode ? "bg-slate-800/70 border-slate-700" : "bg-white border-slate-200 shadow-sm"
                }`}>
                  <Ruler size={16} className={`mt-0.5 shrink-0 ${isDarkMode ? "text-cyan-400" : "text-cyan-600"}`} />
                  <div>
                    <p className={`text-[0.6rem] font-bold uppercase tracking-widest ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>Ukuran</p>
                    <p className={`text-sm font-semibold mt-1 ${isDarkMode ? "text-white" : "text-slate-800"}`}>{room.ukuran_ruangan}</p>
                  </div>
                </div>
              )}
              {room.luas_ruangan != null && (
                <div className={`flex items-start gap-3 p-4 rounded-2xl border ${
                  isDarkMode ? "bg-slate-800/70 border-slate-700" : "bg-white border-slate-200 shadow-sm"
                }`}>
                  <Ruler size={16} className={`mt-0.5 shrink-0 ${isDarkMode ? "text-violet-400" : "text-violet-600"}`} />
                  <div>
                    <p className={`text-[0.6rem] font-bold uppercase tracking-widest ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>Luas</p>
                    <p className={`text-sm font-semibold mt-1 ${isDarkMode ? "text-white" : "text-slate-800"}`}>{room.luas_ruangan} m²</p>
                  </div>
                </div>
              )}
              {room.kondisi_ruangan && (
                <div className={`flex items-start gap-3 p-4 rounded-2xl border ${
                  kondisiBg(room.kondisi_ruangan)
                } ${isDarkMode ? "border-slate-700" : "border-slate-200"}`}>
                  <CheckCircle2 size={16} className={`mt-0.5 shrink-0 ${kondisiColor(room.kondisi_ruangan)}`} />
                  <div>
                    <p className={`text-[0.6rem] font-bold uppercase tracking-widest ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>Kondisi</p>
                    <p className={`text-sm font-semibold mt-1 ${kondisiColor(room.kondisi_ruangan)}`}>{room.kondisi_ruangan}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Inventaris */}
            {(room.papan_tulis != null || room.meja != null || room.kursi != null || room.komputer != null || room.kursi_kampus != null || room.cctv != null || room.proyektor != null || room.ac != null || room.kipas_angin != null || room.televisi != null) && (
              <div className={`p-5 rounded-2xl border ${
                isDarkMode ? "bg-slate-800/60 border-slate-700" : "bg-white border-slate-200 shadow-sm"
              }`}>
                <p className={`text-[0.6rem] font-bold uppercase tracking-widest mb-3 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
                  Inventaris
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Papan Tulis", val: room.papan_tulis },
                    { label: "Meja",        val: room.meja },
                    { label: "Kursi",       val: room.kursi },
                    { label: "Komputer",    val: room.komputer },
                    { label: "Kursi Kampus",val: room.kursi_kampus },
                    { label: "CCTV",        val: room.cctv },
                    { label: "Proyektor",   val: room.proyektor },
                    { label: "AC",          val: room.ac },
                    { label: "Kipas Angin", val: room.kipas_angin },
                    { label: "Televisi",    val: room.televisi },
                  ].filter(({ val }) => val != null).map(({ label, val }) => (
                    <div key={label} className={`flex justify-between items-center px-3 py-2 rounded-xl ${
                      isDarkMode ? "bg-slate-700/50" : "bg-slate-50"
                    }`}>
                      <span className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>{label}</span>
                      <span className={`text-sm font-bold ${isDarkMode ? "text-white" : "text-slate-800"}`}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Deskripsi */}
            {room.deskripsi && (
              <div className={`p-5 rounded-2xl border ${
                isDarkMode ? "bg-slate-800/60 border-slate-700" : "bg-white border-slate-200 shadow-sm"
              }`}>
                <p className={`text-[0.6rem] font-bold uppercase tracking-widest mb-2 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
                  Deskripsi
                </p>
                <p className={`text-sm leading-relaxed ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
                  {room.deskripsi}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Foto carousel ── */}
        <div className={`relative flex-1 min-h-[45vh] lg:min-h-0 flex flex-col ${
          isDarkMode ? "bg-slate-800" : "bg-slate-100"
        }`}>
          <div className="relative flex-1 overflow-hidden">
            {loadingPhotos ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 size={32} className="animate-spin text-blue-500" />
              </div>
            ) : photos.length > 0 ? (
              <>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={photoIdx}
                    className="absolute inset-0 flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <img
                      src={photos[photoIdx].foto_url}
                      alt={room.nama_ruangan}
                      className="max-w-full max-h-full object-contain rounded-xl shadow-lg"
                      draggable={false}
                    />
                  </motion.div>
                </AnimatePresence>
                {photos.length > 1 && (
                  <>
                    <button
                      onClick={prevPhoto}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors z-10"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={nextPhoto}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors z-10"
                    >
                      <ChevronRight size={18} />
                    </button>
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
                      {photos.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setPhotoIdx(i)}
                          className={`h-1.5 rounded-full transition-all ${
                            i === photoIdx ? "bg-white w-6" : "bg-white/50 w-1.5"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/50 text-white text-xs z-10">
                      {photoIdx + 1} / {photos.length}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <Images size={40} className={isDarkMode ? "text-slate-600" : "text-slate-400"} />
                <span className={`text-sm ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
                  Belum ada foto
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}

// ── Floor plan view ────────────────────────────────────────────────────
function FloorPlanView({
  floor,
  isDarkMode,
  onRoomClick,
}: {
  floor: "lantai-atas" | "lantai-bawah";
  isDarkMode: boolean;
  onRoomClick: (room: FloorRoom) => void;
}) {
  const [rooms, setRooms] = useState<FloorRoom[]>([]);
  const [loading, setLoading] = useState(true);

  const floorKey = floor === "lantai-atas" ? "atas" : "bawah";
  const floorLabel = floor === "lantai-atas" ? "Lantai Atas" : "Lantai Bawah";

  useEffect(() => {
    setLoading(true);
    getSupabaseClient()
      .from("denah_ruangan")
      .select("id, nama_ruangan, kode_ruang, gedung, lantai, ukuran_ruangan, luas_ruangan, kondisi_ruangan, deskripsi, slot_id, papan_tulis, meja, kursi, komputer, kursi_kampus, cctv, proyektor, ac, kipas_angin, televisi")
      .eq("lantai", floorKey)
      .then(({ data, error }) => {
        if (!error && data) setRooms(data as FloorRoom[]);
        setLoading(false);
      });
  }, [floorKey]);

  return (
    <div className={`min-h-screen ${isDarkMode ? "bg-slate-950" : "bg-slate-100"}`}>
      <div
        className={`sticky top-14 z-30 flex items-center gap-3 px-6 py-3 border-b ${
          isDarkMode
            ? "bg-slate-900/95 backdrop-blur-md border-slate-800"
            : "bg-white/95 backdrop-blur-md border-slate-200"
        }`}
      >
        <span className={`text-sm font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}>
          {floorLabel}
        </span>
        <span className={isDarkMode ? "text-slate-600" : "text-slate-300"}>·</span>
        <span className={`text-xs ${isDarkMode ? "text-slate-500" : "text-slate-500"}`}>
          <span className="inline-block w-3 h-3 bg-blue-600 rounded-sm mr-1.5 align-middle" />
          Hover ruangan untuk melihat nama · klik untuk detail
        </span>
        <span className={isDarkMode ? "text-slate-600" : "text-slate-300"}>·</span>
        <span className={`text-xs ${isDarkMode ? "text-slate-500" : "text-slate-500"}`}>
          <span className={`inline-block w-3 h-3 rounded-sm mr-1.5 align-middle ${isDarkMode ? "bg-slate-700" : "bg-slate-300"}`} />
          Lantai lain
        </span>
      </div>

      <div className="p-4 lg:p-8">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={36} className="animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <FloorPlanChart
              floor={floorKey}
              rooms={rooms}
              mode="visitor"
              isDarkMode={isDarkMode}
              onRoomClick={onRoomClick}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────
export function DenahInteraktifPage() {
  const [view, setView] = useState<View>("intro");
  const [selectedRoom, setSelectedRoom] = useState<FloorRoom | null>(null);
  const { isDarkMode } = useDarkMode();

  // Halaman mandiri detail ruangan
  if (selectedRoom) {
    return (
      <AnimatePresence mode="wait">
        <RoomDetailPage
          key={selectedRoom.id}
          room={selectedRoom}
          onBack={() => setSelectedRoom(null)}
          isDarkMode={isDarkMode}
        />
      </AnimatePresence>
    );
  }

  // Tampilan denah interaktif per lantai
  if (view === "lantai-atas" || view === "lantai-bawah") {
    const label = view === "lantai-atas" ? "Lantai Atas" : "Lantai Bawah";
    return (
      <>
        <DenahTopBar onBack={() => setView("intro")} backLabel="Kembali" />
        <motion.div
          key={view}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="pt-14"
        >
          <FloorPlanView
            floor={view}
            isDarkMode={isDarkMode}
            onRoomClick={setSelectedRoom}
          />
        </motion.div>
      </>
    );
  }

  // Intro — pilih lantai
  return (
    <>
      <DenahTopBar />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col lg:flex-row"
        style={{ height: "calc(100vh - 56px)", marginTop: 56 }}
      >
        <div className="relative flex-1 min-h-[45vh] lg:min-h-0">
          <ZoomableImage />
        </div>
        <div
          className={`relative flex-1 flex flex-col justify-center overflow-hidden ${
            isDarkMode
              ? "bg-gradient-to-br from-slate-900 via-blue-950/40 to-slate-900"
              : "bg-gradient-to-br from-slate-50 via-blue-50/60 to-white"
          }`}
        >
          <div className="absolute inset-0 pointer-events-none">
            <AnimatedFloatingShapes />
          </div>
          <div className="relative z-10 flex flex-col gap-5 px-10 max-w-sm mx-auto w-full">
            <h1 className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}>
              Pilih Lantai
            </h1>
            <div className="flex flex-col gap-3">
              <FloorRow
                title="Lantai Atas"
                isUp={true}
                accentColor="#3b82f6"
                isDarkMode={isDarkMode}
                onClick={() => setView("lantai-atas")}
              />
              <FloorRow
                title="Lantai Bawah"
                isUp={false}
                accentColor="#06b6d4"
                isDarkMode={isDarkMode}
                onClick={() => setView("lantai-bawah")}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
