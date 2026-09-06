import { useState } from "react";
import { useDarkMode } from "../contexts/DarkModeContext";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Lock, User, Eye, EyeOff, AlertCircle } from "lucide-react";
import { getSupabaseClient } from "/utils/supabase/client";
import { toast } from "sonner";

export function AdminLoginPage() {
  const { isDarkMode } = useDarkMode();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validasi sederhana
    if (!email || !password) {
      setError("Email dan password harus diisi");
      return;
    }

    setLoading(true);

    try {
      const supabase = getSupabaseClient();

      // Authenticate dengan Supabase Auth
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (authError) {
        console.error("Supabase auth error:", authError);

        // Error messages yang lebih friendly
        if (authError.message.includes("Invalid login credentials")) {
          setError("Email atau password salah");
        } else if (authError.message.includes("Email not confirmed")) {
          setError("Email belum diverifikasi. Cek inbox email Anda.");
        } else {
          setError(authError.message);
        }
        setLoading(false);
        return;
      }

      if (data.session && data.user) {
        // Simpan session token dan user info
        localStorage.setItem("adminToken", data.session.access_token);
        localStorage.setItem("adminUser", data.user.email || email);
        localStorage.setItem("adminUserId", data.user.id);

        // Store full session untuk refresh token nanti
        localStorage.setItem("supabase.auth.token", JSON.stringify(data.session));

        toast.success(`Selamat datang, ${data.user.email}!`);
        navigate("/admin-dashboard");
      } else {
        setError("Login gagal. Silakan coba lagi.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Terjadi kesalahan. Pastikan koneksi internet Anda stabil.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={`min-h-screen font-sans ${
      isDarkMode
        ? "bg-slate-900 text-white selection:bg-blue-500/30"
        : "bg-white text-slate-900 selection:bg-blue-200"
    }`}>
      {/* Header */}
      <div className={`sticky top-0 z-50 backdrop-blur-md ${
        isDarkMode ? "bg-slate-900/80 border-slate-800" : "bg-white/80 border-slate-200"
      } border-b`}>
        <div className="container mx-auto px-4 md:px-6 py-4 flex items-center gap-4">
          <Link
            to="/customer-service"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isDarkMode ? "hover:bg-slate-800" : "hover:bg-slate-100"
            }`}
          >
            <ArrowLeft size={20} />
            <span>Kembali</span>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 md:px-6 py-16 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="max-w-md w-full">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className={`inline-flex p-4 rounded-full mb-6 ${
              isDarkMode ? "bg-blue-500/10" : "bg-blue-50"
            }`}>
              <Lock className="w-12 h-12 text-blue-500" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
              Admin Login
            </h1>
            <p className={`${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
              Akses dashboard admin untuk mengelola virtual tour
            </p>
          </div>

          {/* Login Form */}
          <div className={`p-8 rounded-2xl shadow-xl ${
            isDarkMode ? "bg-slate-800" : "bg-white border border-slate-200"
          }`}>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email
                </label>
                <div className="relative">
                  <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                    isDarkMode ? "text-slate-400" : "text-slate-500"
                  }`} />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className={`w-full pl-11 pr-4 py-3 rounded-lg transition-colors ${
                      isDarkMode
                        ? "bg-slate-900 border-slate-700 focus:border-blue-500"
                        : "bg-slate-50 border-slate-300 focus:border-blue-500"
                    } border focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50`}
                    placeholder="Email"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                    isDarkMode ? "text-slate-400" : "text-slate-500"
                  }`} />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className={`w-full pl-11 pr-12 py-3 rounded-lg transition-colors ${
                      isDarkMode
                        ? "bg-slate-900 border-slate-700 focus:border-blue-500"
                        : "bg-slate-50 border-slate-300 focus:border-blue-500"
                    } border focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                      isDarkMode ? "text-slate-400 hover:text-slate-300" : "text-slate-500 hover:text-slate-700"
                    } transition-colors disabled:opacity-50`}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className={`flex items-start gap-3 p-4 rounded-lg ${
                  isDarkMode ? "bg-red-500/10 border-red-500/20" : "bg-red-50 border-red-200"
                } border`}>
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-500">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Memproses..." : "Login"}
              </button>
            </form>

            {/* Additional Info */}
            <div className={`mt-6 pt-6 border-t ${isDarkMode ? "border-slate-700" : "border-slate-200"}`}>
              <p className={`text-sm text-center ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                Lupa password? <span className="text-blue-500">Hubungi Administrator</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}