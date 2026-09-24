import { motion } from "motion/react";
import { useDarkMode } from "../contexts/DarkModeContext";
import { AnimatedFloatingShapes } from "./AnimatedFloatingShapes";
import { ExternalLink } from "lucide-react";
import lapanganSiang from "../../imports/Lapangan_siang_beranda.jpeg";
import lapanganMalam from "../../imports/Lapangan_malam_beranda.png";

export function AboutUs() {
  const { isDarkMode } = useDarkMode();

  return (
    <section id="about" className={`relative py-20 overflow-hidden ${
      isDarkMode
        ? "bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950"
        : "bg-gradient-to-br from-blue-50 via-white to-indigo-50"
    }`}>
      <AnimatedFloatingShapes />
      <div className="container mx-auto px-4 md:px-6 relative z-10">

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${
            isDarkMode ? "text-white" : "text-blue-900"
          }`}>
            Tentang Kami
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 mx-auto rounded-full" />
        </motion.div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">

          {/* Kiri — Teks */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className={`space-y-4 leading-relaxed text-base ${
              isDarkMode ? "text-slate-300" : "text-slate-700"
            }`}>
              <p>
                SMKN 11 Bandung adalah institusi pendidikan vokasi yang berkomitmen untuk mencetak generasi muda yang kompeten, inovatif, dan siap menghadapi tantangan dunia kerja. Dengan dukungan tenaga pendidik profesional dan fasilitas modern, kami terus berupaya memberikan pengalaman belajar terbaik bagi seluruh siswa.
              </p>
              <p>
                Melalui platform <strong>Jelajah Virtual SMKN 11 Bandung</strong> ini, Anda dapat merasakan pengalaman berada di lingkungan sekolah kami, mengeksplorasi fasilitas, dan mengetahui lebih dalam tentang program-program unggulan yang kami tawarkan.
              </p>
            </div>

            <div className="mt-8">
              <a
                href="https://sekolah.data.kemendikdasmen.go.id/profil-sekolah/0FB35461-FA5D-4184-B724-AA0968A423D9"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-7 py-3.5 rounded-full font-semibold text-white bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg hover:shadow-blue-500/30 transition-all duration-300 hover:-translate-y-0.5"
              >
                <ExternalLink size={18} />
                Lihat Profil Resmi Sekolah
              </a>
            </div>
          </motion.div>

          {/* Kanan — Foto */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className={`rounded-2xl overflow-hidden shadow-2xl border-4 ${
              isDarkMode ? "border-slate-700" : "border-white"
            }`}>
              <motion.img
                key={isDarkMode ? "malam" : "siang"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                src={isDarkMode ? lapanganMalam : lapanganSiang}
                alt={isDarkMode ? "Lapangan SMKN 11 Bandung Malam" : "Lapangan SMKN 11 Bandung Siang"}
                className="w-full h-72 md:h-96 object-cover"
              />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
