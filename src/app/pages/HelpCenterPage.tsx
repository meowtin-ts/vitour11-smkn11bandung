import { useDarkMode } from "../contexts/DarkModeContext";
import { Link } from "react-router";
import { ArrowLeft, HelpCircle, MousePointer, Sun, Moon, Volume2, Map, Eye, MessageSquare, Building2, Bot } from "lucide-react";

export function HelpCenterPage() {
  const { isDarkMode } = useDarkMode();

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
      <div className="container mx-auto px-4 md:px-6 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className={`inline-flex p-4 rounded-full mb-6 ${
              isDarkMode ? "bg-blue-500/10" : "bg-blue-50"
            }`}>
              <HelpCircle className="w-12 h-12 text-blue-500" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
              Pusat Panduan
            </h1>
            <p className={`text-lg ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
              Panduan lengkap untuk menjelajahi website SMKN 11 Bandung
            </p>
          </div>

          {/* Guide Sections */}
          <div className="space-y-8">
            {/* Navigasi Dasar */}
            <div className={`p-6 rounded-2xl ${isDarkMode ? "bg-slate-800" : "bg-slate-50"}`}>
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg shrink-0 ${isDarkMode ? "bg-blue-500/10" : "bg-blue-100"}`}>
                  <MousePointer className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-3">Navigasi Dasar</h2>
                  <ul className={`space-y-2 ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>
                    <li>• Gunakan menu navigasi di bagian atas untuk berpindah antar section</li>
                    <li>• Scroll ke bawah untuk menjelajahi semua fitur website</li>
                    <li>• Klik logo SMKN 11 Bandung untuk kembali ke halaman utama</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Mode Malam */}
            <div className={`p-6 rounded-2xl ${isDarkMode ? "bg-slate-800" : "bg-slate-50"}`}>
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg shrink-0 ${isDarkMode ? "bg-blue-500/10" : "bg-blue-100"}`}>
                  {isDarkMode ? <Moon className="w-6 h-6 text-blue-500" /> : <Sun className="w-6 h-6 text-blue-500" />}
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-3">Mode Malam</h2>
                  <ul className={`space-y-2 ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>
                    <li>• Toggle switch di navbar untuk mengaktifkan/menonaktifkan mode malam</li>
                    <li>• Mode malam menggunakan tema biru gelap/navy yang nyaman di mata</li>
                    <li>• Preferensi mode akan tersimpan otomatis</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Kontrol Audio */}
            <div className={`p-6 rounded-2xl ${isDarkMode ? "bg-slate-800" : "bg-slate-50"}`}>
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg shrink-0 ${isDarkMode ? "bg-blue-500/10" : "bg-blue-100"}`}>
                  <Volume2 className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-3">Kontrol Audio</h2>
                  <ul className={`space-y-2 ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>
                    <li>• Toggle audio di navbar untuk mengatur background music</li>
                    <li>• Music akan auto play saat pertama kali membuka website</li>
                    <li>• Background music: "Raindance" by Dave ft. Tems</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Virtual Tour 360° */}
            <div className={`p-6 rounded-2xl ${isDarkMode ? "bg-slate-800" : "bg-slate-50"}`}>
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg shrink-0 ${isDarkMode ? "bg-blue-500/10" : "bg-blue-100"}`}>
                  <Eye className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-3">Virtual Tour 360°</h2>
                  <ul className={`space-y-2 ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>
                    <li>• Klik dan drag untuk melihat sekeliling dalam mode 360°</li>
                    <li>• Gunakan scroll mouse untuk zoom in/out</li>
                    <li>• Klik hotspot (titik interaktif) untuk berpindah lokasi</li>
                    <li>• Tombol fullscreen untuk pengalaman immersive</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Peta Interaktif */}
            <div className={`p-6 rounded-2xl ${isDarkMode ? "bg-slate-800" : "bg-slate-50"}`}>
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg shrink-0 ${isDarkMode ? "bg-blue-500/10" : "bg-blue-100"}`}>
                  <Map className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-3">Peta Interaktif</h2>
                  <ul className={`space-y-2 ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>
                    <li>• Zoom in/out menggunakan tombol + dan - atau scroll mouse</li>
                    <li>• Drag untuk menggeser peta</li>
                    <li>• Klik marker untuk melihat informasi lokasi</li>
                    <li>• Peta otomatis mengikuti mode malam</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Fitur Komentar */}
            <div className={`p-6 rounded-2xl ${isDarkMode ? "bg-slate-800" : "bg-slate-50"}`}>
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg shrink-0 ${isDarkMode ? "bg-blue-500/10" : "bg-blue-100"}`}>
                  <MessageSquare className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-3">Memberikan Ulasan</h2>
                  <ul className={`space-y-2 ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>
                    <li>• Scroll ke bagian Footer website untuk menemukan form ulasan</li>
                    <li>• Tulis ulasan Anda di kolom "Ulasan Website"</li>
                    <li>• Klik "Kirim" dan login menggunakan akun Google untuk verifikasi</li>
                    <li>• Ulasan Anda akan tersimpan dan dapat dilihat oleh admin</li>
                    <li>• Email dan nama Anda akan ditampilkan bersama ulasan</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Denah Interaktif */}
            <div className={`p-6 rounded-2xl ${isDarkMode ? "bg-slate-800" : "bg-slate-50"}`}>
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg shrink-0 ${isDarkMode ? "bg-blue-500/10" : "bg-blue-100"}`}>
                  <Building2 className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-3">Denah Interaktif</h2>
                  <ul className={`space-y-2 ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>
                    <li>• Klik <strong>Denah Interaktif</strong> di halaman utama, lalu pilih <strong>Lantai Atas</strong> atau <strong>Lantai Bawah</strong></li>
                    <li>• Scroll atau gunakan tombol <strong>+ / -</strong> untuk zoom foto denah, klik dan drag untuk menggesernya</li>
                    <li>• Klik tombol <strong>fullscreen</strong> di pojok kanan atas foto untuk melihat denah layar penuh</li>
                    <li>• Klik <strong>kotak biru</strong> pada denah untuk membuka detail ruangan lengkap dengan foto dan inventaris</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Asisten Chatbot */}
            <div className={`p-6 rounded-2xl ${isDarkMode ? "bg-slate-800" : "bg-slate-50"}`}>
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg shrink-0 ${isDarkMode ? "bg-blue-500/10" : "bg-blue-100"}`}>
                  <Bot className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-3">Asisten Chatbot Virtual</h2>
                  <ul className={`space-y-2 ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>
                    <li>• Klik <strong>ikon robot</strong> di pojok kanan bawah halaman utama untuk membuka chatbot</li>
                    <li>• Chatbot hanya menjawab pertanyaan seputar <strong>pendidikan dan SMKN 11 Bandung</strong></li>
                    <li>• Gunakan <strong>Pertanyaan Cepat</strong> untuk memulai, atau ketik langsung di kolom chat</li>
                    <li>• Klik ikon <strong>jam</strong> untuk riwayat chat, ikon <strong>tempat sampah</strong> untuk hapus percakapan</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Tips & Trik */}
            <div className={`p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border ${
              isDarkMode ? "border-blue-500/20" : "border-blue-200"
            }`}>
              <h2 className="text-2xl font-bold mb-4 text-blue-500">Tips & Trik</h2>
              <ul className={`space-y-2 ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>
                <li>• Gunakan keyboard shortcut untuk navigasi yang lebih cepat</li>
                <li>• Bookmark halaman ini untuk referensi mudah</li>
                <li>• Website dioptimalkan untuk pengalaman desktop dan mobile</li>
                <li>• Gunakan mode fullscreen untuk pengalaman virtual tour terbaik</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
