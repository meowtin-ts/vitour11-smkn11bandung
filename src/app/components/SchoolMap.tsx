import { MapPin, Phone, Mail, ExternalLink } from "lucide-react";
import { useDarkMode } from "../contexts/DarkModeContext";
import { AnimatedFloatingShapes } from "./AnimatedFloatingShapes";

export function SchoolMap() {
  const { isDarkMode } = useDarkMode();

  // SMKN 11 Bandung coordinates
  const latitude = -6.8905;
  const longitude = 107.5583;
  const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
  const embedUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.8!2d${longitude}!3d${latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwNTMnMjUuOCJTIDEwN8KwMzMnMjkuOSJF!5e0!3m2!1sen!2sid!4v1234567890!5m2!1sen!2sid`;

  return (
    <section id="location" className={`relative py-24 overflow-hidden ${isDarkMode ? "bg-slate-900" : "bg-slate-50"}`}>
      {/* Memphis Design Floating Shapes */}
      <AnimatedFloatingShapes />
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-12">
          <h2 className={`text-3xl md:text-5xl font-bold mb-4 ${
            isDarkMode ? "text-white" : "text-slate-900"
          }`}>
            Lokasi Sekolah
          </h2>
          <p className={`max-w-2xl mx-auto ${
            isDarkMode ? "text-slate-400" : "text-slate-600"
          }`}>
            Jl. Budi Cilember, Kec. Cicendo, Kota Bandung, Prov. Jawa Barat
          </p>
        </div>

        {/* Google Maps Embed */}
        <div className="max-w-5xl mx-auto mb-8">
          <div className={`rounded-2xl overflow-hidden shadow-2xl border-4 ${
            isDarkMode ? "border-slate-700" : "border-white/10"
          }`}>
            <iframe
              src={embedUrl}
              width="100%"
              height="500"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="SMKN 11 Bandung Location"
              className="w-full"
            />
          </div>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className={`p-6 rounded-xl ${
            isDarkMode
              ? "bg-slate-800 border border-slate-700"
              : "bg-white border border-slate-200"
          } shadow-lg`}>
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${
                isDarkMode ? "bg-blue-900/50" : "bg-blue-100"
              }`}>
                <MapPin className="text-blue-500" size={24} />
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold mb-1 ${
                  isDarkMode ? "text-white" : "text-slate-900"
                }`}>
                  Alamat
                </h3>
                <p className={`text-sm ${
                  isDarkMode ? "text-slate-400" : "text-slate-600"
                }`}>
                  Jl. Budi Cilember, Kec. Cicendo, Kota Bandung, Jawa Barat
                </p>
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-xl ${
            isDarkMode
              ? "bg-slate-800 border border-slate-700"
              : "bg-white border border-slate-200"
          } shadow-lg`}>
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${
                isDarkMode ? "bg-green-900/50" : "bg-green-100"
              }`}>
                <Phone className="text-green-500" size={24} />
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold mb-1 ${
                  isDarkMode ? "text-white" : "text-slate-900"
                }`}>
                  Telepon
                </h3>
                <p className={`text-sm ${
                  isDarkMode ? "text-slate-400" : "text-slate-600"
                }`}>
                  0226652442
                </p>
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-xl ${
            isDarkMode
              ? "bg-slate-800 border border-slate-700"
              : "bg-white border border-slate-200"
          } shadow-lg`}>
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${
                isDarkMode ? "bg-purple-900/50" : "bg-purple-100"
              }`}>
                <Mail className="text-purple-500" size={24} />
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold mb-1 ${
                  isDarkMode ? "text-white" : "text-slate-900"
                }`}>
                  Email
                </h3>
                <p className={`text-sm ${
                  isDarkMode ? "text-slate-400" : "text-slate-600"
                }`}>
                  smkn11bdg@gmail.com
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Open in Google Maps Button */}
        <div className="text-center mt-8">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${
              isDarkMode
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            } shadow-lg hover:shadow-xl`}
          >
            <ExternalLink size={20} />
            Buka di Google Maps
          </a>
        </div>

        <div className={`mt-8 text-center ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
          <p className="text-sm">📍 Koordinat: {latitude}, {longitude}</p>
        </div>
      </div>
    </section>
  );
}