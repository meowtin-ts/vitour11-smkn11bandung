import { motion } from "motion/react";
import { useDarkMode } from "../contexts/DarkModeContext";
import { AnimatedFloatingShapes } from "./AnimatedFloatingShapes";
import { ExternalLink } from "lucide-react";

export function AboutUs() {
  const { isDarkMode } = useDarkMode();

  return (
    <section id="about" className={`relative py-20 overflow-hidden ${
      isDarkMode
        ? "bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950"
        : "bg-gradient-to-br from-blue-50 via-white to-indigo-50"
    }`}>
      {/* Memphis Design Floating Shapes */}
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
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 mx-auto rounded-full"></div>
        </motion.div>

        {/* Kata Pengantar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <div className={`rounded-2xl shadow-lg p-8 md:p-12 border ${
            isDarkMode
              ? "bg-slate-800 border-slate-700"
              : "bg-white border-blue-100"
          }`}>
            <h3 className={`text-2xl md:text-3xl font-semibold mb-6 ${
              isDarkMode ? "text-blue-300" : "text-blue-900"
            }`}>
              Selamat Datang di SMKN 11 Bandung
            </h3>
            <div className={`space-y-4 leading-relaxed ${
              isDarkMode ? "text-slate-300" : "text-slate-700"
            }`}>
              <p>
                Dengan bangga kami mempersembahkan platform <strong>Jelajah Virtual SMKN 11 Bandung</strong>, sebuah inovasi digital yang memungkinkan Anda untuk menjelajahi sekolah kami secara interaktif dan mendalam.
              </p>
              <p>
                SMKN 11 Bandung adalah institusi pendidikan vokasi yang berkomitmen untuk mencetak generasi muda yang kompeten, inovatif, dan siap menghadapi tantangan dunia kerja. Dengan dukungan tenaga pendidik profesional dan fasilitas modern, kami terus berupaya memberikan pengalaman belajar terbaik bagi seluruh siswa.
              </p>
              <p>
                Melalui platform jelajah virtual ini, Anda dapat merasakan pengalaman berada di lingkungan sekolah kami, mengeksplorasi fasilitas, dan mengetahui lebih dalam tentang program-program unggulan yang kami tawarkan.
              </p>
            </div>

            {/* Tombol Profil Resmi Sekolah */}
            <div className="mt-8 flex justify-center">
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
          </div>
        </motion.div>
      </div>
    </section>
  );
}