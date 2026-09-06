import { useState, useEffect, useRef } from "react";
import { Send, X, CheckCircle, ShieldCheck, ArrowRight } from "lucide-react";
import { useDarkMode } from "../contexts/DarkModeContext";
import { GoogleOneTap } from "./GoogleOneTap";
import { getSupabaseClient } from "/utils/supabase/client";
import { toast } from "sonner";

const RECAPTCHA_SITE_KEY = "6LelOKItAAAAAMXNtoMq_jXJfJBufX85OGjqrLVF";

interface GoogleUser {
  email: string;
  name: string;
  picture: string;
  sub: string;
}

declare global {
  interface Window {
    grecaptcha: any;
    _recaptchaOnLoad: () => void;
  }
}

// Modal step: null = closed | "recaptcha" | "google"
type ModalStep = null | "recaptcha" | "google";

export function CommentForm() {
  const { isDarkMode } = useDarkMode();
  const [comment, setComment] = useState("");
  const [googleUser, setGoogleUser] = useState<GoogleUser | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalStep, setModalStep] = useState<ModalStep>(null);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [recaptchaReady, setRecaptchaReady] = useState(false);

  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);

  // Load reCAPTCHA script once globally
  useEffect(() => {
    if (window.grecaptcha?.render) {
      setRecaptchaReady(true);
      return;
    }
    window._recaptchaOnLoad = () => setRecaptchaReady(true);
    if (!document.querySelector('script[src*="recaptcha/api.js"]')) {
      const s = document.createElement("script");
      s.src = "https://www.google.com/recaptcha/api.js?onload=_recaptchaOnLoad&render=explicit";
      s.async = true;
      s.defer = true;
      document.head.appendChild(s);
    }
  }, []);

  // Render widget inside modal when step is "recaptcha"
  useEffect(() => {
    if (modalStep !== "recaptcha" || !recaptchaReady) return;

    // Reset previous token
    setRecaptchaToken(null);

    const timer = setTimeout(() => {
      if (!recaptchaContainerRef.current) return;

      // If already rendered, just reset it
      if (widgetIdRef.current !== null) {
        try { window.grecaptcha.reset(widgetIdRef.current); } catch {}
        return;
      }

      try {
        widgetIdRef.current = window.grecaptcha.render(recaptchaContainerRef.current, {
          sitekey: RECAPTCHA_SITE_KEY,
          theme: "dark",
          callback: (token: string) => setRecaptchaToken(token),
          "expired-callback": () => setRecaptchaToken(null),
          "error-callback": () => setRecaptchaToken(null),
        });
      } catch (err) {
        console.error("reCAPTCHA render error:", err);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [modalStep, recaptchaReady]);

  const handleKirim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error("Ulasan tidak boleh kosong");
      return;
    }
    // Open modal — start with recaptcha step
    setModalStep("recaptcha");
  };

  const handleRecaptchaDone = () => {
    if (!recaptchaToken) {
      toast.error("Mohon selesaikan verifikasi reCAPTCHA");
      return;
    }
    if (googleUser) {
      // Already logged in — submit directly
      setModalStep(null);
      submitComment(googleUser);
    } else {
      // Go to Google login step
      setModalStep("google");
    }
  };

  const handleGoogleSuccess = async (user: GoogleUser) => {
    setGoogleUser(user);
    setModalStep(null);
    toast.success(`Login berhasil sebagai ${user.name}`);
    await submitComment(user);
  };

  const submitComment = async (user: GoogleUser) => {
    setIsSubmitting(true);
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from("komentar").insert({
        user_email: user.email,
        user_name: user.name,
        user_photo: user.picture,
        text: comment.trim(),
      });
      if (error) {
        toast.error("Gagal mengirim ulasan. Silakan coba lagi.");
        return;
      }
      toast.success("Terima kasih! Ulasan Anda berhasil dikirim.");
      setComment("");
      setRecaptchaToken(null);
      if (widgetIdRef.current !== null && window.grecaptcha) {
        try { window.grecaptcha.reset(widgetIdRef.current); } catch {}
      }
    } catch {
      toast.error("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setModalStep(null);
    setRecaptchaToken(null);
    if (widgetIdRef.current !== null && window.grecaptcha) {
      try { window.grecaptcha.reset(widgetIdRef.current); } catch {}
    }
  };

  return (
    <>
      {/* Logged-in user badge */}
      {googleUser && (
        <div className="flex items-center gap-3 mb-3 p-3 rounded-lg bg-slate-800/50">
          <img src={googleUser.picture} alt={googleUser.name} className="w-9 h-9 rounded-full" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{googleUser.name}</p>
            <p className="text-xs text-slate-400 truncate">{googleUser.email}</p>
          </div>
          <button
            onClick={() => setGoogleUser(null)}
            className="p-1 rounded hover:bg-slate-700 transition-colors"
            title="Ganti akun"
          >
            <X size={15} className="text-slate-400" />
          </button>
        </div>
      )}

      {/* Form — same original design */}
      <form onSubmit={handleKirim} className="relative">
        <div className="rounded-xl border overflow-hidden bg-slate-800 border-slate-700">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tulis ulasan Anda tentang website ini..."
            rows={5}
            disabled={isSubmitting}
            className="w-full p-4 resize-none outline-none bg-slate-800 text-white placeholder-slate-500 disabled:opacity-50"
          />
          <div className="flex items-center justify-end px-4 py-3 border-t border-slate-700 bg-slate-800/50">
            <button
              type="submit"
              disabled={!comment.trim() || isSubmitting}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium ${
                comment.trim() && !isSubmitting
                  ? "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                  : "bg-slate-700 text-slate-500 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Mengirim...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Kirim Ulasan
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Modal — reCAPTCHA & Google login */}
      {modalStep && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl shadow-2xl bg-slate-800 border border-slate-700 overflow-hidden">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
              <div className="flex items-center gap-3">
                {/* Step indicator */}
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full transition-colors ${modalStep === "recaptcha" ? "bg-blue-500" : "bg-green-500"}`} />
                  <div className={`w-2 h-2 rounded-full transition-colors ${modalStep === "google" ? "bg-blue-500" : "bg-slate-600"}`} />
                </div>
                <h2 className="text-base font-bold text-white">
                  {modalStep === "recaptcha" ? "Verifikasi Keamanan" : "Login dengan Google"}
                </h2>
              </div>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-lg hover:bg-slate-700 transition-colors"
              >
                <X size={18} className="text-slate-400" />
              </button>
            </div>

            {/* Step 1 — reCAPTCHA */}
            {modalStep === "recaptcha" && (
              <div className="px-6 py-6 space-y-5">
                <div className="flex items-start gap-3">
                  <ShieldCheck size={20} className="text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Sebelum mengirim ulasan, mohon selesaikan verifikasi di bawah untuk memastikan Anda bukan robot.
                  </p>
                </div>

                {/* reCAPTCHA widget */}
                <div className="flex justify-center">
                  {recaptchaReady ? (
                    <div ref={recaptchaContainerRef} />
                  ) : (
                    <div className="flex items-center gap-2 text-slate-400 text-sm py-4">
                      <div className="w-4 h-4 border-2 border-slate-500 border-t-blue-400 rounded-full animate-spin" />
                      Memuat verifikasi...
                    </div>
                  )}
                </div>

                {/* Lanjut button */}
                <button
                  onClick={handleRecaptchaDone}
                  disabled={!recaptchaToken}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold transition-all ${
                    recaptchaToken
                      ? "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                      : "bg-slate-700 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  {googleUser ? (
                    <>
                      <Send size={16} />
                      Kirim Ulasan
                    </>
                  ) : (
                    <>
                      Lanjut ke Login Google
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Step 2 — Google login */}
            {modalStep === "google" && (
              <div className="px-6 py-6 space-y-4">
                <p className="text-sm text-slate-300 text-center leading-relaxed">
                  Pilih akun Google untuk memverifikasi identitas Anda. Email dan nama akan ditampilkan bersama ulasan.
                </p>

                <GoogleOneTap
                  onSuccess={handleGoogleSuccess}
                  onError={(error) => {
                    toast.error(error);
                    closeModal();
                  }}
                />

                <div className="flex items-start gap-2 pt-2 border-t border-slate-700">
                  <CheckCircle size={13} className="shrink-0 mt-0.5 text-green-500" />
                  <p className="text-xs text-slate-500">
                    Kami tidak akan membagikan informasi akun Anda kepada pihak lain.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
