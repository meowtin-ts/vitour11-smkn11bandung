import { useEffect, useRef, useState } from "react";
import { usePannellum } from "../hooks/usePannellum";
import { Crosshair, MousePointer2, Plus } from "lucide-react";
import { toast } from "sonner";

interface PanoramaPreviewProps {
  panoramaUrl: string;
  initialView?: {
    pitch: number;
    yaw: number;
    hfov: number;
  };
  hotspots?: Array<{
    id?: string;
    pitch: number;
    yaw: number;
    type: "scene" | "info";
    text?: string;
    targetId?: string;
  }>;
  isDarkMode: boolean;
  onAddHotspot: (pitch: number, yaw: number) => void;
}

declare global {
  interface Window {
    pannellum: any;
  }
}

export function PanoramaPreview({
  panoramaUrl,
  initialView,
  hotspots,
  isDarkMode,
  onAddHotspot,
}: PanoramaPreviewProps) {
  const panoramaRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const { isLoaded: pannellumLoaded, error: pannellumError } = usePannellum();
  const [currentPitch, setCurrentPitch] = useState(0);
  const [currentYaw, setCurrentYaw] = useState(0);
  const [currentHfov, setCurrentHfov] = useState(100);
  const [debugMode, setDebugMode] = useState(true);

  useEffect(() => {
    if (!panoramaUrl || !panoramaRef.current || !pannellumLoaded) return;

    // Destroy existing viewer
    if (viewerRef.current) {
      try {
        viewerRef.current.destroy();
      } catch (e) {
        console.error("Error destroying viewer:", e);
      }
    }

    try {
      // Prepare hot spots for display
      const previewHotspots = (hotspots || []).map((hs) => ({
        ...hs,
        cssClass: hs.type === "scene" ? "pnlm-hotspot pnlm-scene" : "pnlm-hotspot pnlm-info",
        createTooltipFunc: hs.text
          ? (hotSpotDiv: HTMLElement) => {
              hotSpotDiv.classList.add("pnlm-tooltip");
              const span = document.createElement("span");
              span.textContent = hs.text || "";
              hotSpotDiv.appendChild(span);
            }
          : undefined,
      }));

      // Initialize Pannellum with hotSpotDebug
      viewerRef.current = window.pannellum.viewer(panoramaRef.current, {
        type: "equirectangular",
        panorama: panoramaUrl,
        autoLoad: true,
        autoRotate: false,
        compass: true,
        showControls: true,
        showFullscreenCtrl: false,
        showZoomCtrl: true,
        mouseZoom: true,
        draggable: true,
        disableKeyboardCtrl: false,
        pitch: initialView?.pitch || 0,
        yaw: initialView?.yaw || 0,
        hfov: initialView?.hfov || 100,
        minHfov: 50,
        maxHfov: 120,
        hotSpots: previewHotspots,
        hotSpotDebug: debugMode, // Enable hot spot debug mode
      });

      // Add click-to-add hotspot when debug mode is ON
      const handlePanoramaClick = (event: MouseEvent) => {
        if (!debugMode || !viewerRef.current) return;

        // Get click coordinates relative to the panorama container
        const container = panoramaRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        try {
          // Convert mouse coordinates to pitch/yaw
          const coords = viewerRef.current.mouseEventToCoords(event);
          if (coords && coords.length === 2) {
            const [clickedPitch, clickedYaw] = coords;
            onAddHotspot(clickedPitch, clickedYaw);
            toast.success(`Hot spot ditambahkan! P: ${Math.round(clickedPitch * 10) / 10}°, Y: ${Math.round(clickedYaw * 10) / 10}°`);
          }
        } catch (e) {
          console.error("Error getting click coordinates:", e);
          toast.error("Gagal menambahkan hot spot di posisi klik");
        }
      };

      // Add click event listener to panorama container
      if (panoramaRef.current) {
        panoramaRef.current.addEventListener('click', handlePanoramaClick);
      }

      // Update pitch/yaw/hfov on mouse move
      const updateInterval = setInterval(() => {
        if (viewerRef.current) {
          try {
            const pitch = viewerRef.current.getPitch();
            const yaw = viewerRef.current.getYaw();
            const hfov = viewerRef.current.getHfov();
            setCurrentPitch(Math.round(pitch * 10) / 10);
            setCurrentYaw(Math.round(yaw * 10) / 10);
            setCurrentHfov(Math.round(hfov * 10) / 10);
          } catch (e) {
            // Ignore errors
          }
        }
      }, 100);

      console.log("Panorama preview initialized with hotSpotDebug and click-to-add");

      return () => {
        clearInterval(updateInterval);
        if (panoramaRef.current) {
          panoramaRef.current.removeEventListener('click', handlePanoramaClick);
        }
        if (viewerRef.current) {
          try {
            viewerRef.current.destroy();
          } catch (e) {
            console.error("Error destroying viewer:", e);
          }
        }
      };
    } catch (error) {
      console.error("Panorama preview initialization error:", error);
      toast.error("Gagal memuat preview panorama");
    }
  }, [panoramaUrl, panoramaRef, pannellumLoaded, hotspots, debugMode, initialView, onAddHotspot]);

  const handleAddHotspotAtCenter = () => {
    if (viewerRef.current) {
      try {
        const pitch = viewerRef.current.getPitch();
        const yaw = viewerRef.current.getYaw();
        onAddHotspot(pitch, yaw);
      } catch (e) {
        toast.error("Gagal menambahkan hot spot");
      }
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} disalin: ${text}`);
  };

  if (pannellumError) {
    return (
      <div
        className={`p-4 rounded-lg border ${
          isDarkMode ? "bg-red-500/10 border-red-500/30 text-red-300" : "bg-red-50 border-red-200 text-red-700"
        }`}
      >
        Error loading Pannellum: {pannellumError}
      </div>
    );
  }

  if (!pannellumLoaded) {
    return (
      <div
        className={`p-4 rounded-lg border text-center ${
          isDarkMode ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"
        }`}
      >
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mx-auto mb-2"></div>
        <p className="text-sm text-slate-500">Memuat Pannellum...</p>
      </div>
    );
  }

  return (
    <div id="preview-panorama" className="space-y-3">
      {/* Preview Container */}
      <div className={`relative rounded-lg overflow-hidden border-2 transition-all ${
        debugMode
          ? "border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]"
          : "border-blue-500"
      }`}>
        <div
          ref={panoramaRef}
          className={`w-full h-80 ${debugMode ? 'cursor-crosshair' : 'cursor-grab'}`}
          title={debugMode ? "Debug Mode ON: Klik untuk tambah hotspot" : "Drag untuk putar panorama"}
        />

        {/* Debug Mode Active Banner */}
        {debugMode && (
          <div className="absolute top-0 left-0 right-0 bg-green-500 text-white text-center py-2 text-xs font-bold z-20 shadow-lg">
            🎯 DEBUG MODE AKTIF - Klik di mana saja pada panorama untuk menambah Hot Spot
          </div>
        )}

        {/* Crosshair Center - More Visible */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
          <div className="relative">
            {/* Outer glow */}
            <div className="absolute inset-0 animate-ping">
              <Crosshair className="w-12 h-12 text-blue-400 opacity-30" strokeWidth={3} />
            </div>
            {/* Main crosshair */}
            <Crosshair className="w-12 h-12 text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" strokeWidth={3} />
          </div>
        </div>

        {/* Real-time Info Panel - LEBIH BESAR & JELAS */}
        <div
          className={`absolute left-3 px-4 py-3 rounded-xl border-2 backdrop-blur-md z-30 transition-all ${
            debugMode ? 'top-14' : 'top-3'
          } ${
            isDarkMode
              ? "bg-slate-900/95 border-blue-500 text-white shadow-[0_0_30px_rgba(59,130,246,0.5)]"
              : "bg-white/95 border-blue-600 text-slate-900 shadow-[0_0_30px_rgba(37,99,235,0.3)]"
          }`}
        >
          <div className="flex items-center gap-2 mb-3">
            <MousePointer2 size={18} className="text-blue-500" />
            <span className="text-sm font-bold">📍 Koordinat Real-time</span>
          </div>
          <div className="space-y-2">
            {/* Pitch */}
            <button
              onClick={() => copyToClipboard(currentPitch.toString(), "Pitch")}
              className="w-full px-3 py-2 rounded-lg bg-gradient-to-r from-blue-500/30 to-blue-600/30 hover:from-blue-500/40 hover:to-blue-600/40 transition-all border border-blue-500/40"
              title="Klik untuk copy Pitch"
            >
              <div className="text-xs text-blue-300 font-medium mb-0.5">Pitch (P)</div>
              <div className="text-lg font-bold font-mono text-white">{currentPitch}°</div>
            </button>

            {/* Yaw */}
            <button
              onClick={() => copyToClipboard(currentYaw.toString(), "Yaw")}
              className="w-full px-3 py-2 rounded-lg bg-gradient-to-r from-green-500/30 to-green-600/30 hover:from-green-500/40 hover:to-green-600/40 transition-all border border-green-500/40"
              title="Klik untuk copy Yaw"
            >
              <div className="text-xs text-green-300 font-medium mb-0.5">Yaw (Y)</div>
              <div className="text-lg font-bold font-mono text-white">{currentYaw}°</div>
            </button>

            {/* HFOV */}
            <button
              onClick={() => copyToClipboard(currentHfov.toString(), "HFOV")}
              className="w-full px-3 py-2 rounded-lg bg-gradient-to-r from-purple-500/30 to-purple-600/30 hover:from-purple-500/40 hover:to-purple-600/40 transition-all border border-purple-500/40"
              title="Klik untuk copy HFOV"
            >
              <div className="text-xs text-purple-300 font-medium mb-0.5">HFOV (H)</div>
              <div className="text-lg font-bold font-mono text-white">{currentHfov}°</div>
            </button>
          </div>

          {/* Copy hint */}
          <div className="mt-2 text-[10px] text-center opacity-60 italic">
            👆 Klik nilai untuk copy
          </div>
        </div>

        {/* Quick Add Button */}
        <button
          onClick={handleAddHotspotAtCenter}
          className="absolute bottom-3 right-3 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg shadow-lg hover:from-blue-600 hover:to-cyan-600 transition-all flex items-center gap-2 font-medium"
        >
          <Plus size={18} />
          Tambah Hot Spot di Posisi Ini
        </button>

        {/* Debug Mode Toggle */}
        <button
          onClick={() => setDebugMode(!debugMode)}
          className={`absolute bottom-3 left-3 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-lg ${
            debugMode
              ? "bg-green-500 hover:bg-green-600 text-white animate-pulse"
              : "bg-slate-500 hover:bg-slate-600 text-white"
          }`}
        >
          {debugMode ? "🎯 Debug: ON (Klik untuk tambah)" : "Debug: OFF"}
        </button>
      </div>

      {/* Instructions */}
      <div
        className={`text-sm p-4 rounded-lg border ${
          isDarkMode
            ? "bg-blue-500/10 border-blue-500/20 text-blue-300"
            : "bg-blue-50 border-blue-200 text-blue-700"
        }`}
      >
        <div className="flex items-start gap-3">
          <Crosshair size={18} className="mt-0.5 flex-shrink-0" />
          <div className="space-y-2">
            <p className="font-bold text-base">📖 Cara Lihat & Gunakan Koordinat P/Y/H:</p>
            <ul className="space-y-1.5 opacity-95 leading-relaxed">
              <li>✅ <strong>Panel kiri atas</strong> menampilkan koordinat <strong>Pitch (P), Yaw (Y), HFOV (H)</strong> secara real-time</li>
              <li>✅ <strong>Drag/geser mouse</strong> di panorama untuk putar view → nilai P/Y/H otomatis update</li>
              <li>✅ <strong>Klik pada nilai P/Y/H</strong> di panel untuk copy ke clipboard</li>
              <li>✅ <strong>Debug Mode ON (hijau)</strong> → Klik langsung di panorama untuk tambah hotspot</li>
              <li>✅ <strong>Atau posisikan crosshair biru</strong> lalu klik "Tambah Hot Spot di Posisi Ini"</li>
              <li>✅ <strong>Scroll</strong> untuk zoom in/out</li>
            </ul>

            <div className="mt-3 p-2 rounded bg-yellow-500/20 border border-yellow-500/40">
              <p className="text-xs font-bold text-yellow-300">💡 Tips:</p>
              <p className="text-xs opacity-90">Koordinat P/Y/H berubah saat Anda menggerakkan/drag panorama. Posisikan view ke tempat yang Anda inginkan, lalu lihat nilainya di panel kiri atas!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
