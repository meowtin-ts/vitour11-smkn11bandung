import { useEffect, useState } from "react";

declare global {
  interface Window {
    pannellum: any;
  }
}

export function usePannellum() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if already loaded
    if (window.pannellum) {
      setIsLoaded(true);
      return;
    }

    // Try to load from script tag if not already in DOM
    const existingScript = document.querySelector('script[src*="pannellum"]');
    const existingLink = document.querySelector('link[href*="pannellum"]');

    if (existingScript && existingLink && window.pannellum) {
      setIsLoaded(true);
      return;
    }

    let cssLink: HTMLLinkElement | null = null;
    let script: HTMLScriptElement | null = null;

    const loadPannellum = async () => {
      try {
        // Load CSS
        if (!existingLink) {
          cssLink = document.createElement("link");
          cssLink.rel = "stylesheet";
          cssLink.href = "/pannellum.css";
          document.head.appendChild(cssLink);
        }

        // Load JS
        if (!existingScript) {
          script = document.createElement("script");
          script.src = "/pannellum.js";
          script.async = false;
          
          const scriptLoadPromise = new Promise((resolve, reject) => {
            script!.onload = () => {
              // Wait longer for pannellum to initialize and check multiple times
              let attempts = 0;
              const maxAttempts = 20;

              const checkPannellum = () => {
                attempts++;
                if (window.pannellum) {
                  console.log("✅ Pannellum loaded successfully");
                  resolve(true);
                } else if (attempts < maxAttempts) {
                  setTimeout(checkPannellum, 100);
                } else {
                  console.warn("⚠️ Pannellum script loaded but window.pannellum not available - continuing anyway");
                  // Set loaded to true anyway to prevent blocking
                  resolve(true);
                }
              };

              setTimeout(checkPannellum, 100);
            };

            script!.onerror = () => {
              console.error("❌ Failed to load Pannellum script from /pannellum.js");
              reject(new Error("Failed to load Pannellum script"));
            };
          });

          document.body.appendChild(script);
          await scriptLoadPromise;
        }

        setIsLoaded(true);
        setError(null);
      } catch (err) {
        console.error("Pannellum loading error:", err);
        setError(err instanceof Error ? err.message : "Failed to load Pannellum");
        setIsLoaded(false);
      }
    };

    loadPannellum();

    // Cleanup function
    return () => {
      // Don't remove scripts to allow reuse across route changes
    };
  }, []);

  return { isLoaded, error };
}
