import { useState, useEffect } from "react";
import { Menu, X, Moon, Sun, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { twMerge } from "tailwind-merge";
import { useDarkMode } from "../contexts/DarkModeContext";
import { AudioPlayer } from "./AudioPlayer";
import { Link, useLocation, useNavigate } from "react-router";
import schoolLogo from "../../imports/logo_smkn11bdg.png";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("#hero");
  const [saranaDropdownOpen, setPrasaranaDropdownOpen] = useState(false);
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const location = useLocation();
  const navigate = useNavigate();

  const isHomePage = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle hash navigation when arriving from another page
  useEffect(() => {
    if (isHomePage && location.hash) {
      const sectionId = location.hash.substring(1);
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [location.hash, isHomePage]);

  // Scroll spy
  useEffect(() => {
    if (!isHomePage) return;

    const sectionIds = ["hero", "about", "facilities", "location"];
    const NAV_OFFSET = 90;

    const detectActiveSection = () => {
      const scrollY = window.scrollY;
      let active = "hero";
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const elTop = el.getBoundingClientRect().top + scrollY - NAV_OFFSET;
          if (scrollY >= elTop) active = id;
        }
      }
      setActiveSection(`#${active}`);
    };

    detectActiveSection();
    window.addEventListener("scroll", detectActiveSection, { passive: true });
    return () => window.removeEventListener("scroll", detectActiveSection);
  }, [isHomePage]);

  const saranaSubmenu = [
    { name: "Virtual Tour 360°", href: "/virtual-tour", external: false },
    { name: "Denah Interaktif", href: "/denah-interaktif", external: false },
  ];

  const navigateToTop = () => {
    if (isHomePage) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setActiveSection("#hero");
    } else {
      navigate("/");
    }
  };

  const navigateToSection = (sectionId: string) => {
    if (isHomePage) {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
      setActiveSection(`#${sectionId}`);
    } else {
      navigate(`/#${sectionId}`);
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
      }, 150);
    }
  };

  const navBtnClass = (section: string) =>
    `font-medium transition-colors relative pb-1 ${
      isHomePage && activeSection === `#${section}` ? "text-blue-400" : "hover:text-blue-400"
    }`;

  const underlineClass = (section: string) =>
    `absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400 rounded-full transition-opacity duration-200 ${
      isHomePage && activeSection === `#${section}` ? "opacity-100" : "opacity-0"
    }`;

  return (
    <nav
      className={twMerge(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled || !isHomePage
          ? isDarkMode
            ? "bg-slate-900/90 backdrop-blur-md shadow-md py-3 text-white"
            : "bg-white/90 backdrop-blur-md shadow-md py-3 text-blue-900"
          : "bg-transparent py-5 text-white"
      )}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 font-bold text-2xl">
          <img src={schoolLogo} alt="Logo SMKN 11 Bandung" className="w-8 h-8 object-contain" />
          <span className="hidden sm:inline">Jelajah SMKN 11 Bandung</span>
          <span className="sm:hidden">SMKN 11</span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          {/* Beranda */}
          <button onClick={navigateToTop} className={navBtnClass("hero")}>
            Beranda
            <span className={underlineClass("hero")} />
          </button>

          {/* Profil */}
          <button onClick={() => navigateToSection("about")} className={navBtnClass("about")}>
            Profil
            <span className={underlineClass("about")} />
          </button>

          {/* Prasarana — Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setPrasaranaDropdownOpen(true)}
            onMouseLeave={() => setPrasaranaDropdownOpen(false)}
          >
            <button
              onClick={() => navigateToSection("facilities")}
              className={`font-medium transition-colors flex items-center gap-1 relative pb-1 ${
                isHomePage && activeSection === "#facilities" ? "text-blue-400" : "hover:text-blue-400"
              }`}
            >
              <span>Prasarana</span>
              <ChevronDown
                size={16}
                className={`transition-transform ${saranaDropdownOpen ? "rotate-180" : ""}`}
              />
              <span
                className={`absolute bottom-0 left-0 h-0.5 bg-blue-400 rounded-full transition-opacity duration-200 ${
                  isHomePage && activeSection === "#facilities" ? "opacity-100" : "opacity-0"
                }`}
                style={{ right: "20px" }}
              />
            </button>

            <AnimatePresence>
              {saranaDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className={`absolute top-full mt-2 left-0 min-w-[210px] rounded-xl shadow-xl border ${
                    isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
                  }`}
                >
                  {saranaSubmenu.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`block px-4 py-3 font-medium transition-colors border-b last:border-0 ${
                        isDarkMode
                          ? "hover:bg-slate-700 border-slate-700"
                          : "hover:bg-slate-50 border-slate-100"
                      }`}
                      onClick={() => setPrasaranaDropdownOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Kontak */}
          <button onClick={() => navigateToSection("location")} className={navBtnClass("location")}>
            Kontak
            <span className={underlineClass("location")} />
          </button>

          {/* Dark Mode */}
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-lg transition-all ${
              isDarkMode
                ? "bg-blue-900/50 hover:bg-blue-800/70 text-blue-200"
                : "bg-blue-100 hover:bg-blue-200 text-blue-900"
            }`}
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <AudioPlayer />
        </div>

        {/* Mobile Toggle */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-lg transition-all ${
              isDarkMode
                ? "bg-blue-900/50 hover:bg-blue-800/70 text-blue-200"
                : "bg-blue-100 hover:bg-blue-200 text-blue-900"
            }`}
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <AudioPlayer />
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={
              isDarkMode
                ? "md:hidden bg-slate-900 text-white border-t border-slate-700 overflow-hidden"
                : "md:hidden bg-white text-blue-900 border-t border-gray-100 overflow-hidden"
            }
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
              {/* Beranda */}
              <button
                className={`font-medium py-2 border-b text-left ${
                  isDarkMode ? "border-slate-700" : "border-gray-100"
                } ${isHomePage && activeSection === "#hero" ? "text-blue-400" : ""}`}
                onClick={() => { navigateToTop(); setIsMobileMenuOpen(false); }}
              >
                Beranda
              </button>

              {/* Profil */}
              <button
                className={`font-medium py-2 border-b text-left ${
                  isDarkMode ? "border-slate-700" : "border-gray-100"
                } ${activeSection === "#about" ? "text-blue-400" : ""}`}
                onClick={() => { navigateToSection("about"); setIsMobileMenuOpen(false); }}
              >
                Profil
              </button>

              {/* Prasarana dropdown mobile */}
              <div className={`border-b ${isDarkMode ? "border-slate-700" : "border-gray-100"}`}>
                <button
                  onClick={() => setPrasaranaDropdownOpen(!saranaDropdownOpen)}
                  className="font-medium py-2 w-full text-left flex items-center justify-between"
                >
                  Prasarana
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${saranaDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {saranaDropdownOpen && (
                  <div className="pl-4 pb-2 flex flex-col gap-2">
                    {saranaSubmenu.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`py-2 font-medium text-sm ${
                          isDarkMode
                            ? "text-slate-400 hover:text-blue-400"
                            : "text-slate-600 hover:text-blue-600"
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Kontak */}
              <button
                className={`font-medium py-2 border-b text-left ${
                  isDarkMode ? "border-slate-700" : "border-gray-100"
                } ${activeSection === "#location" ? "text-blue-400" : ""}`}
                onClick={() => { navigateToSection("location"); setIsMobileMenuOpen(false); }}
              >
                Kontak
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
