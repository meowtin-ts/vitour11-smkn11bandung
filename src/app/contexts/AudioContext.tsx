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

  // CARA 1: Jika file MP3 ada di folder /public/raindance.mp3
  const audioUrl = "/public/CraveYou.mp3";
  
  // CARA 2: Jika masih pakai link online (hapus jika sudah pakai file lokal)
  // const audioUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

  // Auto-play after splash screen (3.5 seconds)
  useEffect(() => {
    if (!hasAttemptedAutoPlay.current) {
      hasAttemptedAutoPlay.current = true;
      setTimeout(() => {
        setIsPlaying(true);
      }, 3500);
    }
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