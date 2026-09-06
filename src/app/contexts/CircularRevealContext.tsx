import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from "react";
import { useNavigate } from "react-router";

interface CircularRevealContextValue {
  triggerReveal: (target: string, originX: number, originY: number, color?: string) => void;
}

const CircularRevealContext = createContext<CircularRevealContextValue>({
  triggerReveal: () => {},
});

export function CircularRevealProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [overlay, setOverlay] = useState<{
    active: boolean;
    expanded: boolean;
    x: number;
    y: number;
    color: string;
  } | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerReveal = useCallback(
    (target: string, originX: number, originY: number, color = "#1e3a8a") => {
      if (timerRef.current) clearTimeout(timerRef.current);

      setOverlay({ active: true, expanded: false, x: originX, y: originY, color });

      // Next frame: start expand
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setOverlay((o) => o && { ...o, expanded: true });
        });
      });

      // Navigate when overlay covers screen
      timerRef.current = setTimeout(() => {
        navigate(target);
        // Fade out overlay after new page renders
        timerRef.current = setTimeout(() => {
          setOverlay(null);
        }, 350);
      }, 600);
    },
    [navigate]
  );

  return (
    <CircularRevealContext.Provider value={{ triggerReveal }}>
      {children}
      {overlay && (
        <div
          aria-hidden
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: overlay.color,
            clipPath: overlay.expanded
              ? `circle(200% at ${overlay.x}px ${overlay.y}px)`
              : `circle(0px at ${overlay.x}px ${overlay.y}px)`,
            transition: overlay.expanded
              ? "clip-path 0.65s cubic-bezier(0.4, 0, 0.2, 1)"
              : "none",
            pointerEvents: "none",
          }}
        />
      )}
    </CircularRevealContext.Provider>
  );
}

export function useCircularReveal() {
  return useContext(CircularRevealContext);
}
