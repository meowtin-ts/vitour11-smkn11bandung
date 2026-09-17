import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";

interface AudioContextType {
  isPlaying: boolean;
  toggleAudio: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasAttemptedAutoPlay = useRef(false);

  const audioUrl = "/CraveYou.mp3";

  // Auto-play on first user interaction (required by browser autoplay policy)
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (!hasAttemptedAutoPlay.current) {
        hasAttemptedAutoPlay.current = true;
        setIsPlaying(true);
      }
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("keydown", handleFirstInteraction);
      document.removeEventListener("touchstart", handleFirstInteraction);
    };

    document.addEventListener("click", handleFirstInteraction);
    document.addEventListener("keydown", handleFirstInteraction);
    document.addEventListener("touchstart", handleFirstInteraction);

    return () => {
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("keydown", handleFirstInteraction);
      document.removeEventListener("touchstart", handleFirstInteraction);
    };
  }, []);

  // Handle play/pause
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch((error) => {
          console.log("Audio playback failed:", error);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  const toggleAudio = () => {
    setIsPlaying((prev) => !prev);
  };

  return (
    <AudioContext.Provider value={{ isPlaying, toggleAudio }}>
      {/* Global audio element */}
      <audio ref={audioRef} loop>
        <source src={audioUrl} type="audio/mpeg" />
      </audio>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
}