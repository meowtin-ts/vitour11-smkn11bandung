import { useState, useMemo, useRef, useEffect } from "react";

// ── Slot type ──────────────────────────────────────────────────────────
export interface Slot { l: number; t: number; w: number; h: number; }

export interface FloorRoom {
  id: string;
  slot_id: string;
  nama_ruangan: string;
  kode_ruang?: string;
  gedung?: string;
  lantai: "atas" | "bawah";
  ukuran_ruangan?: string;
  luas_ruangan?: number;
  kondisi_ruangan?: string;
  deskripsi?: string;
  papan_tulis?: number;
  meja?: number;
  kursi?: number;
  komputer?: number;
  kursi_kampus?: number;
  cctv?: number;
  proyektor?: number;
  ac?: number;
  kipas_angin?: number;
  televisi?: number;
  pos_x?: number;
  pos_y?: number;
  pos_w?: number;
  pos_h?: number;
}

// ── Lantai Atas — 39 blue slots ────────────────────────────────────────
export const ATAS_BLUE: Slot[] = [
  {l:33.301, t:8.948,  w:5.212,  h:4.308},
  {l:39.575, t:8.948,  w:5.309,  h:4.308},
  {l:45.946, t:8.948,  w:5.212,  h:4.308},
  {l:52.22,  t:8.948,  w:5.212,  h:4.308},
  {l:58.494, t:8.948,  w:4.826,  h:4.308},
  {l:64.382, t:8.948,  w:5.309,  h:4.308},
  {l:70.656, t:8.948,  w:3.282,  h:4.308},
  {l:75.0,   t:8.948,  w:5.792,  h:4.143},
  {l:36.004, t:20.05,  w:1.931,  h:7.291},
  {l:73.649, t:21.541, w:5.792,  h:5.137},
  {l:88.127, t:21.541, w:5.792,  h:5.137},
  {l:73.649, t:27.423, w:5.792,  h:5.054},
  {l:88.127, t:27.423, w:5.792,  h:5.054},
  {l:73.649, t:33.223, w:5.792,  h:5.054},
  {l:88.127, t:33.223, w:5.792,  h:5.054},
  {l:33.398, t:33.72,  w:1.448,  h:5.22},
  {l:35.328, t:33.72,  w:8.784,  h:5.22},
  {l:44.595, t:33.72,  w:12.838, h:5.22},
  {l:73.649, t:39.022, w:5.792,  h:5.054},
  {l:87.934, t:39.022, w:5.985,  h:5.054},
  {l:9.363,  t:44.325, w:6.564,  h:3.894},
  {l:87.741, t:45.402, w:6.178,  h:1.16},
  {l:74.035, t:47.473, w:9.363,  h:4.971},
  {l:9.363,  t:48.716, w:6.564,  h:3.894},
  {l:9.363,  t:53.107, w:6.564,  h:3.894},
  {l:74.035, t:53.107, w:6.081,  h:5.054},
  {l:9.363,  t:57.498, w:6.564,  h:3.314},
  {l:73.938, t:58.741, w:6.178,  h:5.551},
  {l:9.363,  t:61.309, w:6.564,  h:2.486},
  {l:88.127, t:62.635, w:5.792,  h:5.137},
  {l:74.035, t:64.872, w:6.081,  h:7.871},
  {l:9.653,  t:68.268, w:6.274,  h:4.557},
  {l:88.127, t:68.351, w:5.792,  h:5.634},
  {l:25.386, t:73.322, w:8.977,  h:5.22},
  {l:9.653,  t:73.488, w:6.274,  h:4.474},
  {l:74.035, t:73.488, w:6.081,  h:10.191},
  {l:88.127, t:74.565, w:5.792,  h:5.717},
  {l:9.653,  t:78.625, w:6.274,  h:6.959},
  {l:25.386, t:79.122, w:8.977,  h:6.462},
];

// ── Lantai Atas — 66 gray slots ────────────────────────────────────────
export const ATAS_GRAY: Slot[] = [
  {l:33.301, t:13.836, w:5.212,  h:4.391},
  {l:39.575, t:13.836, w:5.309,  h:4.391},
  {l:45.946, t:13.836, w:5.212,  h:4.391},
  {l:52.22,  t:13.836, w:5.309,  h:4.391},
  {l:58.494, t:13.836, w:4.826,  h:4.391},
  {l:64.382, t:13.836, w:5.309,  h:4.391},
  {l:70.656, t:13.836, w:3.282,  h:4.308},
  {l:75.0,   t:13.836, w:5.792,  h:4.391},
  {l:33.398, t:20.05,  w:2.027,  h:7.291},
  {l:38.61,  t:20.05,  w:4.344,  h:4.888},
  {l:48.552, t:21.541, w:15.83,  h:3.397},
  {l:65.927, t:21.541, w:5.792,  h:5.137},
  {l:80.888, t:21.541, w:5.792,  h:5.137},
  {l:43.34,  t:23.778, w:4.826,  h:1.16},
  {l:61.004, t:25.518, w:3.282,  h:18.558},
  {l:65.927, t:27.423, w:5.792,  h:5.054},
  {l:80.888, t:27.423, w:5.792,  h:5.054},
  {l:33.398, t:27.92,  w:10.811, h:5.22},
  {l:44.595, t:27.92,  w:10.811, h:5.22},
  {l:55.888, t:27.92,  w:1.544,  h:5.22},
  {l:65.927, t:33.223, w:5.792,  h:5.054},
  {l:80.888, t:33.223, w:5.792,  h:5.054},
  {l:65.927, t:39.022, w:5.792,  h:5.054},
  {l:80.888, t:39.022, w:5.792,  h:5.054},
  {l:24.614, t:39.188, w:1.544,  h:1.326},
  {l:39.865, t:39.519, w:17.568, h:2.9},
  {l:24.614, t:41.176, w:1.544,  h:1.408},
  {l:17.181, t:42.916, w:6.467,  h:0.746},
  {l:32.529, t:43.911, w:24.807, h:23.861},
  {l:17.181, t:44.325, w:6.467,  h:3.894},
  {l:80.695, t:45.402, w:6.178,  h:1.16},
  {l:85.618, t:47.39,  w:1.255,  h:5.22},
  {l:61.004, t:47.473, w:3.378,  h:20.05},
  {l:65.927, t:47.473, w:5.792,  h:5.054},
  {l:17.181, t:48.882, w:6.467,  h:12.593},
  {l:65.927, t:53.107, w:5.792,  h:5.054},
  {l:85.714, t:54.267, w:1.158,  h:6.048},
  {l:65.927, t:58.741, w:5.792,  h:3.314},
  {l:3.378,  t:59.072, w:4.054,  h:6.297},
  {l:17.181, t:61.972, w:6.467,  h:1.823},
  {l:65.927, t:62.635, w:5.792,  h:1.74},
  {l:82.336, t:62.635, w:4.537,  h:17.647},
  {l:65.927, t:64.872, w:5.792,  h:4.722},
  {l:3.378,  t:66.114, w:4.054,  h:25.269},
  {l:17.181, t:68.268, w:6.178,  h:4.557},
  {l:35.039, t:70.091, w:18.629, h:2.403},
  {l:65.927, t:70.091, w:5.792,  h:2.651},
  {l:35.039, t:73.239, w:13.224, h:5.302},
  {l:49.131, t:73.239, w:4.537,  h:5.137},
  {l:17.181, t:73.488, w:6.178,  h:4.474},
  {l:65.927, t:73.488, w:5.792,  h:3.065},
  {l:65.927, t:77.133, w:5.792,  h:6.545},
  {l:17.278, t:78.625, w:6.081,  h:3.148},
  {l:35.039, t:79.122, w:13.224, h:6.462},
  {l:49.131, t:79.205, w:4.537,  h:6.462},
  {l:17.278, t:82.436, w:6.081,  h:3.148},
  {l:35.039, t:86.164, w:18.629, h:2.071},
  {l:83.784, t:86.33,  w:3.089,  h:5.054},
  {l:27.703, t:91.881, w:8.784,  h:5.882},
  {l:36.969, t:91.881, w:2.51,   h:5.882},
  {l:40.058, t:91.881, w:3.185,  h:5.882},
  {l:43.822, t:91.881, w:8.301,  h:5.882},
  {l:52.606, t:91.881, w:8.301,  h:5.882},
  {l:3.378,  t:92.129, w:14.961, h:5.634},
  {l:61.969, t:94.366, w:2.896,  h:3.397},
  {l:66.216, t:95.692, w:14.382, h:1.74},
];

// ── Lantai Bawah — 66 blue slots ──────────────────────────────────────
export const BAWAH_BLUE: Slot[] = [
  {l:33.301, t:13.836, w:5.212,  h:4.308},
  {l:39.575, t:13.836, w:5.309,  h:4.308},
  {l:45.946, t:13.836, w:5.212,  h:4.308},
  {l:52.22,  t:13.836, w:5.212,  h:4.308},
  {l:58.494, t:13.836, w:4.826,  h:4.391},
  {l:64.382, t:13.836, w:5.309,  h:4.308},
  {l:70.656, t:13.836, w:3.282,  h:4.308},
  {l:75.0,   t:13.836, w:5.792,  h:4.308},
  {l:33.398, t:20.05,  w:2.027,  h:7.291},
  {l:38.61,  t:20.05,  w:4.344,  h:4.888},
  {l:48.552, t:21.541, w:15.734, h:3.397},
  {l:65.927, t:21.541, w:5.792,  h:5.137},
  {l:80.888, t:21.541, w:5.792,  h:5.137},
  {l:43.34,  t:23.778, w:4.826,  h:1.16},
  {l:61.004, t:25.518, w:3.282,  h:18.558},
  {l:65.927, t:27.423, w:5.792,  h:5.054},
  {l:80.888, t:27.423, w:5.792,  h:5.054},
  {l:33.398, t:27.92,  w:10.811, h:5.22},
  {l:44.595, t:27.92,  w:10.811, h:5.22},
  {l:55.888, t:27.92,  w:1.544,  h:5.22},
  {l:65.927, t:33.223, w:5.792,  h:5.054},
  {l:80.888, t:33.223, w:5.792,  h:5.054},
  {l:65.927, t:39.022, w:5.792,  h:5.054},
  {l:80.888, t:39.022, w:5.792,  h:5.054},
  {l:24.614, t:39.188, w:1.544,  h:1.326},
  {l:39.865, t:39.519, w:17.568, h:2.9},
  {l:24.614, t:41.176, w:1.544,  h:1.408},
  {l:17.181, t:42.916, w:6.467,  h:0.746},
  {l:32.529, t:43.911, w:24.807, h:23.861},
  {l:17.181, t:44.325, w:6.467,  h:3.894},
  {l:80.695, t:45.402, w:6.178,  h:1.16},
  {l:85.618, t:47.39,  w:1.255,  h:5.22},
  {l:61.004, t:47.473, w:3.282,  h:20.05},
  {l:65.927, t:47.473, w:5.792,  h:5.054},
  {l:17.181, t:48.882, w:6.467,  h:12.593},
  {l:65.927, t:53.107, w:5.792,  h:5.054},
  {l:85.714, t:54.267, w:1.158,  h:6.048},
  {l:65.927, t:58.741, w:5.792,  h:3.314},
  {l:3.378,  t:59.072, w:4.054,  h:6.297},
  {l:17.181, t:61.972, w:6.467,  h:1.823},
  {l:65.927, t:62.635, w:5.792,  h:1.74},
  {l:82.336, t:62.635, w:4.537,  h:17.647},
  {l:65.927, t:64.872, w:5.792,  h:4.722},
  {l:3.378,  t:66.114, w:4.054,  h:25.269},
  {l:17.181, t:68.268, w:6.178,  h:4.557},
  {l:35.039, t:70.091, w:18.629, h:2.403},
  {l:65.927, t:70.091, w:5.792,  h:2.651},
  {l:35.039, t:73.239, w:13.224, h:5.302},
  {l:49.131, t:73.239, w:4.537,  h:5.137},
  {l:17.181, t:73.488, w:6.178,  h:4.474},
  {l:65.927, t:73.488, w:5.792,  h:3.065},
  {l:65.927, t:77.133, w:5.792,  h:6.545},
  {l:17.278, t:78.625, w:6.081,  h:3.148},
  {l:35.039, t:79.122, w:13.224, h:6.462},
  {l:49.131, t:79.205, w:4.537,  h:6.462},
  {l:17.278, t:82.436, w:6.081,  h:3.148},
  {l:35.039, t:86.164, w:18.629, h:2.071},
  {l:83.784, t:86.33,  w:3.089,  h:5.054},
  {l:27.703, t:91.881, w:8.784,  h:5.882},
  {l:36.969, t:91.881, w:2.51,   h:5.882},
  {l:40.058, t:91.881, w:3.185,  h:5.882},
  {l:43.822, t:91.881, w:8.301,  h:5.882},
  {l:52.606, t:91.881, w:8.301,  h:5.882},
  {l:3.378,  t:92.129, w:14.961, h:5.634},
  {l:61.969, t:94.366, w:2.896,  h:3.397},
  {l:66.216, t:95.692, w:14.382, h:1.74},
];

// ── Lantai Bawah — 39 gray slots ──────────────────────────────────────
export const BAWAH_GRAY: Slot[] = [
  {l:33.301, t:8.948,  w:5.212,  h:4.308},
  {l:39.575, t:8.948,  w:5.309,  h:4.308},
  {l:45.946, t:8.948,  w:5.212,  h:4.308},
  {l:52.22,  t:8.948,  w:5.309,  h:4.308},
  {l:58.494, t:8.948,  w:4.826,  h:4.391},
  {l:64.382, t:8.948,  w:5.309,  h:4.308},
  {l:70.656, t:8.948,  w:3.282,  h:4.308},
  {l:75.0,   t:8.948,  w:5.792,  h:4.143},
  {l:36.004, t:20.05,  w:1.931,  h:7.291},
  {l:73.649, t:21.541, w:5.792,  h:5.137},
  {l:88.127, t:21.541, w:5.792,  h:5.137},
  {l:73.649, t:27.423, w:5.792,  h:5.054},
  {l:88.127, t:27.423, w:5.792,  h:5.054},
  {l:73.649, t:33.223, w:5.792,  h:5.054},
  {l:88.127, t:33.223, w:5.792,  h:5.054},
  {l:33.398, t:33.72,  w:1.448,  h:5.22},
  {l:35.328, t:33.72,  w:8.784,  h:5.22},
  {l:44.595, t:33.72,  w:12.934, h:5.22},
  {l:73.649, t:39.022, w:5.792,  h:5.054},
  {l:87.934, t:39.022, w:5.792,  h:5.054},
  {l:9.363,  t:44.325, w:6.564,  h:3.894},
  {l:87.741, t:45.402, w:6.178,  h:1.16},
  {l:74.035, t:47.473, w:9.363,  h:4.971},
  {l:9.363,  t:48.716, w:6.564,  h:3.894},
  {l:9.363,  t:53.107, w:6.564,  h:3.894},
  {l:74.035, t:53.107, w:6.081,  h:5.054},
  {l:9.363,  t:57.498, w:6.564,  h:3.314},
  {l:73.938, t:58.741, w:6.178,  h:5.551},
  {l:9.363,  t:61.309, w:6.564,  h:2.486},
  {l:88.127, t:62.635, w:5.792,  h:5.137},
  {l:74.035, t:64.872, w:6.081,  h:7.871},
  {l:9.653,  t:68.268, w:6.274,  h:4.557},
  {l:88.127, t:68.351, w:5.792,  h:5.634},
  {l:25.386, t:73.322, w:8.977,  h:5.22},
  {l:9.653,  t:73.488, w:6.274,  h:4.474},
  {l:74.035, t:73.488, w:6.081,  h:10.191},
  {l:88.127, t:74.565, w:5.792,  h:5.717},
  {l:9.653,  t:78.625, w:6.274,  h:6.959},
  {l:25.386, t:79.122, w:8.977,  h:6.462},
];

// ── Component ──────────────────────────────────────────────────────────
interface FloorPlanChartProps {
  floor: "atas" | "bawah";
  rooms: FloorRoom[];
  mode: "admin" | "visitor";
  isDarkMode?: boolean;
  enableSwipeExplore?: boolean;
  displayScale?: number;
  onSlotClick?: (slotId: string, room: FloorRoom | undefined, slot: Slot) => void;
  onRoomClick?: (room: FloorRoom) => void;
}

export function FloorPlanChart({
  floor,
  rooms,
  mode,
  isDarkMode = false,
  enableSwipeExplore = true,
  displayScale = 1,
  onSlotClick,
  onRoomClick,
}: FloorPlanChartProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  // Mobile swipe: track which slot is under the finger while dragging
  const [touchHoveredId, setTouchHoveredId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // Prevent click from firing after touchend opens the room
  const wasTouchRef = useRef(false);

  const blueSlots = floor === "atas" ? ATAS_BLUE : BAWAH_BLUE;
  const graySlots = floor === "atas" ? ATAS_GRAY : BAWAH_GRAY;

  const roomMap = useMemo(() => {
    const map = new Map<string, FloorRoom>();
    rooms.forEach((r) => { if (r.slot_id) map.set(r.slot_id, r); });
    return map;
  }, [rooms]);

  // Swipe-to-explore: drag finger over floor plan to preview rooms, lift to open
  useEffect(() => {
    if (mode !== "visitor" || !enableSwipeExplore) return;
    const el = containerRef.current;
    if (!el) return;

    // Local mutable variable shared across all handlers in this closure
    let currentSlotId: string | null = null;

    const getSlotIdAt = (clientX: number, clientY: number): string | null => {
      const target = document.elementFromPoint(clientX, clientY) as Element | null;
      return target?.closest("[data-slot-id]")?.getAttribute("data-slot-id") ?? null;
    };

    const handleTouchStart = (e: TouchEvent) => {
      // Two-finger gestures are reserved for pinch-to-zoom by the parent canvas.
      if (e.touches.length !== 1) {
        currentSlotId = null;
        setTouchHoveredId(null);
        return;
      }
      const touch = e.touches[0];
      currentSlotId = getSlotIdAt(touch.clientX, touch.clientY);
      setTouchHoveredId(currentSlotId);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) {
        currentSlotId = null;
        setTouchHoveredId(null);
        return;
      }
      e.preventDefault(); // lock page scroll while exploring floor plan
      const touch = e.touches[0];
      currentSlotId = getSlotIdAt(touch.clientX, touch.clientY);
      setTouchHoveredId(currentSlotId);
    };

    const handleTouchEnd = () => {
      if (currentSlotId) {
        const room = roomMap.get(currentSlotId);
        if (room) {
          wasTouchRef.current = true;
          onRoomClick?.(room);
          // Clear flag after click event fires (~300ms later)
          setTimeout(() => { wasTouchRef.current = false; }, 400);
        }
      }
      currentSlotId = null;
      setTouchHoveredId(null);
    };

    const handleTouchCancel = () => {
      currentSlotId = null;
      setTouchHoveredId(null);
    };

    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    el.addEventListener("touchend", handleTouchEnd);
    el.addEventListener("touchcancel", handleTouchCancel);

    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
      el.removeEventListener("touchcancel", handleTouchCancel);
    };
  }, [mode, roomMap, onRoomClick, enableSwipeExplore]);

  const grayBackground = isDarkMode
    ? "linear-gradient(to bottom right, #334155, #475569, #64748b)"
    : "linear-gradient(to bottom right, #f1f5f9, #e2e8f0, #cbd5e1)";

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-2xl overflow-visible border ${
        isDarkMode ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"
      }`}
      style={{ aspectRatio: "0.8583", containerType: "inline-size" }}
    >
      {/* Gray slots — non-interactive */}
      {graySlots.map((s, i) => (
        <div
          key={`gray-${i}`}
          style={{
            position: "absolute",
            left: `${s.l}%`,
            top: `${s.t}%`,
            width: `${s.w}%`,
            height: `${s.h}%`,
            background: grayBackground,
          }}
        />
      ))}

      {/* Blue slots — interactive */}
      {blueSlots.map((s, i) => {
        const slotId = `${floor}-${i}`;
        const room = roomMap.get(slotId);
        const hasRoom = !!room;
        const isHovered = hoveredId === slotId;
        const isTouchHovered = touchHoveredId === slotId;
        const showTooltip = isHovered || isTouchHovered;
        const tooltipBelow = s.t < 18;
        const isVerticalRoom = s.h > s.w * 1.55;
        const isCompactRoom = s.w < 4.25 || s.h < 3.2;

        const isClickable = mode === "admin" || hasRoom;
        const isActive = (isHovered || isTouchHovered) && isClickable;

        const blueBackground = isActive
          ? "linear-gradient(to bottom right, #60a5fa, #2563eb, #1d4ed8)"
          : "linear-gradient(to bottom right, #3b82f6, #1d4ed8, #1e3a8a)";

        return (
          <div
            key={slotId}
            data-slot-id={slotId}
            style={{
              position: "absolute",
              left: `${s.l}%`,
              top: `${s.t}%`,
              width: `${s.w}%`,
              height: `${s.h}%`,
              zIndex: isActive ? 40 : 2,
              background: blueBackground,
              boxShadow: hasRoom && mode === "admin"
                ? "inset 0 0 0 2px #34d399"
                : isActive
                ? "0 4px 12px rgba(30,58,138,0.5)"
                : undefined,
              cursor: isClickable ? "pointer" : "default",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={() => { if (isClickable) setHoveredId(slotId); }}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => {
              // Touch path is handled by touchend; skip to avoid double-open
              if (wasTouchRef.current) return;
              if (mode === "admin") {
                onSlotClick?.(slotId, room, s);
              } else if (hasRoom) {
                onRoomClick?.(room);
              }
            }}
          >
            {/* Admin: filled indicator */}
            {mode === "admin" && hasRoom && (
              <span
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  textAlign: "center",
                  overflow: "hidden",
                  lineHeight: 1.1,
                  padding: "1px",
                  fontSize: "clamp(0.2rem, 0.4vw, 0.42rem)",
                  fontWeight: 600,
                }}
              >
                {room.kode_ruang
                  ? room.kode_ruang.slice(0, 8)
                  : room.nama_ruangan.slice(0, 8)}
              </span>
            )}

            {/* Visitor: persistent room name; the tooltip still shows the full name on hover / swipe */}
            {mode === "visitor" && hasRoom && (
              <span
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: isVerticalRoom
                    ? `${Math.max(100, (s.h / (s.w * 0.8583)) * 100)}%`
                    : "calc(100% - 3px)",
                  maxHeight: isVerticalRoom ? "none" : "calc(100% - 2px)",
                  transform: isVerticalRoom
                    ? "translate(-50%, -50%) rotate(-90deg)"
                    : "translate(-50%, -50%)",
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: displayScale >= 1.5 ? 2 : isCompactRoom ? 1 : 2,
                  overflow: "hidden",
                  color: "rgba(255,255,255,0.96)",
                  fontFamily: "'Manrope', system-ui, sans-serif",
                  fontSize: isCompactRoom
                    ? "clamp(0.22rem, 0.56cqw, 0.52rem)"
                    : "clamp(0.28rem, 0.72cqw, 0.72rem)",
                  fontWeight: 800,
                  lineHeight: 1.05,
                  letterSpacing: "-0.015em",
                  textAlign: "center",
                  textOverflow: "ellipsis",
                  textShadow: "0 1px 2px rgba(15,23,42,1), 0 0 4px rgba(15,23,42,0.55)",
                  pointerEvents: "none",
                  opacity: isActive ? 1 : 0.9,
                  transition: "opacity 0.15s ease",
                }}
              >
                {room.nama_ruangan}
              </span>
            )}

            {/* Visitor: tooltip — hover (desktop) or swipe-over (mobile) */}
            {mode === "visitor" && hasRoom && showTooltip && (
              <div
                style={{
                  position: "absolute",
                  [tooltipBelow ? "top" : "bottom"]: "calc(100% + 5px)",
                  left: "50%",
                  transform: "translateX(-50%)",
                  zIndex: 99,
                  whiteSpace: "nowrap",
                  padding: "5px 10px",
                  background: "#0f172a",
                  color: "white",
                  fontFamily: "'Manrope', system-ui, sans-serif",
                  fontSize: "0.68rem",
                  fontWeight: 800,
                  borderRadius: "8px",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
                  pointerEvents: "none",
                  letterSpacing: "0.01em",
                }}
              >
                {room.nama_ruangan}
                <div
                  style={{
                    position: "absolute",
                    [tooltipBelow ? "bottom" : "top"]: "100%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 0,
                    height: 0,
                    borderLeft: "5px solid transparent",
                    borderRight: "5px solid transparent",
                    [tooltipBelow ? "borderTop" : "borderBottom"]: "none",
                    [tooltipBelow ? "borderBottom" : "borderTop"]: "5px solid #0f172a",
                  }}
                />
              </div>
            )}

            {/* Admin: hover hint on empty slot */}
            {mode === "admin" && !hasRoom && isHovered && (
              <div
                style={{
                  position: "absolute",
                  [tooltipBelow ? "top" : "bottom"]: "calc(100% + 5px)",
                  left: "50%",
                  transform: "translateX(-50%)",
                  zIndex: 99,
                  whiteSpace: "nowrap",
                  padding: "4px 8px",
                  background: "#1e3a8a",
                  color: "white",
                  fontSize: "0.6rem",
                  fontWeight: 600,
                  borderRadius: "6px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                  pointerEvents: "none",
                }}
              >
                + Tambah Ruangan
              </div>
            )}

            {/* Admin: hover hint on filled slot */}
            {mode === "admin" && hasRoom && isHovered && (
              <div
                style={{
                  position: "absolute",
                  [tooltipBelow ? "top" : "bottom"]: "calc(100% + 5px)",
                  left: "50%",
                  transform: "translateX(-50%)",
                  zIndex: 99,
                  whiteSpace: "nowrap",
                  padding: "4px 8px",
                  background: "#064e3b",
                  color: "white",
                  fontSize: "0.6rem",
                  fontWeight: 600,
                  borderRadius: "6px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                  pointerEvents: "none",
                }}
              >
                Edit: {room.nama_ruangan}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
