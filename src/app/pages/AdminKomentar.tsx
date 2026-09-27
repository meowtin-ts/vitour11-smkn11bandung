import { useState, useEffect } from "react";
import { useDarkMode } from "../contexts/DarkModeContext";
import { Trash2, Loader2, MessageSquare, User, Search, X, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { getSupabaseClient } from "/utils/supabase/client";
import { toast } from "sonner";

interface Comment {
  id: string;
  userEmail: string;
  userName: string;
  userPhoto?: string;
  text: string;
  createdAt: string;
}

export function AdminKomentar() {
  const { isDarkMode } = useDarkMode();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [jumpPage, setJumpPage] = useState("");

  useEffect(() => {
    localStorage.getItem("adminToken");
    fetchComments();
  }, []);

  useEffect(() => { setCurrentPage(1); }, [search, sortDir, rowsPerPage]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("komentar")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Gagal memuat komentar dari database");
        setComments([]);
        return;
      }

      setComments(
        (data || []).map((row: any) => ({
          id: row.id,
          userEmail: row.user_email,
          userName: row.user_name,
          userPhoto: row.user_photo,
          text: row.text,
          createdAt: row.created_at,
        }))
      );
    } catch {
      toast.error("Gagal memuat komentar");
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus komentar ini?")) return;
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from("komentar").delete().eq("id", id);
      if (error) { toast.error("Gagal menghapus komentar: " + error.message); return; }
      toast.success("Berhasil menghapus komentar");
      fetchComments();
    } catch {
      toast.error("Gagal menghapus komentar");
    }
  };

  // Always sort by date; sortDir toggles newest-first vs oldest-first
  const processed = [...comments]
    .filter(c =>
      !search ||
      c.userName.toLowerCase().includes(search.toLowerCase()) ||
      c.userEmail.toLowerCase().includes(search.toLowerCase()) ||
      c.text.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const cmp = a.createdAt.localeCompare(b.createdAt);
      return sortDir === "desc" ? -cmp : cmp;
    });

  const totalPages = Math.max(1, Math.ceil(processed.length / rowsPerPage));
  const paginated = processed.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const startItem = processed.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const endItem = Math.min(currentPage * rowsPerPage, processed.length);

  const jumpTo = () => {
    const p = parseInt(jumpPage);
    if (!isNaN(p) && p >= 1 && p <= totalPages) setCurrentPage(p);
    setJumpPage("");
  };

  const cardCls = `rounded-2xl border ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`;
  const selectCls = `px-3 py-2 rounded-xl border text-sm outline-none cursor-pointer ${isDarkMode ? "bg-slate-900 border-slate-700 text-slate-300" : "bg-white border-slate-200 text-slate-700"}`;
  const pgBtn = `p-2 rounded-lg disabled:opacity-40 transition-colors ${isDarkMode ? "hover:bg-slate-700 text-slate-300" : "hover:bg-slate-100 text-slate-600"}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}>Komentar</h1>
        <p className={isDarkMode ? "text-slate-400" : "text-slate-600"}>Lihat dan kelola komentar dari pengunjung</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className={`flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border ${
          isDarkMode ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"
        }`}>
          <Search size={16} className={isDarkMode ? "text-slate-500" : "text-slate-400"} />
          <input
            type="text"
            placeholder="Cari nama, email, atau isi komentar..."
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
        <button
          onClick={() => setSortDir(d => d === "asc" ? "desc" : "asc")}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-sm font-medium shrink-0 transition-colors ${
            isDarkMode ? "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          <ArrowUpDown size={14} />
          {sortDir === "desc" ? "Baru → Lama" : "Lama → Baru"}
        </button>
      </div>

      {/* List */}
      <div className="space-y-4">
        {paginated.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? "text-slate-700" : "text-slate-300"}`} />
            <p className={isDarkMode ? "text-slate-400" : "text-slate-600"}>
              {search ? `Tidak ada hasil untuk "${search}"` : "Belum ada komentar"}
            </p>
          </div>
        ) : paginated.map((comment) => (
          <div key={comment.id} className={`p-6 ${cardCls}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                {comment.userPhoto ? (
                  <img src={comment.userPhoto} alt={comment.userName} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDarkMode ? "bg-slate-800" : "bg-slate-100"}`}>
                    <User size={24} className={isDarkMode ? "text-slate-600" : "text-slate-400"} />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className={`font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}>{comment.userName}</h3>
                    <span className={`text-sm ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>•</span>
                    <span className={`text-sm ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
                      {new Date(comment.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className={`text-sm mb-2 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>{comment.userEmail}</p>
                  <p className={isDarkMode ? "text-slate-300" : "text-slate-700"}>{comment.text}</p>
                </div>
              </div>
              <button onClick={() => handleDelete(comment.id)} className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shrink-0" title="Hapus komentar">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Pagination */}
      {processed.length > 0 && (
        <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t ${isDarkMode ? "border-slate-800" : "border-slate-200"}`}>
          {/* State indicator */}
          <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
            Menampilkan {startItem}–{endItem} dari {processed.length} komentar
          </p>

          {/* Page buttons */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className={pgBtn}>
                <ChevronLeft size={15} />
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setCurrentPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    p === currentPage ? "bg-blue-600 text-white" : isDarkMode ? "text-slate-400 hover:bg-slate-700" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >{p}</button>
              ))}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className={pgBtn}>
                <ChevronRight size={15} />
              </button>
            </div>
          )}

          {/* Rows per page + Jump to */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className={`text-xs ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>Baris/hal:</span>
              <select value={rowsPerPage} onChange={(e) => setRowsPerPage(Number(e.target.value))} className={selectCls}>
                {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`text-xs ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>Ke hal:</span>
              <input
                type="number" min={1} max={totalPages}
                value={jumpPage}
                onChange={(e) => setJumpPage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && jumpTo()}
                onBlur={jumpTo}
                placeholder={String(currentPage)}
                className={`w-14 px-2 py-1 rounded-lg border text-sm text-center outline-none ${isDarkMode ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-white border-slate-200 text-slate-700"}`}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
