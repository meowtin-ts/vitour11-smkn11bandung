import { motion } from "motion/react";
import { Play, Map } from "lucide-react";
import { useDarkMode } from "../contexts/DarkModeContext";
import { useCircularReveal } from "../contexts/CircularRevealContext";
import { AnimatedFloatingShapes } from "./AnimatedFloatingShapes";
import schoolBgLight from "../../imports/school-bg-light.jpg";
import schoolBgDark from "../../imports/school-bg-dark.jpeg";

export function Hero() {
  const { isDarkMode } = useDarkMode();
  const { triggerReveal } = useCircularReveal();

  return (
    <section id="hero" className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Animated Memphis Design Floating Shapes */}
      <AnimatedFloatingShapes />

      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <motion.img
          key={isDarkMode ? 'night' : 'day'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          src={isDarkMode ? schoolBgDark : schoolBgLight}
          alt={isDarkMode ? "SMKN 11 Bandung - Malam" : "SMKN 11 Bandung - Siang"}
          className="w-full h-full object-cover"
        />
        {/* Modern Blue Gradient Overlay */}
        <div
          className={`absolute inset-0 ${
            isDarkMode
              ? "bg-gradient-to-r from-slate-900/95 via-blue-950/90 to-cyan-900/70"
              : "bg-gradient-to-r from-blue-900/90 via-blue-800/80 to-cyan-800/40"
          } mix-blend-multiply`}
        />
        <div
          className={`absolute inset-0 ${
            isDarkMode
              ? "bg-gradient-to-b from-black/50 via-transparent to-slate-950/95"
              : "bg-gradient-to-b from-black/30 via-transparent to-blue-950/90"
          }`}
        />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 md:px-6 relative z-10 text-center md:text-left">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          <div
            className={`inline-block px-4 py-1 backdrop-blur-sm border rounded-full font-medium text-sm mb-6 ${
              isDarkMode
                ? "bg-blue-600/30 border-blue-500/40 text-blue-200"
                : "bg-blue-500/30 border-blue-400/30 text-blue-100"
            }`}
          >
            ✨ Selamat Datang di Website Resmi Sekolah
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
            Jelajah <br />
            <span
              className={`text-transparent bg-clip-text ${
                isDarkMode
                  ? "bg-gradient-to-r from-blue-300 to-cyan-400"
                  : "bg-gradient-to-r from-blue-200 to-cyan-300"
              }`}
            >
              SMKN 11 Bandung
            </span>
          </h1>
          <p
            className={`text-lg md:text-xl mb-8 max-w-xl leading-relaxed ${
              isDarkMode ? "text-blue-200" : "text-blue-100"
            }`}
          >
            Lingkungan belajar modern dengan fasilitas berstandar internasional untuk mendukung potensi terbaik setiap siswa.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <button
              onClick={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                triggerReveal("/virtual-tour", r.left + r.width / 2, r.bottom, "#1e3a8a");
              }}
              className="px-8 py-4 bg-white text-blue-900 rounded-full font-bold hover:bg-blue-50 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]"
            >
              <Play className="fill-current" size={16} />
              Mulai Virtual Tour
            </button>
            <button
              onClick={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                triggerReveal("/denah-interaktif", r.left + r.width / 2, r.bottom, "#172554");
              }}
              className="px-8 py-4 bg-blue-900 text-white rounded-full font-bold hover:bg-blue-800 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(30,58,138,0.5)] hover:shadow-[0_0_30px_rgba(30,58,138,0.7)] border border-blue-700/50"
            >
              <Map size={16} />
              Mulai Denah Interaktif
            </button>
          </div>
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-24 ${
          isDarkMode
            ? "bg-gradient-to-t from-slate-900 to-transparent"
            : "bg-gradient-to-t from-slate-50 to-transparent"
        }`}
      />
    </section>
  );
}