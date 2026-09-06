import { useState, useEffect } from "react";
import { useDarkMode } from "../contexts/DarkModeContext";
import { Trash2, Loader2, MessageSquare, User } from "lucide-react";
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
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("adminToken");
    setToken(storedToken);
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      setLoading(true);

      const supabase = getSupabaseClient();

      // Fetch komentar langsung dari Supabase table
      const { data, error } = await supabase
        .from("komentar")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Fetch comments error:", error);
        toast.error("Gagal memuat komentar dari database");
        setComments([]);
        return;
      }

      // Map data ke format Comment interface
      const mappedComments = (data || []).map((row: any) => ({
        id: row.id,
        userEmail: row.user_email,
        userName: row.user_name,
        userPhoto: row.user_photo,
        text: row.text,
        createdAt: row.created_at,
      }));

      setComments(mappedComments);
      console.log("✅ Fetched", mappedComments.length, "comments from Supabase");
    } catch (error) {
      console.error("Fetch comments error:", error);
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

      // Delete langsung dari Supabase table
      const { error } = await supabase
        .from("komentar")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Delete comment error:", error);
        toast.error("Gagal menghapus komentar: " + error.message);
        return;
      }

      console.log("✅ Comment deleted:", id);
      toast.success("Berhasil menghapus komentar");

      // Refresh data setelah delete
      fetchComments();
    } catch (error) {
      console.error("Delete comment error:", error);
      toast.error("Gagal menghapus komentar");
    }
  };

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
        <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
          Komentar
        </h1>
        <p className={isDarkMode ? "text-slate-400" : "text-slate-600"}>
          Lihat dan kelola komentar dari pengunjung
        </p>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? "text-slate-700" : "text-slate-300"}`} />
            <p className={isDarkMode ? "text-slate-400" : "text-slate-600"}>
              Belum ada komentar
            </p>
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className={`p-6 rounded-2xl border ${
                isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  {/* User Photo */}
                  {comment.userPhoto ? (
                    <img
                      src={comment.userPhoto}
                      alt={comment.userName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isDarkMode ? "bg-slate-800" : "bg-slate-100"
                    }`}>
                      <User size={24} className={isDarkMode ? "text-slate-600" : "text-slate-400"} />
                    </div>
                  )}

                  {/* Comment Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                        {comment.userName}
                      </h3>
                      <span className={`text-sm ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
                        •
                      </span>
                      <span className={`text-sm ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
                        {new Date(comment.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className={`text-sm mb-2 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                      {comment.userEmail}
                    </p>
                    <p className={isDarkMode ? "text-slate-300" : "text-slate-700"}>
                      {comment.text}
                    </p>
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shrink-0"
                  title="Hapus komentar"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
