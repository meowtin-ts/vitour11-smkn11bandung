import { useState, useEffect, useRef } from "react";
import {
  Edit,
  Trash2,
  Loader2,
  Building2,
  Search,
  X,
  Upload,
  Save,
  LayoutGrid,
  List,
} from "lucide-react";
import { useDarkMode } from "../contexts/DarkModeContext";
import { getSupabaseClient } from "/utils/supabase/client";
import { toast } from "sonner";
import { FloorPlanChart, type FloorRoom } from "../components/FloorPlanChart";

// ── Extended room type ─────────────────────────────────────────────────
type DbRoom = FloorRoom;

interface DbRoomFoto {
  id: string;
  ruangan_id: string;
  foto_url: string;
  storage_path?: string;
  urutan: number;
}

// ── Modal form ─────────────────────────────────────────────────────────
function RoomFormModal({
  slotId,
  lantai,
  room,
  isDarkMode,
  onClose,
  onSaved,
}: {
  slotId: string;
  lantai: "atas" | "bawah";
  room?: FloorRoom;
  isDarkMode: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    nama_ruangan: room?.nama_ruangan ?? "",
    kode_ruang: room?.kode_ruang ?? "",
    gedung: room?.gedung ?? "",
    ukuran_ruangan: room?.ukuran_ruangan ?? "",
    luas_ruangan: room?.luas_ruangan?.toString() ?? "",
    kondisi_ruangan: room?.kondisi_ruangan ?? "",
    deskripsi: room?.deskripsi ?? "",
    papan_tulis: room?.papan_tulis?.toString() ?? "",
    meja: room?.meja?.toString() ?? "",
    kursi: room?.kursi?.toString() ?? "",
    komputer: room?.komputer?.toString() ?? "",
    kursi_kampus: room?.kursi_kampus?.toString() ?? "",
    cctv: room?.cctv?.toString() ?? "",
    proyektor: room?.proyektor?.toString() ?? "",
    ac: room?.ac?.toString() ?? "",
    kipas_angin: room?.kipas_angin?.toString() ?? "",
    televisi: room?.televisi?.toString() ?? "",
  });
  const [existingPhotos, setExistingPhotos] = useState<DbRoomFoto[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [deletedPhotoIds, setDeletedPhotoIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadingPhotos, setLoadingPhotos] = useState(!!room?.id);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!room?.id) return;
    getSupabaseClient()
      .from("denah_ruangan_foto")
      .select("*")
      .eq("ruangan_id", room.id)
      .order("urutan")
      .then(({ data }) => {
        setExistingPhotos(data ?? []);
        setLoadingPhotos(false);
      });
  }, [room?.id]);

  const handleField = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files);
    const previews = arr.map((f) => URL.createObjectURL(f));
    setNewFiles((prev) => [...prev, ...arr]);
    setNewPreviews((prev) => [...prev, ...previews]);
  };

  const removeNewFile = (i: number) => {
    URL.revokeObjectURL(newPreviews[i]);
    setNewFiles((prev) => prev.filter((_, idx) => idx !== i));
    setNewPreviews((prev) => prev.filter((_, idx) => idx !== i));
  };

  const removeExistingPhoto = (photoId: string) => {
    setDeletedPhotoIds((prev) => [...prev, photoId]);
    setExistingPhotos((prev) => prev.filter((p) => p.id !== photoId));
  };

  const handleSave = async () => {
    if (!form.nama_ruangan.trim()) {
      toast.error("Nama ruangan wajib diisi");
      return;
    }
    setSaving(true);
    try {
      const sb = getSupabaseClient();
      let roomId = room?.id;

      // Upsert room record
      const payload = {
        nama_ruangan: form.nama_ruangan.trim(),
        kode_ruang: form.kode_ruang.trim() || null,
        gedung: form.gedung.trim() || null,
        lantai,
        slot_id: slotId,
        ukuran_ruangan: form.ukuran_ruangan.trim() || null,
        luas_ruangan: form.luas_ruangan ? parseFloat(form.luas_ruangan) : null,
        kondisi_ruangan: form.kondisi_ruangan || null,
        deskripsi: form.deskripsi.trim() || null,
        papan_tulis: form.papan_tulis ? parseInt(form.papan_tulis) : null,
        meja: form.meja ? parseInt(form.meja) : null,
        kursi: form.kursi ? parseInt(form.kursi) : null,
        komputer: form.komputer ? parseInt(form.komputer) : null,
        kursi_kampus: form.kursi_kampus ? parseInt(form.kursi_kampus) : null,
        cctv: form.cctv ? parseInt(form.cctv) : null,
        proyektor: form.proyektor ? parseInt(form.proyektor) : null,
        ac: form.ac ? parseInt(form.ac) : null,
        kipas_angin: form.kipas_angin ? parseInt(form.kipas_angin) : null,
        televisi: form.televisi ? parseInt(form.televisi) : null,
      };

      if (roomId) {
        const { error } = await sb.from("denah_ruangan").update(payload).eq("id", roomId);
        if (error) throw error;
      } else {
        const { data, error } = await sb.from("denah_ruangan").insert(payload).select("id").single();
        if (error) throw error;
        roomId = data.id;
      }

      // Delete removed photos
      if (deletedPhotoIds.length > 0) {
        const photosToDelete = existingPhotos.filter((p) =>
          deletedPhotoIds.includes(p.id)
        );
        const paths = photosToDelete
          .map((p) => p.storage_path)
          .filter(Boolean) as string[];
        if (paths.length > 0) {
          await sb.storage.from("denah-ruangan").remove(paths);
        }
        await sb.from("denah_ruangan_foto").delete().in("id", deletedPhotoIds);
      }

      // Upload new photos
      const existingCount = existingPhotos.length - deletedPhotoIds.length;
      for (let i = 0; i < newFiles.length; i++) {
        const file = newFiles[i];
        const ext = file.name.split(".").pop();
        const path = `${roomId}/${Date.now()}-${i}.${ext}`;
        const { error: uploadErr } = await sb.storage
          .from("denah-ruangan")
          .upload(path, file, { upsert: true });
        if (uploadErr) continue;

        const { data: urlData } = sb.storage
          .from("denah-ruangan")
          .getPublicUrl(path);

        await sb.from("denah_ruangan_foto").insert({
          ruangan_id: roomId,
          foto_url: urlData.publicUrl,
          storage_path: path,
          urutan: existingCount + i + 1,
        });
      }

      toast.success(room?.id ? "Ruangan diperbarui" : "Ruangan ditambahkan");
      onSaved();
    } catch (err: unknown) {
      toast.error("Gagal menyimpan: " + ((err as Error)?.message ?? ""));
    } finally {
      setSaving(false);
    }
  };

  const inputCls = `w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-colors ${
    isDarkMode
      ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-blue-500"
      : "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500"
  }`;
  const labelCls = `text-xs font-semibold uppercase tracking-wide mb-1 block ${
    isDarkMode ? "text-slate-400" : "text-slate-500"
  }`;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4"
      style={{ backdropFilter: "blur(6px)", background: "rgba(0,0,0,0.55)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl shadow-2xl border ${
          isDarkMode ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"
        }`}
      >
        {/* Header */}
        <div className={`sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b ${
          isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"
        }`}>
          <h2 className={`font-bold text-base ${isDarkMode ? "text-white" : "text-slate-900"}`}>
            {room ? "Edit Ruangan" : "Tambah Ruangan"}
          </h2>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-mono px-2 py-0.5 rounded ${
              isDarkMode ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-500"
            }`}>
              {slotId}
            </span>
            <button
              onClick={onClose}
              className={`w-7 h-7 flex items-center justify-center rounded-lg ${
                isDarkMode ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-100 text-slate-500"
              }`}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Lantai (read-only) */}
          <div>
            <label className={labelCls}>Lantai</label>
            <div className={`px-3 py-2.5 rounded-xl border text-sm font-medium ${
              isDarkMode ? "bg-slate-800/50 border-slate-700 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-500"
            }`}>
              {lantai === "atas" ? "Lantai Atas" : "Lantai Bawah"}
            </div>
          </div>

          {/* Nama Ruangan */}
          <div>
            <label className={labelCls}>Nama Ruangan *</label>
            <input
              className={inputCls}
              placeholder="Contoh: Lab Komputer 1"
              value={form.nama_ruangan}
              onChange={(e) => handleField("nama_ruangan", e.target.value)}
            />
          </div>

          {/* Kode + Gedung */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Kode Ruang</label>
              <input
                className={inputCls}
                placeholder="LAB-01"
                value={form.kode_ruang}
                onChange={(e) => handleField("kode_ruang", e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Gedung</label>
              <input
                className={inputCls}
                placeholder="Gedung A"
                value={form.gedung}
                onChange={(e) => handleField("gedung", e.target.value)}
              />
            </div>
          </div>

          {/* Ukuran + Luas */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Ukuran Ruangan</label>
              <input
                className={inputCls}
                placeholder="8 x 10 m"
                value={form.ukuran_ruangan}
                onChange={(e) => handleField("ukuran_ruangan", e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Luas Ruangan (m²)</label>
              <input
                className={inputCls}
                type="number"
                placeholder="80"
                value={form.luas_ruangan}
                onChange={(e) => handleField("luas_ruangan", e.target.value)}
              />
            </div>
          </div>

          {/* Kondisi */}
          <div>
            <label className={labelCls}>Kondisi Ruangan</label>
            <select
              className={inputCls}
              value={form.kondisi_ruangan}
              onChange={(e) => handleField("kondisi_ruangan", e.target.value)}
            >
              <option value="">— Pilih kondisi —</option>
              <option value="Baik">Baik</option>
              <option value="Rusak Ringan">Rusak Ringan</option>
              <option value="Rusak Sedang">Rusak Sedang</option>
              <option value="Rusak Berat">Rusak Berat</option>
            </select>
          </div>

          {/* Deskripsi */}
          <div>
            <label className={labelCls}>Deskripsi</label>
            <textarea
              className={`${inputCls} resize-none`}
              rows={3}
              placeholder="Deskripsi singkat ruangan..."
              value={form.deskripsi}
              onChange={(e) => handleField("deskripsi", e.target.value)}
            />
          </div>

          {/* Inventaris */}
          <div>
            <label className={`${labelCls} mb-2`}>Inventaris Ruangan</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: "papan_tulis", label: "Papan Tulis" },
                { key: "meja",        label: "Meja" },
                { key: "kursi",       label: "Kursi" },
                { key: "komputer",    label: "Komputer" },
                { key: "kursi_kampus",label: "Kursi Kampus" },
                { key: "cctv",        label: "CCTV" },
                { key: "proyektor",   label: "Proyektor" },
                { key: "ac",          label: "AC" },
                { key: "kipas_angin", label: "Kipas Angin" },
                { key: "televisi",    label: "Televisi" },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className={`text-xs mb-1 block ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                    {label}
                  </label>
                  <input
                    className={inputCls}
                    type="number"
                    min="0"
                    placeholder="0"
                    value={form[key as keyof typeof form]}
                    onChange={(e) => handleField(key, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Foto */}
          <div>
            <label className={labelCls}>Foto Ruangan</label>

            {loadingPhotos ? (
              <div className="flex justify-center py-4">
                <Loader2 size={20} className="animate-spin text-blue-500" />
              </div>
            ) : (
              <div className="space-y-2">
                {/* Existing photos */}
                {existingPhotos.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {existingPhotos.map((p) => (
                      <div key={p.id} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200">
                        <img src={p.foto_url} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={() => removeExistingPhoto(p.id)}
                          className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* New file previews */}
                {newPreviews.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {newPreviews.map((url, i) => (
                      <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-blue-300">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={() => removeNewFile(i)}
                          className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center"
                        >
                          <X size={10} />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-blue-600/80 text-white text-center" style={{ fontSize: "0.5rem" }}>
                          Baru
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload button */}
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed text-sm transition-colors ${
                    isDarkMode
                      ? "border-slate-700 text-slate-400 hover:border-blue-500 hover:text-blue-400"
                      : "border-slate-300 text-slate-500 hover:border-blue-400 hover:text-blue-600"
                  }`}
                >
                  <Upload size={15} />
                  Upload Foto
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFiles(e.target.files)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={`sticky bottom-0 flex items-center justify-end gap-2 px-5 py-4 border-t ${
          isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"
        }`}>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              isDarkMode ? "bg-slate-800 hover:bg-slate-700 text-slate-300" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors disabled:opacity-60"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────
type Tab = "semua" | "atas" | "bawah";

export function AdminDenahRuangan() {
  const { isDarkMode } = useDarkMode();
  const [rooms, setRooms] = useState<DbRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("semua");
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSlotId, setModalSlotId] = useState("");
  const [modalLantai, setModalLantai] = useState<"atas" | "bawah">("atas");
  const [modalRoom, setModalRoom] = useState<FloorRoom | undefined>();

  const fetchRooms = async () => {
    setLoading(true);
    const { data, error } = await getSupabaseClient()
      .from("denah_ruangan")
      .select("id, nama_ruangan, kode_ruang, gedung, lantai, kondisi_ruangan, luas_ruangan, ukuran_ruangan, deskripsi, slot_id, papan_tulis, meja, kursi, komputer, kursi_kampus, cctv, proyektor, ac, kipas_angin, televisi")
      .order("lantai")
      .order("created_at", { ascending: true });
    if (!error && data) setRooms(data as DbRoom[]);
    setLoading(false);
  };

  useEffect(() => { fetchRooms(); }, []);

  const openModal = (slotId: string, lantai: "atas" | "bawah", room?: FloorRoom) => {
    setModalSlotId(slotId);
    setModalLantai(lantai);
    setModalRoom(room);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const sb = getSupabaseClient();
      const { data: photos } = await sb
        .from("denah_ruangan_foto")
        .select("storage_path")
        .eq("ruangan_id", id);

      if (photos?.length) {
        const paths = photos.map((p: { storage_path?: string }) => p.storage_path).filter(Boolean) as string[];
        if (paths.length) await sb.storage.from("denah-ruangan").remove(paths);
      }

      const { error } = await sb.from("denah_ruangan").delete().eq("id", id);
      if (error) throw error;

      setRooms((prev) => prev.filter((r) => r.id !== id));
      setConfirmDeleteId(null);
      toast.success("Ruangan berhasil dihapus");
    } catch {
      toast.error("Gagal menghapus ruangan");
    } finally {
      setDeletingId(null);
    }
  };

  const totalAtas = rooms.filter((r) => r.lantai === "atas").length;
  const totalBawah = rooms.filter((r) => r.lantai === "bawah").length;

  const filteredRooms = rooms.filter((r) => {
    const matchSearch =
      !search ||
      r.nama_ruangan.toLowerCase().includes(search.toLowerCase()) ||
      (r.kode_ruang ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (r.gedung ?? "").toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  const kondisiColor = (k?: string) => {
    if (!k) return isDarkMode ? "text-slate-500" : "text-slate-400";
    if (k === "Baik") return "text-emerald-500";
    if (k === "Rusak Ringan") return "text-amber-500";
    if (k === "Rusak Sedang") return "text-orange-500";
    return "text-red-500";
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "semua", label: "Semua" },
    { id: "atas", label: "Lantai Atas" },
    { id: "bawah", label: "Lantai Bawah" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}>
          Kelola Denah Ruangan
        </h1>
        <p className={`text-sm mt-1 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
          {rooms.length} ruangan · {totalAtas} lantai atas · {totalBawah} lantai bawah
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Ruangan", value: rooms.length, color: "blue" },
          { label: "Lantai Atas", value: totalAtas, color: "violet" },
          { label: "Lantai Bawah", value: totalBawah, color: "cyan" },
        ].map((s) => (
          <div
            key={s.label}
            className={`rounded-2xl p-4 border ${
              isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
            }`}
          >
            <p className={`text-2xl font-bold text-${s.color}-500`}>{s.value}</p>
            <p className={`text-xs mt-1 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className={`flex rounded-xl border overflow-hidden w-fit ${isDarkMode ? "border-slate-700" : "border-slate-200"}`}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === t.id
                ? "bg-blue-600 text-white"
                : isDarkMode
                ? "bg-slate-900 text-slate-400 hover:bg-slate-800"
                : "bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {t.id === "semua" ? <List size={14} /> : <LayoutGrid size={14} />}
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Semua tab ── */}
      {activeTab === "semua" && (
        <div className="space-y-4">
          {/* Search */}
          <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border ${
            isDarkMode ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"
          }`}>
            <Search size={16} className={isDarkMode ? "text-slate-500" : "text-slate-400"} />
            <input
              type="text"
              placeholder="Cari nama, kode, atau gedung..."
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

          {/* Table */}
          <div className={`rounded-2xl border overflow-hidden ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={28} className="animate-spin text-blue-500" />
              </div>
            ) : filteredRooms.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Building2 size={40} className={isDarkMode ? "text-slate-700" : "text-slate-300"} />
                <p className={`text-sm ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
                  {search ? "Tidak ada ruangan yang cocok" : "Belum ada data ruangan"}
                </p>
                {!search && (
                  <p className={`text-xs text-center max-w-xs ${isDarkMode ? "text-slate-600" : "text-slate-400"}`}>
                    Klik area biru pada tab Lantai Atas atau Lantai Bawah untuk menambah ruangan
                  </p>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className={`border-b ${isDarkMode ? "border-slate-800" : "border-slate-100"}`}>
                      {["Nama Ruangan", "Kode", "Gedung", "Lantai", "Slot", "Luas", "Kondisi", "Aksi"].map((h) => (
                        <th
                          key={h}
                          className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${
                            isDarkMode ? "text-slate-500" : "text-slate-400"
                          }`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRooms.map((room, idx) => (
                      <tr
                        key={room.id}
                        className={`border-b transition-colors ${
                          isDarkMode
                            ? `border-slate-800/60 ${idx % 2 === 0 ? "" : "bg-slate-800/20"} hover:bg-slate-800/50`
                            : `border-slate-100 ${idx % 2 === 0 ? "" : "bg-slate-50/50"} hover:bg-blue-50/30`
                        }`}
                      >
                        <td className={`px-4 py-3 font-medium ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                          {room.nama_ruangan}
                        </td>
                        <td className={`px-4 py-3 font-mono text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                          {room.kode_ruang ?? "—"}
                        </td>
                        <td className={`px-4 py-3 ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
                          {room.gedung ?? "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                            room.lantai === "atas"
                              ? "bg-blue-500/15 text-blue-500"
                              : "bg-cyan-500/15 text-cyan-500"
                          }`}>
                            {room.lantai === "atas" ? "Lantai Atas" : "Lantai Bawah"}
                          </span>
                        </td>
                        <td className={`px-4 py-3 font-mono text-xs ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
                          {room.slot_id ?? "—"}
                        </td>
                        <td className={`px-4 py-3 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                          {room.luas_ruangan ? `${room.luas_ruangan} m²` : "—"}
                        </td>
                        <td className={`px-4 py-3 font-medium ${kondisiColor(room.kondisi_ruangan)}`}>
                          {room.kondisi_ruangan ?? "—"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openModal(room.slot_id, room.lantai, room)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                isDarkMode
                                  ? "hover:bg-slate-700 text-slate-400 hover:text-blue-400"
                                  : "hover:bg-blue-50 text-slate-500 hover:text-blue-600"
                              }`}
                              title="Edit"
                            >
                              <Edit size={15} />
                            </button>
                            {confirmDeleteId === room.id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleDelete(room.id)}
                                  disabled={deletingId === room.id}
                                  className="px-2 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors"
                                >
                                  {deletingId === room.id ? (
                                    <Loader2 size={12} className="animate-spin" />
                                  ) : (
                                    "Hapus"
                                  )}
                                </button>
                                <button
                                  onClick={() => setConfirmDeleteId(null)}
                                  className={`px-2 py-1 rounded-lg text-xs font-semibold transition-colors ${
                                    isDarkMode
                                      ? "bg-slate-700 hover:bg-slate-600 text-slate-300"
                                      : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                                  }`}
                                >
                                  Batal
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmDeleteId(room.id)}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  isDarkMode
                                    ? "hover:bg-red-500/20 text-slate-400 hover:text-red-400"
                                    : "hover:bg-red-50 text-slate-500 hover:text-red-600"
                                }`}
                                title="Hapus"
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Floor chart tabs ── */}
      {(activeTab === "atas" || activeTab === "bawah") && (
        <div className="space-y-3">
          <p className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
            <span className="inline-block w-3 h-3 bg-blue-600 rounded-sm mr-1.5 align-middle" />
            Klik area biru untuk tambah/edit ruangan
            <span className={`mx-2 ${isDarkMode ? "text-slate-600" : "text-slate-300"}`}>·</span>
            <span className={`inline-block w-3 h-3 rounded-sm mr-1.5 align-middle ${isDarkMode ? "bg-slate-600" : "bg-slate-300"}`} />
            Area abu tidak interaktif
            <span className={`mx-2 ${isDarkMode ? "text-slate-600" : "text-slate-300"}`}>·</span>
            <span className="inline-block w-3 h-3 bg-emerald-500/80 rounded-sm mr-1.5 align-middle border border-emerald-400" />
            Sudah diisi
          </p>
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 size={32} className="animate-spin text-blue-500" />
            </div>
          ) : (
            <div className="max-w-3xl">
              <FloorPlanChart
                floor={activeTab}
                rooms={rooms.filter((r) => r.lantai === activeTab)}
                mode="admin"
                isDarkMode={isDarkMode}
                onSlotClick={(slotId, room) => {
                  openModal(slotId, activeTab, room as FloorRoom | undefined);
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <RoomFormModal
          slotId={modalSlotId}
          lantai={modalLantai}
          room={modalRoom}
          isDarkMode={isDarkMode}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false);
            fetchRooms();
          }}
        />
      )}
    </div>
  );
}
