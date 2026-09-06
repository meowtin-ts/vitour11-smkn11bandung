import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  Save,
  Loader2,
  Upload,
  X,
  Trash2,
  Images,
  GripVertical,
} from "lucide-react";
import { useDarkMode } from "../contexts/DarkModeContext";
import { getSupabaseClient } from "/utils/supabase/client";
import { toast } from "sonner";

const BUCKET = "denah-ruangan";

interface FormData {
  nama_ruangan: string;
  kode_ruang: string;
  gedung: string;
  lantai: "atas" | "bawah";
  ukuran_ruangan: string;
  luas_ruangan: string;
  kondisi_ruangan: string;
  deskripsi: string;
  pos_x: string;
  pos_y: string;
  pos_w: string;
  pos_h: string;
  urutan: string;
}

interface ExistingPhoto {
  id: string;
  foto_url: string;
  storage_path?: string;
  urutan: number;
}

const DEFAULT_FORM: FormData = {
  nama_ruangan: "",
  kode_ruang: "",
  gedung: "",
  lantai: "bawah",
  ukuran_ruangan: "",
  luas_ruangan: "",
  kondisi_ruangan: "Baik",
  deskripsi: "",
  pos_x: "10",
  pos_y: "10",
  pos_w: "5",
  pos_h: "5",
  urutan: "0",
};

export function AdminDenahRuanganForm() {
  const { isDarkMode } = useDarkMode();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const [form, setForm] = useState<FormData>(DEFAULT_FORM);
  const [existingPhotos, setExistingPhotos] = useState<ExistingPhoto[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [deletingPhotoIds, setDeletingPhotoIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing data in edit mode
  useEffect(() => {
    if (!isEdit) return;
    const load = async () => {
      const [{ data: room }, { data: photos }] = await Promise.all([
        getSupabaseClient().from("denah_ruangan").select("*").eq("id", id).single(),
        getSupabaseClient()
          .from("denah_ruangan_foto")
          .select("id, foto_url, storage_path, urutan")
          .eq("ruangan_id", id)
          .order("urutan"),
      ]);

      if (room) {
        setForm({
          nama_ruangan: room.nama_ruangan ?? "",
          kode_ruang: room.kode_ruang ?? "",
          gedung: room.gedung ?? "",
          lantai: room.lantai ?? "bawah",
          ukuran_ruangan: room.ukuran_ruangan ?? "",
          luas_ruangan: room.luas_ruangan != null ? String(room.luas_ruangan) : "",
          kondisi_ruangan: room.kondisi_ruangan ?? "Baik",
          deskripsi: room.deskripsi ?? "",
          pos_x: String(room.pos_x ?? 10),
          pos_y: String(room.pos_y ?? 10),
          pos_w: String(room.pos_w ?? 5),
          pos_h: String(room.pos_h ?? 5),
          urutan: String(room.urutan ?? 0),
        });
      }
      setExistingPhotos(photos ?? []);
      setLoading(false);
    };
    load();
  }, [id, isEdit]);

  const set = (key: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const valid = files.filter((f) => f.type.startsWith("image/") && f.size <= 10 * 1024 * 1024);
    if (valid.length < files.length) toast.warning("Beberapa file dilewati (bukan gambar atau >10MB)");
    setNewFiles((prev) => [...prev, ...valid]);
    valid.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setNewPreviews((prev) => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeNewFile = (idx: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== idx));
    setNewPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const deleteExistingPhoto = async (photo: ExistingPhoto) => {
    setDeletingPhotoIds((prev) => new Set(prev).add(photo.id));
    try {
      if (photo.storage_path) {
        await getSupabaseClient().storage.from(BUCKET).remove([photo.storage_path]);
      }
      await getSupabaseClient().from("denah_ruangan_foto").delete().eq("id", photo.id);
      setExistingPhotos((prev) => prev.filter((p) => p.id !== photo.id));
    } catch {
      toast.error("Gagal menghapus foto");
    } finally {
      setDeletingPhotoIds((prev) => { const s = new Set(prev); s.delete(photo.id); return s; });
    }
  };

  const ensureBucket = async () => {
    const { error } = await getSupabaseClient().storage.createBucket(BUCKET, {
      public: true,
      allowedMimeTypes: ["image/*"],
      fileSizeLimit: 10485760,
    });
    // Ignore "already exists" error
    if (error && !error.message.includes("already exists")) {
      console.warn("Bucket creation warning:", error.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama_ruangan.trim()) { toast.error("Nama ruangan wajib diisi"); return; }

    setSaving(true);
    try {
      await ensureBucket();

      const payload = {
        nama_ruangan: form.nama_ruangan.trim(),
        kode_ruang: form.kode_ruang.trim() || null,
        gedung: form.gedung.trim() || null,
        lantai: form.lantai,
        ukuran_ruangan: form.ukuran_ruangan.trim() || null,
        luas_ruangan: form.luas_ruangan ? parseFloat(form.luas_ruangan) : null,
        kondisi_ruangan: form.kondisi_ruangan || null,
        deskripsi: form.deskripsi.trim() || null,
        pos_x: parseFloat(form.pos_x) || 0,
        pos_y: parseFloat(form.pos_y) || 0,
        pos_w: parseFloat(form.pos_w) || 5,
        pos_h: parseFloat(form.pos_h) || 5,
        urutan: parseInt(form.urutan) || 0,
        updated_at: new Date().toISOString(),
      };

      let roomId = id;

      if (isEdit) {
        const { error } = await getSupabaseClient().from("denah_ruangan").update(payload).eq("id", id);
        if (error) throw error;
      } else {
        const { data, error } = await getSupabaseClient().from("denah_ruangan").insert(payload).select("id").single();
        if (error) throw error;
        roomId = data.id;
      }

      // Upload new photos
      const currentMaxUrutan = existingPhotos.length > 0
        ? Math.max(...existingPhotos.map((p) => p.urutan))
        : -1;

      for (let i = 0; i < newFiles.length; i++) {
        const file = newFiles[i];
        const ext = file.name.split(".").pop();
        const path = `${roomId}/${Date.now()}-${i}.${ext}`;
        const { error: upErr } = await getSupabaseClient().storage.from(BUCKET).upload(path, file, { upsert: false });
        if (upErr) { toast.error(`Gagal upload foto ${i + 1}`); continue; }

        const { data: urlData } = getSupabaseClient().storage.from(BUCKET).getPublicUrl(path);
        await getSupabaseClient().from("denah_ruangan_foto").insert({
          ruangan_id: roomId,
          foto_url: urlData.publicUrl,
          storage_path: path,
          urutan: currentMaxUrutan + 1 + i,
        });
      }

      toast.success(isEdit ? "Ruangan berhasil diperbarui" : "Ruangan berhasil ditambahkan");
      navigate("/admin-dashboard/denah-ruangan");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      toast.error(`Gagal menyimpan: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  const inputCls = `w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-colors focus:ring-2 focus:ring-blue-500/30 ${
    isDarkMode
      ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-blue-500"
      : "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500"
  }`;

  const labelCls = `block text-xs font-semibold uppercase tracking-wide mb-1.5 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={32} className="animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate("/admin-dashboard/denah-ruangan")}
          className={`p-2 rounded-xl border transition-colors ${
            isDarkMode
              ? "border-slate-700 hover:bg-slate-800 text-slate-400"
              : "border-slate-200 hover:bg-slate-50 text-slate-600"
          }`}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}>
            {isEdit ? "Edit Ruangan" : "Tambah Ruangan"}
          </h1>
          <p className={`text-sm mt-0.5 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
            {isEdit ? "Perbarui informasi ruangan" : "Tambahkan ruangan baru ke denah"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── Section: Informasi Ruangan ── */}
        <div className={`rounded-2xl border p-6 space-y-4 ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
          <h2 className={`text-base font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}>
            Informasi Ruangan
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelCls}>Nama Ruangan *</label>
              <input
                type="text"
                value={form.nama_ruangan}
                onChange={set("nama_ruangan")}
                placeholder="Contoh: Ruang Teori 7"
                className={inputCls}
                required
              />
            </div>

            <div>
              <label className={labelCls}>Kode Ruang</label>
              <input
                type="text"
                value={form.kode_ruang}
                onChange={set("kode_ruang")}
                placeholder="Contoh: RT-07"
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Gedung</label>
              <input
                type="text"
                value={form.gedung}
                onChange={set("gedung")}
                placeholder="Contoh: A"
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Lantai *</label>
              <select value={form.lantai} onChange={set("lantai")} className={inputCls}>
                <option value="atas">Lantai Atas</option>
                <option value="bawah">Lantai Bawah</option>
              </select>
            </div>

            <div>
              <label className={labelCls}>Kondisi Ruangan</label>
              <select value={form.kondisi_ruangan} onChange={set("kondisi_ruangan")} className={inputCls}>
                <option value="">— Pilih kondisi —</option>
                <option value="Baik">Baik</option>
                <option value="Rusak Ringan">Rusak Ringan</option>
                <option value="Rusak Sedang">Rusak Sedang</option>
                <option value="Rusak Berat">Rusak Berat</option>
              </select>
            </div>

            <div>
              <label className={labelCls}>Ukuran Ruangan</label>
              <input
                type="text"
                value={form.ukuran_ruangan}
                onChange={set("ukuran_ruangan")}
                placeholder="Contoh: 8 x 7 meter"
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Luas Ruangan (m²)</label>
              <input
                type="number"
                value={form.luas_ruangan}
                onChange={set("luas_ruangan")}
                placeholder="Contoh: 56"
                min="0"
                step="0.01"
                className={inputCls}
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelCls}>Deskripsi</label>
              <textarea
                value={form.deskripsi}
                onChange={set("deskripsi")}
                placeholder="Deskripsi singkat tentang ruangan ini..."
                rows={3}
                className={`${inputCls} resize-none`}
              />
            </div>
          </div>
        </div>

        {/* ── Section: Foto Ruangan ── */}
        <div className={`rounded-2xl border p-6 space-y-4 ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
          <h2 className={`text-base font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}>
            Foto Ruangan
          </h2>

          {/* Existing photos */}
          {existingPhotos.length > 0 && (
            <div>
              <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
                Foto Tersimpan
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {existingPhotos.map((photo) => (
                  <div key={photo.id} className="relative group aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                    <img
                      src={photo.foto_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => deleteExistingPhoto(photo)}
                        disabled={deletingPhotoIds.has(photo.id)}
                        className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-all"
                      >
                        {deletingPhotoIds.has(photo.id) ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New photos preview */}
          {newPreviews.length > 0 && (
            <div>
              <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
                Foto Baru ({newFiles.length})
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {newPreviews.map((preview, i) => (
                  <div key={i} className="relative group aspect-video rounded-xl overflow-hidden border border-blue-400/50">
                    <img src={preview} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeNewFile(i)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg"
                    >
                      <X size={12} />
                    </button>
                    <div className="absolute inset-0 flex items-end p-1.5 pointer-events-none">
                      <GripVertical size={12} className="text-white/60" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload area */}
          <div>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`w-full flex flex-col items-center justify-center gap-2 py-8 rounded-xl border-2 border-dashed transition-colors ${
                isDarkMode
                  ? "border-slate-700 hover:border-blue-500/50 hover:bg-blue-500/5 text-slate-500 hover:text-blue-400"
                  : "border-slate-200 hover:border-blue-400/50 hover:bg-blue-50/50 text-slate-400 hover:text-blue-600"
              }`}
            >
              <Images size={28} />
              <div className="text-center">
                <p className="text-sm font-medium">Klik untuk pilih foto</p>
                <p className="text-xs mt-0.5">Bisa pilih lebih dari 1 foto · Maks. 10 MB/foto</p>
              </div>
            </button>
          </div>
        </div>

        {/* ── Section: Posisi pada Denah ── */}
        <div className={`rounded-2xl border p-6 space-y-4 ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
          <div>
            <h2 className={`text-base font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}>
              Posisi pada Denah
            </h2>
            <p className={`text-xs mt-1 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
              Koordinat dan ukuran dalam persen (%) dari area denah (0–100)
            </p>
          </div>

          {/* Preview dot */}
          <div
            className={`relative w-full rounded-xl border overflow-hidden ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-200"}`}
            style={{ paddingBottom: "40%" }}
          >
            <div style={{ position: "absolute", inset: 0 }}>
              <div
                className="absolute bg-blue-600 rounded flex items-center justify-center text-white"
                style={{
                  left: `${parseFloat(form.pos_x) || 0}%`,
                  top: `${parseFloat(form.pos_y) || 0}%`,
                  width: `${parseFloat(form.pos_w) || 5}%`,
                  height: `${parseFloat(form.pos_h) || 5}%`,
                  minWidth: "4px",
                  minHeight: "4px",
                }}
              >
                <span className="text-[0.4rem] truncate px-0.5">{form.kode_ruang || "R"}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {(["pos_x", "pos_y", "pos_w", "pos_h"] as const).map((k) => (
              <div key={k}>
                <label className={labelCls}>
                  {k === "pos_x" ? "Posisi X (%)" : k === "pos_y" ? "Posisi Y (%)" : k === "pos_w" ? "Lebar (%)" : "Tinggi (%)"}
                </label>
                <input
                  type="number"
                  value={form[k]}
                  onChange={set(k)}
                  min="0"
                  max="100"
                  step="0.1"
                  className={inputCls}
                />
              </div>
            ))}
          </div>

          <div className="max-w-[120px]">
            <label className={labelCls}>Urutan</label>
            <input
              type="number"
              value={form.urutan}
              onChange={set("urutan")}
              min="0"
              className={inputCls}
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3 pb-8">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold transition-colors shadow-lg shadow-blue-500/25"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin-dashboard/denah-ruangan")}
            className={`px-6 py-3 rounded-xl font-semibold transition-colors border ${
              isDarkMode
                ? "border-slate-700 text-slate-400 hover:bg-slate-800"
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}
