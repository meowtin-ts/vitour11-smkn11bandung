import { Volume2, VolumeX } from "lucide-react";
import { useDarkMode } from "../contexts/DarkModeContext";
import { useAudio } from "../contexts/AudioContext";

export function AudioPlayer() {
  const { isDarkMode } = useDarkMode();
  const { isPlaying, toggleAudio } = useAudio();

  return (
    <button
      onClick={toggleAudio}
      className={`p-2 rounded-lg transition-all ${
        isDarkMode
          ? "bg-blue-900/50 hover:bg-blue-800/70 text-blue-200"
          : "bg-blue-100 hover:bg-blue-200 text-blue-900"
      }`}
      aria-label={isPlaying ? "Mute music" : "Play music"}
      title={isPlaying ? "Matikan Musik" : "Nyalakan Musik"}
    >
      {isPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}
    </button>
  );
}