import { useState, useRef } from "react";
import { MapPin, X, CheckCircle, Plus, Trash2, Info, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface Hotspot {
  id: number;
  x: number; // Posisi X dalam %
  y: number; // Posisi Y dalam %
  type: "scene" | "info";
  text: string; // Nama/tooltip
  targetId: string | null; // Scene ID tujuan (untuk type "scene")
}

interface HotspotCanvasProps {
  imageUrl: string;
  hotspots: Hotspot[];
  onHotspotsChange: (hotspots: Hotspot[]) => void;
  availableScenes: Array<{ id: string; name: string }>; // Daftar scene untuk dropdown
  isDarkMode: boolean;
}

export function HotspotCanvas({
  imageUrl,
  hotspots,
  onHotspotsChange,
  availableScenes,
  isDarkMode,
}: HotspotCanvasProps) {
  const [showModal, setShowModal] = useState(false);
  const [pendingPos, setPendingPos] = useState({ x: 0, y: 0 });
  const [modalData, setModalData] = useState({ type: "scene" as "scene" | "info", text: "", targetId: "" });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  // Handle klik di canvas
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    // Cegah klik jika yang diklik adalah tombol hapus
    if (target.closest(".pin-remove")) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = parseFloat(((e.clientX - rect.left) / rect.width * 100).toFixed(1));
    const y = parseFloat(((e.clientY - rect.top) / rect.height * 100).toFixed(1));

    setPendingPos({ x, y });
    setEditingIndex(null);
    setModalData({ type: "scene", text: "", targetId: "" });

    // Ripple effect
    const rid = Date.now();
    setRipples([...ripples, { id: rid, x, y }]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== rid)), 500);

    setShowModal(true);
  };

  // Handle simpan hotspot
  const handleSaveHotspot = () => {
    if (!modalData.text.trim()) {
      toast.error("Nama tujuan wajib diisi!");
      return;
    }

    const newHotspot: Hotspot = {
      id: editingIndex !== null ? hotspots[editingIndex].id : Date.now(),
      x: pendingPos.x,
      y: pendingPos.y,
      type: modalData.type,
      text: modalData.text,
      targetId: modalData.type === "scene" ? modalData.targetId || null : null,
    };

    let updatedHotspots: Hotspot[];
    if (editingIndex !== null) {
      updatedHotspots = [...hotspots];
      updatedHotspots[editingIndex] = newHotspot;
      toast.success("Hotspot diupdate!");
    } else {
      updatedHotspots = [...hotspots, newHotspot];
      toast.success("Hotspot ditambahkan!");
    }

    onHotspotsChange(updatedHotspots);
    setShowModal(false);
  };

  // Handle hapus hotspot
  const removeHotspot = (index: number) => {
    const updatedHotspots = hotspots.filter((_, i) => i !== index);
    onHotspotsChange(updatedHotspots);
    toast.success("Hotspot dihapus!");
  };

  // Handle edit hotspot (klik pin)
  const handleEditHotspot = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const hs = hotspots[index];
    setEditingIndex(index);
    setPendingPos({ x: hs.x, y: hs.y });
    setModalData({
      type: hs.type,
      text: hs.text,
      targetId: hs.targetId || "",
    });
    setShowModal(true);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <label className="flex items-center gap-2 font-semibold text-sm">
          <MapPin size={20} className="text-green-500" />
          Hotspots Interaktif
          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
            isDarkMode ? "bg-green-500/20 text-green-300" : "bg-green-100 text-green-600"
          }`}>
            {hotspots.length} hotspot
          </span>
        </label>
      </div>

      {/* Canvas */}
      <div
        className={`relative w-full rounded-xl overflow-hidden cursor-crosshair min-h-[300px] border-2 ${
          isDarkMode ? "bg-slate-900 border-slate-700" : "bg-slate-100 border-slate-300"
        }`}
        onClick={handleCanvasClick}
      >
        {imageUrl ? (
          <img src={imageUrl} alt="Panorama" className="w-full block select-none pointer-events-none" />
        ) : (
          <div className={`py-20 flex flex-col items-center justify-center ${
            isDarkMode ? "text-slate-600" : "text-slate-400"
          }`}>
            <MapPin size={48} className="opacity-30 mb-2" />
            <p>Belum ada gambar</p>
          </div>
        )}

        {/* Ripple Effects */}
        {ripples.map((r) => (
          <div
            key={r.id}
            className="absolute w-8 h-8 border-2 border-green-500 rounded-full animate-ping pointer-events-none"
            style={{
              left: `${r.x}%`,
              top: `${r.y}%`,
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}

        {/* Hotspot Pins */}
        {hotspots.map((hs, i) => (
          <div
            key={hs.id}
            className="absolute group/pin cursor-pointer flex flex-col items-center z-10"
            style={{
              left: `${hs.x}%`,
              top: `${hs.y}%`,
              transform: "translate(-50%, -100%)",
            }}
            onClick={(e) => handleEditHotspot(i, e)}
          >
            {/* Tombol Hapus (muncul saat hover) */}
            <button
              className="pin-remove absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover/pin:opacity-100 transition-opacity z-20 hover:bg-red-600"
              onClick={(e) => {
                e.stopPropagation();
                removeHotspot(i);
              }}
            >
              <X size={10} />
            </button>

            {/* Pin Head */}
            <div
              className={`w-7 h-7 border-2 border-white rounded-full rounded-br-none shadow-lg flex items-center justify-center ${
                hs.type === "scene" ? "bg-green-500" : "bg-blue-500"
              }`}
              style={{ transform: "rotate(-45deg)" }}
            >
              {hs.type === "scene" ? (
                <MapPin size={12} className="text-white" style={{ transform: "rotate(45deg)" }} />
              ) : (
                <AlertCircle size={12} className="text-white" style={{ transform: "rotate(45deg)" }} />
              )}
            </div>

            {/* Pin Tail */}
            <div className="w-[2px] h-2 bg-white shadow-md"></div>

            {/* Tooltip */}
            {hs.text && (
              <div className={`text-[10px] px-2 py-1 rounded mt-1 whitespace-nowrap max-w-[120px] overflow-hidden text-ellipsis ${
                isDarkMode ? "bg-black/90 text-white" : "bg-black/75 text-white"
              }`}>
                {hs.text}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Hotspot Table */}
      {hotspots.length > 0 && (
        <div className="mt-4 overflow-hidden border rounded-lg">
          <table className={`w-full text-sm text-left ${
            isDarkMode ? "bg-slate-800" : "bg-white"
          }`}>
            <thead className={isDarkMode ? "bg-slate-700 border-b border-slate-600" : "bg-slate-50 border-b"}>
              <tr>
                <th className="px-4 py-2">#</th>
                <th className="px-4 py-2">Posisi (X,Y)</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Tooltip</th>
                <th className="px-4 py-2">Target Scene</th>
                <th className="px-4 py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {hotspots.map((hs, i) => (
                <tr
                  key={hs.id}
                  className={`border-b last:border-0 ${
                    isDarkMode ? "border-slate-700 hover:bg-slate-700/50" : "hover:bg-slate-50"
                  } transition`}
                >
                  <td className="px-4 py-2">{i + 1}</td>
                  <td className="px-4 py-2 font-mono text-[11px]">
                    {hs.x}%, {hs.y}%
                  </td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      hs.type === "scene"
                        ? "bg-green-500/20 text-green-500"
                        : "bg-blue-500/20 text-blue-500"
                    }`}>
                      {hs.type}
                    </span>
                  </td>
                  <td className="px-4 py-2">{hs.text}</td>
                  <td className="px-4 py-2">
                    {hs.targetId ? (
                      <span className="text-green-500 font-semibold">
                        {availableScenes.find(s => s.id === hs.targetId)?.name || hs.targetId}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => removeHotspot(i)}
                      className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      <Trash2 size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
          <div
            className={`rounded-2xl w-full max-w-[440px] p-6 shadow-2xl animate-in zoom-in-95 duration-200 ${
              isDarkMode ? "bg-slate-800" : "bg-white"
            }`}
          >
            <h6 className={`font-bold text-lg mb-4 flex items-center gap-2 ${
              isDarkMode ? "text-white" : "text-slate-900"
            }`}>
              <MapPin size={20} className="text-green-500" />
              {editingIndex !== null ? "Edit" : "Tambah"} Hotspot
            </h6>

            <div className="space-y-4">
              {/* Type Hotspot */}
              <div>
                <label className={`block text-sm font-semibold mb-1 ${
                  isDarkMode ? "text-slate-300" : "text-slate-600"
                }`}>
                  Type Hotspot <span className="text-red-500">*</span>
                </label>
                <select
                  value={modalData.type}
                  onChange={(e) => setModalData({ ...modalData, type: e.target.value as "scene" | "info" })}
                  className={`w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-green-500/20 ${
                    isDarkMode
                      ? "bg-slate-900 border-slate-700 text-white"
                      : "bg-white border-slate-300"
                  }`}
                >
                  <option value="scene">Scene (Navigasi ke panorama lain)</option>
                  <option value="info">Info (Informasi tooltip saja)</option>
                </select>
              </div>

              {/* Nama Tujuan / Deskripsi */}
              <div>
                <label className={`block text-sm font-semibold mb-1 ${
                  isDarkMode ? "text-slate-300" : "text-slate-600"
                }`}>
                  {modalData.type === "scene" ? "Nama Tujuan" : "Deskripsi"} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  autoFocus
                  value={modalData.text}
                  onChange={(e) => setModalData({ ...modalData, text: e.target.value })}
                  className={`w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-green-500/20 ${
                    isDarkMode
                      ? "bg-slate-900 border-slate-700 text-white"
                      : "bg-white border-slate-300"
                  }`}
                  placeholder={modalData.type === "scene" ? "Contoh: Ke Perpustakaan" : "Contoh: Ruang kelas dengan fasilitas lengkap"}
                />
              </div>

              {/* Target Scene (hanya jika type = scene) */}
              {modalData.type === "scene" && (
                <div>
                  <label className={`block text-sm font-semibold mb-1 ${
                    isDarkMode ? "text-slate-300" : "text-slate-600"
                  }`}>
                    Panorama Tujuan
                  </label>
                  {availableScenes.length === 0 ? (
                    <div className={`w-full border rounded-lg p-2.5 text-sm ${
                      isDarkMode
                        ? "bg-slate-900 border-slate-700 text-slate-500"
                        : "bg-slate-50 border-slate-300 text-slate-400"
                    }`}>
                      Belum ada panorama lain
                    </div>
                  ) : (
                    <select
                      value={modalData.targetId}
                      onChange={(e) => setModalData({ ...modalData, targetId: e.target.value })}
                      className={`w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-green-500/20 ${
                        isDarkMode
                          ? "bg-slate-900 border-slate-700 text-white"
                          : "bg-white border-slate-300"
                      }`}
                    >
                      <option value="">— Pilih panorama tujuan —</option>
                      {availableScenes.map((scene) => (
                        <option key={scene.id} value={scene.id}>
                          {scene.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveHotspot}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-full font-bold transition flex items-center justify-center gap-1"
              >
                <CheckCircle size={16} /> Simpan
              </button>
              <button
                onClick={() => setShowModal(false)}
                className={`flex-1 py-2 rounded-full font-bold transition ${
                  isDarkMode
                    ? "bg-slate-700 hover:bg-slate-600 text-white"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                }`}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
