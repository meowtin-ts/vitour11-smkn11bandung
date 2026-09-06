import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

interface GoogleUser {
  email: string;
  name: string;
  picture: string;
  sub: string; // Google user ID
}

interface GoogleOneTapProps {
  onSuccess: (user: GoogleUser) => void;
  onError?: (error: string) => void;
}

// Extend Window interface untuk Google Identity Services
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: (callback?: (notification: any) => void) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
          disableAutoSelect: () => void;
          cancel: () => void;
        };
      };
    };
  }
}

export function GoogleOneTap({ onSuccess, onError }: GoogleOneTapProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log("✅ Google Identity Services loaded");
      setIsScriptLoaded(true);
      setIsLoading(false);
    };
    script.onerror = () => {
      console.error("❌ Failed to load Google Identity Services");
      setIsLoading(false);
      onError?.("Gagal memuat Google Sign-In. Cek koneksi internet Anda.");
    };

    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    if (!isScriptLoaded || !window.google || !buttonRef.current) return;

    try {
      // Initialize Google One-Tap
      window.google.accounts.id.initialize({
        // IMPORTANT: Ganti dengan Google Client ID Anda dari Google Cloud Console
        // Tutorial setup ada di GOOGLE_AUTH_SETUP.md
        client_id: "474010809089-qpvi46jkso1d1qlpsd0nsipae8uum3jo.apps.googleusercontent.com",
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Render sign-in button
      window.google.accounts.id.renderButton(buttonRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "signin_with",
        shape: "rectangular",
        logo_alignment: "left",
        width: buttonRef.current.offsetWidth || 250,
      });

      console.log("✅ Google Sign-In button rendered");
    } catch (error) {
      console.error("Error initializing Google Sign-In:", error);
      onError?.("Gagal menginisialisasi Google Sign-In");
    }
  }, [isScriptLoaded]);

  const handleCredentialResponse = async (response: any) => {
    try {
      console.log("🔐 Google credential received");

      // Decode JWT token untuk mendapatkan user info
      const credential = response.credential;
      const payload = parseJwt(credential);

      if (!payload) {
        throw new Error("Invalid credential");
      }

      const googleUser: GoogleUser = {
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        sub: payload.sub,
      };

      console.log("✅ Google user authenticated:", googleUser.email);
      onSuccess(googleUser);
    } catch (error) {
      console.error("Error handling Google credential:", error);
      onError?.("Gagal memproses login Google. Silakan coba lagi.");
    }
  };

  // Helper function to parse JWT token
  const parseJwt = (token: string) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Error parsing JWT:", error);
      return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
        <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
        <span className="text-sm text-slate-600 dark:text-slate-400">
          Memuat Google Sign-In...
        </span>
      </div>
    );
  }

  return (
    <div>
      <div ref={buttonRef} className="w-full" />
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">
        Login dengan Google untuk mengirim ulasan
      </p>
    </div>
  );
}
