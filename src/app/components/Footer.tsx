import { Youtube, Instagram, FileCheck, Building2, GraduationCap as School, Headset } from "lucide-react";
import { Music2 } from "lucide-react"; // TikTok icon
import schoolLogo from "../../imports/logo_smkn11bdg.png";
import { useDarkMode } from "../contexts/DarkModeContext";
import { Link } from "react-router";
import { CommentForm } from "./CommentForm";

export function Footer() {
  const { isDarkMode } = useDarkMode();

  return (
    <footer id="contact" className={`pt-16 pb-8 ${isDarkMode ? "bg-slate-950 text-white" : "bg-slate-900 text-white"}`}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 font-bold text-2xl mb-4 text-blue-400">
              <img src={schoolLogo} alt="Logo SMKN 11 Bandung" className="w-8 h-8 object-contain" />
              <span>SMKN 11 Bandung</span>
            </div>
            <p className="text-slate-400 mb-6 leading-relaxed">
              Membangun masa depan cemerlang dengan pendidikan berkualitas dan teknologi terkini. Sekolah unggulan untuk generasi emas.
            </p>
            <div className="flex gap-4">
              <a
                href="https://www.tiktok.com/@mpkosissmkn11bandung?_r=1&_t=ZS-969gNFnURho"
                target="_blank"
                rel="noopener noreferrer"
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  isDarkMode ? "bg-slate-900 hover:bg-black" : "bg-slate-800 hover:bg-black"
                }`}
                title="TikTok SMKN 11 Bandung"
              >
                <Music2 size={20} />
              </a>
              <a
                href="https://youtube.com/@smkn11bandung?si=661vkJb1zw0OiySb"
                target="_blank"
                rel="noopener noreferrer"
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  isDarkMode ? "bg-slate-900 hover:bg-red-600" : "bg-slate-800 hover:bg-red-600"
                }`}
                title="YouTube SMKN 11 Bandung"
              >
                <Youtube size={20} />
              </a>
              <a
                href="https://www.instagram.com/info.smkn11bandung?igsh=djByMXdlY28zYm95"
                target="_blank"
                rel="noopener noreferrer"
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isDarkMode ? "bg-slate-900 hover:bg-gradient-to-br hover:from-purple-600 hover:via-pink-600 hover:to-orange-500" : "bg-slate-800 hover:bg-gradient-to-br hover:from-purple-600 hover:via-pink-600 hover:to-orange-500"
                }`}
                title="Instagram SMKN 11 Bandung"
              >
                <Instagram size={20} />
              </a>
              <Link
                to="/customer-service"
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  isDarkMode ? "bg-slate-900 hover:bg-green-600" : "bg-slate-800 hover:bg-green-600"
                }`}
                title="Customer Service"
              >
                <Headset size={20} />
              </Link>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-blue-200">Tautan Cepat</h3>
            <ul className="space-y-3">
              <li><Link to="/" className="text-slate-400 hover:text-white transition-colors">Beranda</Link></li>
              <li><Link to="/#about" className="text-slate-400 hover:text-white transition-colors">Profil</Link></li>
              <li><Link to="/#location" className="text-slate-400 hover:text-white transition-colors">Kontak</Link></li>
              <li><Link to="/virtual-tour" className="text-slate-400 hover:text-white transition-colors">Virtual Tour</Link></li>
              <li><Link to="/denah-interaktif" className="text-slate-400 hover:text-white transition-colors">Denah Interaktif</Link></li>
            </ul>
          </div>

          {/* Ulasan Website Column */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-blue-200">Ulasan Website</h3>
            <CommentForm />
          </div>

          {/* Legalitas Sekolah */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-blue-200">Legalitas Sekolah</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-slate-400">
                <FileCheck className="shrink-0 text-blue-500 mt-0.5" size={20} />
                <div>
                  <span className="text-slate-300 font-medium">NPSN:</span>
                  <span className="ml-2">20219175</span>
                </div>
              </li>
              <li className="flex items-start gap-3 text-slate-400">
                <FileCheck className="shrink-0 text-blue-500 mt-0.5" size={20} />
                <div>
                  <span className="text-slate-300 font-medium">Akreditasi:</span>
                  <span className="ml-2">A</span>
                </div>
              </li>
              <li className="flex items-start gap-3 text-slate-400">
                <Building2 className="shrink-0 text-blue-500 mt-0.5" size={20} />
                <div>
                  <span className="text-slate-300 font-medium">Status:</span>
                  <span className="ml-2">Negeri</span>
                </div>
              </li>
              <li className="flex items-start gap-3 text-slate-400">
                <School className="shrink-0 text-blue-500 mt-0.5" size={20} />
                <div>
                  <span className="text-slate-300 font-medium">Bentuk Pendidikan:</span>
                  <span className="ml-2">SMK</span>
                </div>
              </li>
              <li className="flex items-start gap-3 text-slate-400">
                <School className="shrink-0 text-blue-500 mt-0.5" size={20} />
                <div>
                  <span className="text-slate-300 font-medium">Jenjang Pendidikan:</span>
                  <span className="ml-2">DIKMEN</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Large outlined text — top visible, bottom fades into footer bg */}
        <div
          className="relative select-none pointer-events-none -mx-4 md:-mx-6 mt-4"
          style={{ height: "clamp(3.5rem, 7vw, 6.5rem)", overflow: "hidden" }}
        >
          <p
            className="absolute bottom-0 left-0 right-0 text-center font-black uppercase leading-none whitespace-nowrap"
            style={{
              fontSize: "clamp(6rem, 18vw, 16rem)",
              color: "transparent",
              WebkitTextStroke: "1.5px rgba(255,255,255,0.18)",
              letterSpacing: "0.04em",
              lineHeight: 1,
            }}
          >
            VITOUR 11
          </p>
          {/* gradient fade — matches footer bg */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to bottom, transparent 30%, #020617 100%)",
            }}
          />
        </div>

        {/* Bottom bar */}
        <div className={`border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-sm ${
          isDarkMode ? "border-slate-900" : "border-slate-800"
        }`}>
          <p>&copy; {new Date().getFullYear()} SMKN 11 Bandung. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <a href="#" className="hover:text-white transition-colors">Kebijakan Privasi</a>
            <a href="#" className="hover:text-white transition-colors">Syarat Layanan</a>
            <a href="#contact" className="hover:text-white transition-colors">Kontak</a>
          </div>
        </div>
      </div>
    </footer>
  );
}