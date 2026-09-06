import { useOutletContext } from "react-router";
import { useDarkMode } from "../contexts/DarkModeContext";
import { Navbar } from "../components/Navbar";
import { Hero } from "../components/Hero";
import { AboutUs } from "../components/AboutUs";
import { Facilities } from "../components/Facilities";
import { SchoolMap } from "../components/SchoolMap";
import { Footer } from "../components/Footer";
import { ChatbotWidget } from "../components/ChatbotWidget";

export function HomePage() {
  const { isDarkMode } = useDarkMode();
  const { showSplash } = useOutletContext<{ showSplash: boolean }>();

  return (
    <main className={`min-h-screen font-sans ${
      isDarkMode
        ? "bg-slate-900 text-white selection:bg-blue-500/30"
        : "bg-white text-slate-900 selection:bg-blue-200"
    }`}>
      {!showSplash && <Navbar />}
      <Hero />
      <AboutUs />
      <Facilities />
      <SchoolMap />
      <Footer />
      {!showSplash && <ChatbotWidget />}
    </main>
  );
}
