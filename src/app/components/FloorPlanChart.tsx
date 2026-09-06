import { useState, useMemo } from "react";

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
  {l:75.0,   t:8.782,  w:5.792,  h:4.308},
  {l:33.301, t:8.948,  w:5.212,  h:4.308},
  {l:39.575, t:8.948,  w:5.309,  h:4.308},
  {l:45.946, t:8.948,  w:5.212,  h:4.308},
  {l:52.22,  t:8.948,  w:5.212,  h:4.308},
  {l:58.494, t:8.948,  w:4.826,  h:4.308},
  {l:64.382, t:8.948,  w:5.309,  h:4.308},
  {l:70.656, t:8.948,  w:3.282,  h:4.308},
  {l:36.004, t:20.05,  w:1.931,  h:7.291},
  {l:73.649, t:21.541, w:5.792,  h:5.137},
  {l:88.127, t:21.541, w:5.792,  h:5.137},
  {l:73.649, t:27.423, w:5.792,  h:5.054},
  {l:88.127, t:27.423, w:5.792,  h:5.054},
  {l:73.649, t:33.223, w:5.792,  h:5.054},
  {l:88.127, t:33.223, w:5.792,  h:5.054},
  {l:33.784, t:33.471, w:1.448,  h:5.468},
  {l:36.004, t:33.72,  w:8.205,  h:5.22},
  {l:44.981, t:33.72,  w:12.259, h:5.22},
  {l:73.649, t:39.022, w:5.792,  h:5.054},
  {l:87.934, t:39.022, w:5.792,  h:5.054},
  {l:9.363,  t:44.325, w:6.564,  h:3.894},
  {l:87.741, t:45.402, w:6.178,  h:1.16},
  {l:74.035, t:48.053, w:9.363,  h:4.474},
  {l:9.363,  t:48.716, w:6.564,  h:3.894},
  {l:9.363,  t:53.107, w:6.564,  h:3.894},
  {l:74.035, t:53.604, w:6.274,  h:4.474},
  {l:9.363,  t:57.498, w:6.564,  h:3.314},
  {l:73.938, t:59.238, w:6.274,  h:4.557},
  {l:9.363,  t:61.309, w:6.564,  h:2.486},
  {l:88.127, t:62.303, w:5.792,  h:5.137},
  {l:73.938, t:64.872, w:6.178,  h:8.534},
  {l:9.653,  t:67.357, w:6.274,  h:4.474},
  {l:88.127, t:68.103, w:5.792,  h:5.137},
  {l:9.653,  t:72.659, w:6.274,  h:4.557},
  {l:25.386, t:73.488, w:8.977,  h:5.551},
  {l:73.938, t:74.565, w:6.274,  h:9.114},
  {l:88.127, t:74.565, w:5.792,  h:5.054},
  {l:9.653,  t:78.625, w:6.274,  h:6.959},
  {l:25.386, t:80.033, w:8.977,  h:5.551},
];

// ── Lantai Atas — 61 gray slots ────────────────────────────────────────
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
  {l:48.552, t:21.541, w:14.768, h:3.397},
  {l:65.927, t:21.541, w:5.792,  h:5.137},
  {l:80.888, t:21.541, w:5.792,  h:5.137},
  {l:43.436, t:23.944, w:4.826,  h:0.994},
  {l:60.618, t:25.766, w:3.378,  h:18.31},
  {l:65.927, t:27.423, w:5.792,  h:5.054},
  {l:80.888, t:27.423, w:5.792,  h:5.054},
  {l:33.398, t:27.92,  w:10.811, h:5.22},
  {l:44.595, t:27.92,  w:10.811, h:5.22},
  {l:55.888, t:27.92,  w:1.544,  h:5.22},
  {l:65.927, t:33.223, w:5.792,  h:5.054},
  {l:80.888, t:33.223, w:5.792,  h:5.054},
  {l:65.927, t:39.022, w:5.792,  h:5.054},
  {l:80.888, t:39.022, w:5.792,  h:5.054},
  {l:38.32,  t:39.519, w:17.568, h:2.9},
  {l:17.181, t:42.502, w:6.467,  h:0.829},
  {l:17.278, t:43.745, w:6.371,  h:4.474},
  {l:31.853, t:44.159, w:24.807, h:23.861},
  {l:80.695, t:45.402, w:6.178,  h:1.16},
  {l:85.618, t:47.39,  w:1.255,  h:5.22},
  {l:65.927, t:47.473, w:5.792,  h:5.054},
  {l:60.039, t:48.053, w:3.282,  h:20.05},
  {l:17.181, t:48.882, w:6.467,  h:12.593},
  {l:65.927, t:53.107, w:5.792,  h:5.054},
  {l:85.714, t:54.267, w:1.158,  h:6.048},
  {l:65.927, t:58.741, w:5.792,  h:3.314},
  {l:3.378,  t:59.072, w:4.054,  h:6.297},
  {l:17.181, t:62.303, w:6.467,  h:2.154},
  {l:82.336, t:62.635, w:4.537,  h:17.647},
  {l:65.927, t:62.883, w:5.792,  h:1.16},
  {l:65.927, t:64.872, w:5.792,  h:4.722},
  {l:3.378,  t:66.28,  w:4.054,  h:24.192},
  {l:17.181, t:67.274, w:6.178,  h:4.474},
  {l:65.927, t:70.754, w:5.792,  h:2.651},
  {l:17.181, t:72.659, w:6.178,  h:4.557},
  {l:35.039, t:73.157, w:18.629, h:5.385},
  {l:65.927, t:74.565, w:5.792,  h:1.988},
  {l:65.927, t:77.133, w:5.792,  h:6.545},
  {l:17.278, t:78.625, w:6.081,  h:3.148},
  {l:35.232, t:79.122, w:18.629, h:6.462},
  {l:17.278, t:82.436, w:6.081,  h:3.148},
  {l:35.521, t:86.164, w:18.147, h:2.071},
  {l:83.784, t:86.33,  w:3.089,  h:5.054},
  {l:37.259, t:91.881, w:2.22,   h:5.882},
  {l:40.347, t:91.881, w:2.703,  h:5.882},
  {l:43.822, t:91.881, w:7.819,  h:5.882},
  {l:52.606, t:91.881, w:8.301,  h:5.882},
  {l:3.378,  t:92.129, w:14.961, h:6.048},
  {l:28.185, t:92.129, w:8.784,  h:5.385},
  {l:61.969, t:94.366, w:2.896,  h:3.397},
  {l:66.795, t:95.195, w:14.382, h:1.823},
];

// ── Lantai Bawah — 63 blue slots ──────────────────────────────────────
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
  {l:48.552, t:21.541, w:14.768, h:3.397},
  {l:65.927, t:21.541, w:5.792,  h:5.137},
  {l:80.888, t:21.541, w:5.792,  h:5.137},
  {l:43.436, t:23.944, w:4.826,  h:0.994},
  {l:60.618, t:25.849, w:3.378,  h:18.227},
  {l:65.927, t:27.423, w:5.792,  h:5.054},
  {l:80.888, t:27.423, w:5.792,  h:5.054},
  {l:33.398, t:27.92,  w:10.811, h:5.22},
  {l:44.595, t:27.92,  w:10.811, h:5.22},
  {l:55.888, t:27.92,  w:1.544,  h:5.22},
  {l:65.927, t:33.223, w:5.792,  h:5.054},
  {l:80.888, t:33.223, w:5.792,  h:5.054},
  {l:65.927, t:39.022, w:5.792,  h:5.054},
  {l:80.888, t:39.022, w:5.792,  h:5.054},
  {l:38.32,  t:39.519, w:17.568, h:2.9},
  {l:17.181, t:42.502, w:6.467,  h:0.829},
  {l:17.278, t:43.745, w:6.371,  h:4.474},
  {l:31.853, t:44.159, w:24.807, h:23.861},
  {l:80.695, t:45.402, w:6.178,  h:1.16},
  {l:85.618, t:47.39,  w:1.255,  h:5.22},
  {l:65.927, t:47.473, w:5.792,  h:5.054},
  {l:60.039, t:48.053, w:3.282,  h:19.967},
  {l:17.181, t:48.882, w:6.467,  h:12.593},
  {l:65.927, t:53.107, w:5.792,  h:5.054},
  {l:85.714, t:54.267, w:1.158,  h:6.048},
  {l:65.927, t:58.741, w:5.792,  h:3.314},
  {l:3.378,  t:59.072, w:4.054,  h:6.297},
  {l:17.181, t:62.303, w:6.467,  h:2.154},
  {l:82.336, t:62.635, w:4.537,  h:17.647},
  {l:65.927, t:62.883, w:5.792,  h:1.16},
  {l:65.927, t:64.872, w:5.792,  h:4.722},
  {l:3.378,  t:66.28,  w:4.054,  h:24.192},
  {l:17.181, t:67.274, w:6.178,  h:4.474},
  {l:65.927, t:70.754, w:5.792,  h:2.651},
  {l:17.181, t:72.659, w:6.178,  h:4.557},
  {l:35.039, t:73.157, w:18.629, h:5.385},
  {l:65.927, t:74.565, w:5.792,  h:1.988},
  {l:65.927, t:77.133, w:5.792,  h:6.545},
  {l:17.278, t:78.625, w:2.413,  h:3.314},
  {l:20.27,  t:78.625, w:3.089,  h:3.148},
  {l:35.232, t:79.122, w:18.629, h:6.462},
  {l:17.278, t:82.436, w:2.413,  h:3.314},
  {l:20.27,  t:82.436, w:3.089,  h:3.148},
  {l:35.521, t:86.164, w:18.147, h:2.071},
  {l:83.784, t:86.33,  w:3.089,  h:5.054},
  {l:37.452, t:91.881, w:2.317,  h:5.882},
  {l:40.347, t:91.881, w:2.703,  h:5.882},
  {l:43.822, t:91.881, w:7.819,  h:5.882},
  {l:52.606, t:91.881, w:8.301,  h:5.882},
  {l:3.378,  t:92.129, w:14.961, h:6.048},
  {l:28.185, t:92.129, w:8.687,  h:5.385},
  {l:61.969, t:94.366, w:2.896,  h:3.397},
  {l:66.795, t:95.195, w:14.382, h:1.823},
];

// ── Lantai Bawah — 39 gray slots ──────────────────────────────────────
export const BAWAH_GRAY: Slot[] = [
  {l:75.0,   t:8.782,  w:5.792,  h:4.308},
  {l:33.301, t:8.948,  w:5.212,  h:4.308},
  {l:39.575, t:8.948,  w:5.309,  h:4.308},
  {l:45.946, t:8.948,  w:5.212,  h:4.308},
  {l:52.22,  t:8.948,  w:5.309,  h:4.308},
  {l:58.494, t:8.948,  w:4.826,  h:4.391},
  {l:64.382, t:8.948,  w:5.309,  h:4.308},
  {l:70.656, t:8.948,  w:3.282,  h:4.308},
  {l:36.004, t:20.05,  w:1.931,  h:7.291},
  {l:73.649, t:21.541, w:5.792,  h:5.137},
  {l:88.127, t:21.541, w:5.792,  h:5.137},
  {l:73.649, t:27.423, w:5.792,  h:5.054},
  {l:88.127, t:27.423, w:5.792,  h:5.054},
  {l:73.649, t:33.223, w:5.792,  h:5.054},
  {l:88.127, t:33.223, w:5.792,  h:5.054},
  {l:33.784, t:33.471, w:1.448,  h:5.468},
  {l:36.004, t:33.72,  w:8.205,  h:5.22},
  {l:44.981, t:33.72,  w:12.259, h:5.22},
  {l:73.649, t:39.022, w:5.792,  h:5.054},
  {l:87.934, t:39.022, w:5.792,  h:5.054},
  {l:9.363,  t:44.325, w:6.564,  h:3.894},
  {l:87.741, t:45.402, w:6.178,  h:1.16},
  {l:74.035, t:48.053, w:9.363,  h:4.474},
  {l:9.363,  t:48.716, w:6.564,  h:3.894},
  {l:9.363,  t:53.107, w:6.564,  h:3.894},
  {l:74.035, t:53.604, w:6.274,  h:4.474},
  {l:9.363,  t:57.498, w:6.564,  h:3.314},
  {l:73.938, t:59.238, w:6.274,  h:4.557},
  {l:9.363,  t:61.309, w:6.564,  h:2.486},
  {l:88.127, t:62.303, w:5.792,  h:5.137},
  {l:73.938, t:64.872, w:6.178,  h:8.534},
  {l:9.653,  t:67.357, w:6.274,  h:4.474},
  {l:88.127, t:68.103, w:5.792,  h:5.137},
  {l:9.653,  t:72.659, w:6.274,  h:4.557},
  {l:25.386, t:73.488, w:8.977,  h:5.551},
  {l:73.938, t:74.565, w:6.274,  h:9.114},
  {l:88.127, t:74.565, w:5.792,  h:5.054},
  {l:9.653,  t:78.625, w:6.274,  h:6.959},
  {l:25.386, t:80.033, w:8.977,  h:5.551},
];

// ── Component ──────────────────────────────────────────────────────────
interface FloorPlanChartProps {
  floor: "atas" | "bawah";
  rooms: FloorRoom[];
  mode: "admin" | "visitor";
  isDarkMode?: boolean;
  onSlotClick?: (slotId: string, room: FloorRoom | undefined, slot: Slot) => void;
  onRoomClick?: (room: FloorRoom) => void;
}

export function FloorPlanChart({
  floor,
  rooms,
  mode,
  isDarkMode = false,
  onSlotClick,
  onRoomClick,
}: FloorPlanChartProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const blueSlots = floor === "atas" ? ATAS_BLUE : BAWAH_BLUE;
  const graySlots = floor === "atas" ? ATAS_GRAY : BAWAH_GRAY;

  const roomMap = useMemo(() => {
    const map = new Map<string, FloorRoom>();
    rooms.forEach((r) => { if (r.slot_id) map.set(r.slot_id, r); });
    return map;
  }, [rooms]);

  const grayBackground = isDarkMode
    ? "linear-gradient(to bottom right, #334155, #475569, #64748b)"
    : "linear-gradient(to bottom right, #f1f5f9, #e2e8f0, #cbd5e1)";

  return (
    <div
      className={`relative w-full rounded-2xl overflow-visible border ${
        isDarkMode ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"
      }`}
      style={{ aspectRatio: "0.8583" }}
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
        const tooltipBelow = s.t < 18;

        const isClickable = mode === "admin" || hasRoom;

        const blueBackground = (isHovered && isClickable)
          ? "linear-gradient(to bottom right, #60a5fa, #2563eb, #1d4ed8)"
          : "linear-gradient(to bottom right, #3b82f6, #1d4ed8, #1e3a8a)";

        return (
          <div
            key={slotId}
            style={{
              position: "absolute",
              left: `${s.l}%`,
              top: `${s.t}%`,
              width: `${s.w}%`,
              height: `${s.h}%`,
              zIndex: isHovered ? 40 : 2,
              background: blueBackground,
              boxShadow: hasRoom && mode === "admin"
                ? "inset 0 0 0 2px #34d399"
                : isHovered && isClickable
                ? "0 4px 12px rgba(30,58,138,0.5)"
                : undefined,
              cursor: isClickable ? "pointer" : "default",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={() => { if (isClickable) setHoveredId(slotId); }}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => {
              if (mode === "admin") onSlotClick?.(slotId, room, s);
              else if (hasRoom) onRoomClick?.(room);
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

            {/* Visitor: hover tooltip */}
            {mode === "visitor" && hasRoom && isHovered && (
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
                  fontSize: "0.68rem",
                  fontWeight: 600,
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
