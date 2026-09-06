import { useDarkMode } from "../contexts/DarkModeContext";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Headset, HelpCircle, Lock, MessageCircle, ChevronRight } from "lucide-react";

export function CustomerService() {
  const { isDarkMode } = useDarkMode();
  const navigate = useNavigate();

  // Check if already logged in
  const isLoggedIn = localStorage.getItem("adminToken") !== null;
  const adminLink = isLoggedIn ? "/admin-dashboard" : "/admin-login";

  const services = [
    {
      title: "Pusat Panduan",
      description: "Panduan lengkap penggunaan website virtual tour SMKN 11 Bandung",
      icon: HelpCircle,
      iconColor: "text-blue-500",
      bgColor: isDarkMode ? "bg-blue-500/10 hover:bg-blue-500/20" : "bg-blue-50 hover:bg-blue-100",
      link: "/help-center",
      isExternal: false,
    },
    {
      title: "Admin",
      description: isLoggedIn
        ? "Akses dashboard admin untuk mengelola virtual tour dan website"
        : "Login ke dashboard admin untuk mengelola konten virtual tour",
      icon: Lock,
      iconColor: "text-purple-500",
      bgColor: isDarkMode ? "bg-purple-500/10 hover:bg-purple-500/20" : "bg-purple-50 hover:bg-purple-100",
      link: adminLink,
      isExternal: false,
    },
    {
      title: "WhatsApp Helpdesk",
      description: "Hubungi kami via WhatsApp (+62 851-8591-2091) untuk pertanyaan dan saran",
      icon: MessageCircle,
      iconColor: "text-green-500",
      bgColor: isDarkMode ? "bg-green-500/10 hover:bg-green-500/20" : "bg-green-50 hover:bg-green-100",
      link: "https://wa.me/6285185912091?text=Halo%20SMKN%2011%20Bandung%2C%20saya%20ingin%20bertanya",
      isExternal: true,
    },
  ];

  return (
    <main className={`min-h-screen font-sans ${
      isDarkMode
        ? "bg-slate-900 text-white selection:bg-blue-500/30"
        : "bg-gradient-to-br from-blue-50 via-white to-cyan-50 text-slate-900 selection:bg-blue-200"
    }`}>
      {/* Header */}
      <div className={`sticky top-0 z-50 backdrop-blur-md ${
        isDarkMode ? "bg-slate-900/80 border-slate-800" : "bg-white/80 border-slate-200"
      } border-b`}>
        <div className="container mx-auto px-4 md:px-6 py-4 flex items-center gap-4">
          <Link
            to="/"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isDarkMode ? "hover:bg-slate-800" : "hover:bg-slate-100"
            }`}
          >
            <ArrowLeft size={20} />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 md:px-6 py-16 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="max-w-4xl w-full">
          {/* Header */}
          <div className="text-center mb-16">
            <div className={`inline-flex p-5 rounded-full mb-6 ${
              isDarkMode ? "bg-green-500/10" : "bg-green-50"
            }`}>
              <Headset className="w-14 h-14 text-green-500" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">
              Customer Service
            </h1>
            <p className={`text-lg ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
              Pilih layanan yang Anda butuhkan
            </p>
          </div>

          {/* Service Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {services.map((service, index) => {
              const Icon = service.icon;
              const CardWrapper = service.isExternal ? 'a' : Link;
              const cardProps = service.isExternal
                ? { href: service.link, target: "_blank", rel: "noopener noreferrer" }
                : { to: service.link };

              return (
                <CardWrapper
                  key={index}
                  {...cardProps}
                  className={`group p-6 rounded-2xl transition-all duration-300 border ${
                    isDarkMode
                      ? "bg-slate-800 border-slate-700 hover:border-slate-600"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  } hover:shadow-2xl hover:-translate-y-1`}
                >
                  <div className={`inline-flex p-4 rounded-2xl mb-5 transition-colors ${service.bgColor}`}>
                    <Icon className={`w-8 h-8 ${service.iconColor}`} />
                  </div>
                  <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                    {service.title}
                    <ChevronRight className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${
                      isDarkMode ? "text-slate-500" : "text-slate-400"
                    }`} />
                  </h2>
                  <p className={`${isDarkMode ? "text-slate-400" : "text-slate-600"} leading-relaxed`}>
                    {service.description}
                  </p>
                  <div className="mt-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className={`text-sm font-medium ${service.iconColor}`}>
                      {service.isExternal ? "Buka WhatsApp" : "Buka Halaman"}
                    </span>
                    <ChevronRight className={`w-4 h-4 ${service.iconColor}`} />
                  </div>
                </CardWrapper>
              );
            })}
          </div>

        </div>
      </div>
    </main>
  );
}
