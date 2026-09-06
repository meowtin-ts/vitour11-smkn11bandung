import { motion } from "motion/react";
import { Microscope, BookMarked, Wifi, Zap, Building2, MapPin } from "lucide-react";
import { useDarkMode } from "../contexts/DarkModeContext";
import { AnimatedFloatingShapes } from "./AnimatedFloatingShapes";

const facilities = [
  {
    icon: Building2,
    title: "Ruang Kelas",
    count: "30 Ruang",
    condition: "100% Kondisi Baik",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Microscope,
    title: "Laboratorium",
    count: "9 Laboratorium",
    condition: "IPA, Komputer, Multimedia",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: BookMarked,
    title: "Perpustakaan",
    count: "1 Gedung",
    condition: "Koleksi Digital & Fisik",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: Wifi,
    title: "Akses Internet",
    count: "WiFi-Go & Intra-Room",
    condition: "Coverage 100%",
    color: "from-teal-500 to-green-500",
  },
  {
    icon: Zap,
    title: "Daya Listrik",
    count: "33.000 VA",
    condition: "Sumber: PLN",
    color: "from-yellow-500 to-orange-500",
  },
  {
    icon: MapPin,
    title: "Luas Lahan",
    count: "7,007 m²",
    condition: "Area Sekolah Luas",
    color: "from-indigo-500 to-blue-500",
  },
];

export function Facilities() {
  const { isDarkMode } = useDarkMode();

  return (
    <section id="facilities" className={`relative py-24 overflow-hidden ${isDarkMode ? "bg-slate-900" : "bg-white"}`}>
      {/* Memphis Design Floating Shapes */}
      <AnimatedFloatingShapes />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`text-3xl md:text-5xl font-bold mb-4 ${
              isDarkMode ? "text-white" : "text-slate-900"
            }`}
          >
            Sarana & Prasarana
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {facilities.map((facility, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={`p-8 rounded-2xl ${
                isDarkMode
                  ? "bg-slate-800 border border-slate-700"
                  : "bg-gradient-to-br from-white to-slate-50 border border-slate-200"
              } shadow-lg hover:shadow-2xl transition-all group`}
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${facility.color} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all`}>
                <facility.icon className="text-white" size={32} />
              </div>
              <h3 className={`text-2xl font-bold mb-2 ${
                isDarkMode ? "text-white" : "text-slate-900"
              }`}>
                {facility.title}
              </h3>
              <p className={`text-lg font-semibold mb-1 ${
                isDarkMode ? "text-blue-400" : "text-blue-600"
              }`}>
                {facility.count}
              </p>
              <p className={isDarkMode ? "text-slate-400" : "text-slate-600"}>
                {facility.condition}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}