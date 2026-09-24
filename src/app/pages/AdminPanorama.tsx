import { useState, useEffect, useRef } from "react";
import { useDarkMode } from "../contexts/DarkModeContext";
import { useNavigate, Link } from "react-router";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  MapPin,
  Image as ImageIcon,
  Compass,
  Eye,
  Upload,
  Loader2,
  Search,
} from "lucide-react";
import { projectId } from "/utils/supabase/info";
import { getSupabaseClient } from "/utils/supabase/client";
import { toast } from "sonner";
import { PanoramaUploader } from "../components/PanoramaUploader";
import { HotspotCanvas } from "../components/HotspotCanvas";

interface VirtualTour {
  id: string;
  name: string;
  description: string;
  panoramaUrl: string;
  thumbnailUrl?: string;
  order: number;
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
    targetId?: string | null;
  }>;
  autoRotate?: boolean;
  compass?: boolean;
  showInDropdown?: boolean;
  createdAt: string;
  updatedAt: string;
}

export function AdminPanorama() {
  const { isDarkMode } = useDarkMode();
  const navigate = useNavigate();
  const [tours, setTours] = useState<VirtualTour[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTour, setEditingTour] = useState<Partial<VirtualTour> | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // File yang dipilih (belum diupload)

  useEffect(() => {
    const storedToken = localStorage.getItem("adminToken");
    if (!storedToken) {
      navigate("/admin-login");
      return;
    }
    setToken(storedToken);
    verifySession(storedToken);
    fetchTours();
  }, []);

  const verifySession = async (_token: string) => {
    // Auth already verified by AdminDashboard parent — no need to re-verify here
  };

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
        toast.error("Gagal memuat data dari database");
        setTours([]);
        return;
      }

      // Convert snake_case (database) to camelCase (React state)
      const mappedTours: VirtualTour[] = (data || []).map((row: any) => ({
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

      setTours(mappedTours);
      console.log("✅ Fetched", mappedTours.length, "panoramas from Supabase");
    } catch (error) {
      console.error("Fetch tours error:", error);
      toast.error("Gagal memuat data virtual tour");
      setTours([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingTour({
      name: "",
      description: "",
      panoramaUrl: "",
      thumbnailUrl: "",
      order: tours.length + 1,
      showInDropdown: false, // Default: tidak tampilkan di dropdown
      initialView: {
        pitch: 0,
        yaw: 0,
        hfov: 100,
      },
      autoRotate: false,
      compass: false,
      hotspots: [],
    });
    setIsEditing(true);
  };

  const handleEdit = (tour: VirtualTour) => {
    // Convert hotspots from pitch/yaw (from database) to x/y percentages (for canvas)
    const convertedTour = {
      ...tour,
      hotspots: (tour.hotspots || []).map((hs: any) => ({
        id: Date.now() + Math.random(), // Generate unique ID for editing
        x: parseFloat((hs.yaw / 3.6 + 50).toFixed(1)), // Yaw (-180 to 180) → X% (0-100)
        y: parseFloat((50 - hs.pitch / 1.8).toFixed(1)), // Pitch (-90 to 90) → Y% (0-100)
        type: hs.type,
        text: hs.text || "",
        targetId: hs.targetId || null,
      })),
    };
    setEditingTour(convertedTour);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editingTour || !token) return;

    // Validasi: Hanya nama lokasi dan foto panorama yang wajib
    if (!editingTour.name) {
      toast.error("Nama Lokasi wajib diisi!");
      return;
    }

    if (!selectedFile && !editingTour.panoramaUrl) {
      toast.error("Foto Panorama wajib dipilih!");
      return;
    }

    // Upload file jika ada file baru yang dipilih
    let panoramaUrl = editingTour.panoramaUrl;
    if (selectedFile) {
      const uploadToast = toast.loading("Mengupload foto ke server...");

      try {
        // Upload ke Supabase Storage
        const supabase = getSupabaseClient();

        // Generate unique filename
        const timestamp = Date.now();
        const randomId = crypto.randomUUID().split("-")[0];
        const extension = selectedFile.name.split(".").pop() || "jpg";
        const filename = `panorama-${timestamp}-${randomId}.${extension}`;

        // Upload file
        const { data, error } = await supabase.storage
          .from("make-731f136a-panoramas")
          .upload(filename, selectedFile, {
            contentType: selectedFile.type,
            cacheControl: "3600",
            upsert: false,
          });

        if (error) {
          console.error("Upload error:", error);

          let errorMessage = "Upload gagal: ";
          if (error.message.includes("new row violates row-level security")) {
            errorMessage += "Bucket belum dikonfigurasi dengan benar. Silakan hubungi administrator.";
          } else if (error.message.includes("Bucket not found")) {
            errorMessage += "Bucket 'make-731f136a-panoramas' belum dibuat. Silakan hubungi administrator.";
          } else {
            errorMessage += error.message;
          }

          toast.dismiss(uploadToast);
          toast.error(errorMessage);
          return;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from("make-731f136a-panoramas")
          .getPublicUrl(filename);

        panoramaUrl = urlData.publicUrl;
        console.log("✅ Upload success! File uploaded to:", filename);
        console.log("✅ Public URL:", panoramaUrl);
        console.log("🔍 Test URL ini di browser untuk memastikan bisa diakses:", panoramaUrl);
        toast.dismiss(uploadToast);
        // Langsung lanjut simpan tour, toast success akan muncul setelah tour tersimpan
      } catch (error) {
        console.error("Upload error:", error);
        toast.dismiss(uploadToast);
        toast.error(`Upload gagal: ${error instanceof Error ? error.message : "Unknown error"}`);
        return;
      }
    }

    const isUpdate = !!editingTour.id;

    // Convert hotspots from x/y percentages to pitch/yaw coordinates for Pannellum
    const convertedHotspots = (editingTour.hotspots || []).map((hs: any) => {
      const converted = {
        pitch: parseFloat(((50 - hs.y) * 1.8).toFixed(1)), // Y% (0-100) → Pitch (-90 to 90)
        yaw: parseFloat(((hs.x - 50) * 3.6).toFixed(1)), // X% (0-100) → Yaw (-180 to 180)
        type: hs.type,
        text: hs.text,
        targetId: hs.targetId,
      };
      console.log(`🔄 Converting hotspot: X:${hs.x}% Y:${hs.y}% → Pitch:${converted.pitch}° Yaw:${converted.yaw}°`);
      return converted;
    });

    console.log("📊 Total hotspots to save:", convertedHotspots.length);
    console.log("📊 Converted hotspots:", convertedHotspots);

    try {
      const supabase = getSupabaseClient();

      // Prepare tour data for Supabase (map to snake_case columns)
      const tourData = {
        name: editingTour.name,
        description: editingTour.description || "",
        panorama_url: panoramaUrl,
        thumbnail_url: editingTour.thumbnailUrl || null,
        order_index: editingTour.order || tours.length + 1,
        show_in_dropdown: editingTour.showInDropdown !== false,
        initial_pitch: editingTour.initialView?.pitch || 0,
        initial_yaw: editingTour.initialView?.yaw || 0,
        initial_hfov: editingTour.initialView?.hfov || 100,
        auto_rotate: editingTour.autoRotate || false,
        compass: editingTour.compass || false,
        hotspots: convertedHotspots,
        ...(isUpdate && { updated_at: new Date().toISOString() }),
      };

      let result;

      if (isUpdate) {
        // Update existing tour
        result = await supabase
          .from("panoramas")
          .update(tourData)
          .eq("id", editingTour.id)
          .select();
      } else {
        // Insert new tour
        result = await supabase
          .from("panoramas")
          .insert(tourData)
          .select();
      }

      if (result.error) {
        console.error("Save panorama error:", result.error);
        toast.error("Gagal menyimpan: " + result.error.message);
        return;
      }

      console.log("✅ Panorama saved to Supabase:", result.data);
      toast.success(isUpdate ? "Berhasil mengupdate panorama" : "Berhasil menambah panorama");
      setIsEditing(false);
      setEditingTour(null);
      setSelectedFile(null);
      fetchTours();
    } catch (error) {
      console.error("Save panorama error:", error);
      toast.error("Gagal menyimpan panorama");
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;

    if (!confirm("Apakah Anda yakin ingin menghapus tour ini?")) return;

    try {
      const supabase = getSupabaseClient();

      // Delete from Supabase
      const { error } = await supabase
        .from("panoramas")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Delete panorama error:", error);
        toast.error("Gagal menghapus: " + error.message);
        return;
      }

      console.log("✅ Panorama deleted:", id);
      toast.success("Berhasil menghapus panorama");
      fetchTours();
    } catch (error) {
      console.error("Delete panorama error:", error);
      toast.error("Gagal menghapus panorama");
    }
  };


  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
          Panorama
        </h1>
        <p className={isDarkMode ? "text-slate-400" : "text-slate-600"}>
          Kelola data virtual tour SMKN 11 Bandung
        </p>
      </div>

        {/* Search Bar */}
        <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border mb-4 ${
          isDarkMode ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"
        }`}>
          <Search size={16} className={isDarkMode ? "text-slate-500" : "text-slate-400"} />
          <input
            type="text"
            placeholder="Cari nama atau deskripsi panorama..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-slate-400 hover:text-slate-600">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Action Bar */}
        <div className="flex justify-between items-center mb-6">
          <div className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
            Total: {tours.length} lokasi{search && ` • ${tours.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || (t.description ?? "").toLowerCase().includes(search.toLowerCase())).length} hasil`}
          </div>
          <div className="flex items-center gap-3">
            {tours.length > 0 && (
              <Link
                to="/virtual-tour"
                state={{ from: 'admin' }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  isDarkMode
                    ? "bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30"
                    : "bg-green-50 hover:bg-green-100 text-green-600 border border-green-200"
                }`}
              >
                <Eye size={18} />
                <span>Lihat Virtual Tour</span>
              </Link>
            )}
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg"
            >
              <Plus size={18} />
              Tambah Tour Baru
            </button>
          </div>
        </div>

        {/* Tours Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : (() => {
          const filteredTours = tours.filter(t =>
            !search ||
            t.name.toLowerCase().includes(search.toLowerCase()) ||
            (t.description ?? "").toLowerCase().includes(search.toLowerCase())
          );
          return filteredTours.length === 0 ? (
            <div className={`text-center py-20 rounded-xl ${isDarkMode ? "bg-slate-800" : "bg-slate-50"}`}>
              <MapPin className="w-16 h-16 mx-auto mb-4 text-slate-400" />
              <p className={`text-lg ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                {search ? `Tidak ada hasil untuk "${search}"` : "Belum ada data virtual tour"}
              </p>
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTours.map((tour) => (
              <div
                key={tour.id}
                className={`rounded-xl overflow-hidden shadow-lg transition-transform hover:scale-105 ${
                  isDarkMode ? "bg-slate-800" : "bg-white border border-slate-200"
                }`}
              >
                {/* Thumbnail */}
                <div className="relative h-48 bg-gradient-to-br from-blue-500 to-cyan-500">
                  {tour.panoramaUrl ? (
                    <img
                      src={tour.panoramaUrl}
                      alt={tour.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback jika gambar gagal load
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.querySelector('.fallback-icon')?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className="fallback-icon w-full h-full flex items-center justify-center absolute inset-0 hidden">
                    <ImageIcon className="w-16 h-16 text-white/50" />
                  </div>
                  <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm">
                    #{tour.order}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2">{tour.name}</h3>
                  <p
                    className={`text-sm mb-4 line-clamp-2 ${
                      isDarkMode ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    {tour.description}
                  </p>

                  {/* Features */}
                  <div className="flex gap-2 mb-4">
                    {tour.autoRotate && (
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          isDarkMode ? "bg-blue-500/20 text-blue-300" : "bg-blue-50 text-blue-600"
                        }`}
                      >
                        <Compass className="inline w-3 h-3 mr-1" />
                        Auto Rotate
                      </span>
                    )}
                    {tour.compass && (
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          isDarkMode ? "bg-cyan-500/20 text-cyan-300" : "bg-cyan-50 text-cyan-600"
                        }`}
                      >
                        Compass
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(tour)}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                        isDarkMode
                          ? "bg-slate-700 hover:bg-slate-600"
                          : "bg-slate-100 hover:bg-slate-200"
                      }`}
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(tour.id)}
                      className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
                    >
                      <Trash2 size={16} />
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          );
        })()}

      {/* Edit Modal */}
      {isEditing && editingTour && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl ${
              isDarkMode ? "bg-slate-800" : "bg-white"
            }`}
          >
            {/* Modal Header */}
            <div
              className={`sticky top-0 flex items-center justify-between p-6 border-b ${
                isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
              }`}
            >
              <h2 className="text-2xl font-bold">
                {editingTour.id ? "Edit Virtual Tour" : "Tambah Virtual Tour Baru"}
              </h2>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditingTour(null);
                  setSelectedFile(null);
                }}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode ? "hover:bg-slate-700" : "hover:bg-slate-100"
                }`}
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nama Lokasi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editingTour.name || ""}
                  onChange={(e) => setEditingTour({ ...editingTour, name: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                    isDarkMode
                      ? "bg-slate-900 border-slate-700 focus:border-blue-500"
                      : "bg-slate-50 border-slate-300 focus:border-blue-500"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  placeholder="Contoh: Ruang Kelas XI RPL 1"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Deskripsi <span className="text-slate-400 text-xs font-normal">(Opsional)</span>
                </label>
                <textarea
                  value={editingTour.description || ""}
                  onChange={(e) =>
                    setEditingTour({ ...editingTour, description: e.target.value })
                  }
                  rows={3}
                  className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                    isDarkMode
                      ? "bg-slate-900 border-slate-700 focus:border-blue-500"
                      : "bg-slate-50 border-slate-300 focus:border-blue-500"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  placeholder="Deskripsi singkat tentang lokasi ini"
                />
              </div>

              {/* Upload Panorama */}
              <PanoramaUploader
                onFileSelect={(file) => {
                  setSelectedFile(file);
                  // Set temporary URL untuk preview (akan diganti dengan URL real saat upload)
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      setEditingTour({ ...editingTour, panoramaUrl: e.target?.result as string });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                currentUrl={editingTour.panoramaUrl}
                currentFile={selectedFile}
                isDarkMode={isDarkMode}
              />

              {/* Hotspots Canvas Interaktif */}
              {editingTour.panoramaUrl && (
                <div className="mt-6">
                  <HotspotCanvas
                    imageUrl={editingTour.panoramaUrl}
                    hotspots={editingTour.hotspots || []}
                    onHotspotsChange={(newHotspots) => {
                      setEditingTour({
                        ...editingTour,
                        hotspots: newHotspots,
                      });
                    }}
                    availableScenes={tours
                      .filter((t) => t.id !== editingTour.id) // Exclude current tour
                      .map((t) => ({
                        id: t.id,
                        name: t.name,
                      }))}
                    isDarkMode={isDarkMode}
                  />
                </div>
              )}

              {/* Order */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Urutan <span className="text-slate-400 text-xs font-normal">(Opsional)</span>
                </label>
                <input
                  type="number"
                  value={editingTour.order || 1}
                  onChange={(e) =>
                    setEditingTour({ ...editingTour, order: parseInt(e.target.value) })
                  }
                  min={1}
                  className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                    isDarkMode
                      ? "bg-slate-900 border-slate-700 focus:border-blue-500"
                      : "bg-slate-50 border-slate-300 focus:border-blue-500"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                />
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingTour.autoRotate || false}
                    onChange={(e) =>
                      setEditingTour({ ...editingTour, autoRotate: e.target.checked })
                    }
                    className="w-4 h-4 accent-blue-500"
                  />
                  <span className="text-sm">Auto Rotate</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingTour.compass || false}
                    onChange={(e) =>
                      setEditingTour({ ...editingTour, compass: e.target.checked })
                    }
                    className="w-4 h-4 accent-blue-500"
                  />
                  <span className="text-sm">Compass</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingTour.showInDropdown !== false}
                    onChange={(e) =>
                      setEditingTour({ ...editingTour, showInDropdown: e.target.checked })
                    }
                    className="w-4 h-4 accent-blue-500"
                  />
                  <span className="text-sm">Tampilkan di Menu</span>
                </label>
              </div>

            </div>

            {/* Modal Footer */}
            <div
              className={`sticky bottom-0 flex gap-3 p-6 border-t ${
                isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
              }`}
            >
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditingTour(null);
                  setSelectedFile(null);
                }}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? "bg-slate-700 hover:bg-slate-600"
                    : "bg-slate-200 hover:bg-slate-300"
                }`}
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all"
              >
                <Save size={18} />
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}