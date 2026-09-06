import { Outlet } from "react-router";
import { useState } from "react";
import { DarkModeProvider } from "../contexts/DarkModeContext";
import { AudioProvider } from "../contexts/AudioContext";
import { CircularRevealProvider } from "../contexts/CircularRevealContext";
import { SplashScreen } from "./SplashScreen";

export function MainLayout() {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  return (
    <DarkModeProvider>
      <AudioProvider>
        <CircularRevealProvider>
          {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
          <Outlet context={{ showSplash }} />
        </CircularRevealProvider>
      </AudioProvider>
    </DarkModeProvider>
  );
}
