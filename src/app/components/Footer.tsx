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
              <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Beranda</a></li>
              <li><a href="#about" className="text-slate-400 hover:text-white transition-colors">Profil</a></li>
              <li><a href="#facilities" className="text-slate-400 hover:text-white transition-colors">Prasarana</a></li>
              <li><a href="/virtual-tour" className="text-slate-400 hover:text-white transition-colors">Virtual Tour</a></li>
              <li><a href="#location" className="text-slate-400 hover:text-white transition-colors">Kontak</a></li>
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

        <div className={`border-t pt-8 text-center text-slate-500 text-sm ${
          isDarkMode ? "border-slate-900" : "border-slate-800"
        }`}>
          <p>&copy; {new Date().getFullYear()} SMKN 11 Bandung. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}