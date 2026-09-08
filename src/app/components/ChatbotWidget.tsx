import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  X, Send, Loader2, Copy, RefreshCw, Trash2,
  Paperclip, Square, Clock, Check, ChevronLeft,
} from "lucide-react";
import { useDarkMode } from "../contexts/DarkModeContext";
import robotImg from "../../imports/robot.png";
import takagiImg from "../../imports/takagi_ai_assistant.jpeg";

// ── Types ─────────────────────────────────────────────────────────────────
interface Message {
  role: "user" | "assistant";
  content: string;
  image?: { base64: string; mime: string; name: string };
}

interface Session {
  id: string;
  ts: number;
  preview: string;
  messages: Message[];
}

// ── Constants ─────────────────────────────────────────────────────────────
const STORAGE_KEY = "Takagi_sessions";

const INITIAL_MSG: Message = {
  role: "assistant",
  content: "Selamat datang di Virtual Tour SMKN 11 Bandung! Saya Takagi 😊. Silakan tanyakan hal seputar sekolah atau informasi pendidikan di sini😉",
};

const QUICK_REPLIES = [
  "Jurusan apa saja yang ada?",
  "Cara mendaftar ke SMKN 11?",
  "Fasilitas apa yang tersedia?",
  "Info ekstrakurikuler",
];

const SYSTEM_PROMPT = `Kamu adalah asisten virtual cerdas bernama "Takagi" dari SMKN 11 Bandung.

PANDUAN:
1. Kamu bisa menjawab pertanyaan apa saja — sains, teknologi, sejarah, budaya, coding, karier, matematika, bahasa, dan topik umum lainnya — dengan jawaban yang akurat, terampil, dan informatif.
2. Selalu gunakan bahasa Indonesia yang ramah, sopan, dan mudah dipahami.
3. Jika relevan, sisipkan kaitan dengan SMKN 11 Bandung dalam jawabanmu secara natural.
4. Untuk pertanyaan langsung tentang SMKN 11 Bandung, gunakan data lengkap di bawah ini sebagai referensi utama.
5. Jaga jawaban tetap jelas dan padat. Jangan terlalu panjang, tapi jangan terlalu singkat jika pertanyaannya membutuhkan penjelasan.
6. Jangan pernah menolak pertanyaan — jawab semua dengan sebaik-baiknya.

=== DATA SMKN 11 BANDUNG ===

IDENTITAS SEKOLAH:
- Nama lengkap: SMK Negeri 11 Bandung
- NPSN: 20219175
- Alamat: Jl. Budhi Cilember, Kelurahan Sukaraja, Kecamatan Cicendo, Kota Bandung (dekat jembatan Cimindi, berbatasan dengan Cimahi)
- Telepon: (022) 6652442
- Email: smkn11bdg@gmail.com
- Website resmi: smkn11bdg.sch.id
- Instagram: @info.smkn11bandung
- Website virtual tour: Vitour 11 / Jelajah SMKN 11 Bandung
- Kepala Sekolah: Eka Rachman, S.Kom., M.M.Pd.
- Kurikulum: Kurikulum Merdeka

STATUS & KEUNGGULAN:
- Sekolah Pusat Keunggulan (SMK PK) ditetapkan oleh Kemendikbudristek RI
- Salah satu dari 35 SMK di Jawa Barat berstatus BLUD (Badan Layanan Usaha Daerah), memungkinkan Teaching Factory (TEFA) mandiri
- Program unggulan: Sekolah Pencetak Wirausaha (SPW) dan kemitraan industri yang kuat

SEJARAH SINGKAT:
Awalnya berfokus pada Bisnis dan Manajemen (SMEA). Pada Juni 2003 membuka program teknologi pertama yaitu Rekayasa Perangkat Lunak (kini PPLG). Sempat dinominasikan sebagai RSBI pada 2007, kini berkembang menjadi Sekolah Pusat Keunggulan berbasis teknologi digital dan manajemen bisnis.

VISI & MISI:
Membentuk murid berakhlak mulia dan empatik melalui penguatan nilai Pancawaluya. Menyelenggarakan pembelajaran berbasis proyek (project-based learning), pemecahan masalah, dan adopsi teknologi modern.

PROGRAM KEAHLIAN (7 JURUSAN):
1. PPLG – Pengembangan Perangkat Lunak dan Gim
   Fokus: pemrograman web, mobile, dan pengembangan game. Siswa mampu merancang, menganalisis, membuat, dan memelihara sistem informasi.

2. TJKT – Teknik Jaringan Komputer dan Telekomunikasi
   Fokus: perencanaan, instalasi, konfigurasi, dan perbaikan perangkat PC serta infrastruktur jaringan komputer dan telekomunikasi.

3. DKV – Desain Komunikasi Visual
   Fokus: kreativitas visual, grafis, multimedia, periklanan, dan komunikasi digital. Berada di bawah bidang Seni dan Ekonomi Kreatif.

4. AKL – Akuntansi dan Keuangan Lembaga
   Fokus: pengelolaan keuangan, etika profesi akuntan, proses bisnis. Ada TEFA berupa layanan pembukuan dan aplikasi keuangan bagi UMKM.

5. MPLB – Manajemen Perkantoran dan Layanan Bisnis
   Fokus: administrasi perkantoran modern, manajemen dokumen, komunikasi bisnis, pelayanan prima, teknologi perkantoran.

6. Manajemen Logistik
   Fokus: rantai pasok (supply chain), pergudangan industri, distribusi barang, administrasi dokumen logistik domestik dan internasional.

7. BDP – Bisnis Daring dan Pemasaran (Bisnis Ritel/Pemasaran)
   Fokus: strategi pemasaran produk, bisnis ritel modern, transaksi digital, e-commerce, dan digital marketing.

FASILITAS:
- Umum: Masjid sekolah, Aula Terbuka, Ruang Meeting, Ruang Kesiswaan, Lapangan Olahraga, Ruang Tata Usaha, Ruang Manajemen
- Praktik: Laboratorium Komputer, Ruang Seni, Workshop/Lab Praktik khusus tiap program keahlian

EKSTRAKURIKULER:
- Organisasi: Polisi Siswa (Polsis), Paskibra, Pramuka, PMR
- Keagamaan: IRMA FORMULAS (Ikatan Remaja Masjid)
- Olahraga: Futsal, Basket, Voli, Taekwondo, Pencak Silat
- Seni & Bahasa: Band, Rampak Gendang, Paduan Suara, Tari Tradisional, Tari Modern, Komunitas Bahasa Jepang

JAM & HARI SEKOLAH:
- Hari aktif: Senin – Jumat (5 hari kerja)
- Jam masuk: 07.00 WIB (full day school sesuai regulasi Jawa Barat)

PENDAFTARAN / PPDB:
- Jalur masuk: Afirmasi, Prioritas Terdekat, Perpindahan Tugas Orang Tua/Anak Guru, Prestasi (Nilai Rapor/Kejuaraan), Kelas Industri
- Syarat umum: Lulus SMP/MTs sederajat, usia maks. 21 tahun, dokumen (Ijazah/SKL, Akta Kelahiran, KK, Rapor Semester 1–5)
- Jadwal: Biasanya dua tahap pada bulan Juni melalui portal resmi PPDB Jabar`;

const API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent";

// ── localStorage helpers ───────────────────────────────────────────────────
function loadSessions(): Session[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch { return []; }
}
function saveSessions(s: Session[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s.slice(0, 20))); }
  catch { /* quota exceeded */ }
}

// ── Component ──────────────────────────────────────────────────────────────
export function ChatbotWidget() {
  const { isDarkMode } = useDarkMode();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MSG]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [sessions, setSessions] = useState<Session[]>(loadSessions);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [attachment, setAttachment] = useState<{ base64: string; mime: string; name: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const sessionIdRef = useRef(Date.now().toString());

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

  // Focus input on open
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Persist session when messages change
  useEffect(() => {
    if (messages.length <= 1) return;
    const session: Session = {
      id: sessionIdRef.current,
      ts: Date.now(),
      preview: messages.find((m) => m.role === "user")?.content.slice(0, 60) || "Percakapan",
      messages,
    };
    setSessions((prev) => {
      const updated = [session, ...prev.filter((s) => s.id !== sessionIdRef.current)];
      saveSessions(updated);
      return updated;
    });
  }, [messages]);

  // ── Actions ──────────────────────────────────────────────────────────────
  const clearChat = () => {
    sessionIdRef.current = Date.now().toString();
    setMessages([INITIAL_MSG]);
    setAttachment(null);
    setInput("");
    setShowHistory(false);
  };

  const stopGeneration = () => {
    abortRef.current?.abort();
    setIsLoading(false);
  };

  const copyMessage = async (content: string, idx: number) => {
    await navigator.clipboard.writeText(content);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const regenerate = () => {
    let lastAiIdx = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "assistant") { lastAiIdx = i; break; }
    }
    if (lastAiIdx === -1) return;
    const trimmed = messages.slice(0, lastAiIdx);
    let lastUser: Message | undefined;
    for (let i = trimmed.length - 1; i >= 0; i--) {
      if (trimmed[i].role === "user") { lastUser = trimmed[i]; break; }
    }
    if (!lastUser) return;
    setMessages(trimmed);
    doSend(lastUser.content, lastUser.image ?? null, trimmed);
  };

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setAttachment({ base64: dataUrl.split(",")[1], mime: file.type, name: file.name });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Core send logic — accepts explicit text/image or falls back to state
  const doSend = async (
    text: string,
    img: { base64: string; mime: string; name: string } | null,
    baseMessages: Message[]
  ) => {
    if (!text && !img) return;

    const userMsg: Message = { role: "user", content: text, ...(img ? { image: img } : {}) };
    const next = [...baseMessages, userMsg];
    setMessages(next);
    setInput("");
    setAttachment(null);
    setIsLoading(true);

    if (!apiKey) {
      setMessages([...next, { role: "assistant", content: "⚠️ API key Gemini belum dikonfigurasi. Tambahkan VITE_GEMINI_API_KEY di file .env" }]);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const history = baseMessages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [
          { text: m.content || " " },
          ...(m.image ? [{ inlineData: { mimeType: m.image.mime, data: m.image.base64 } }] : []),
        ],
      }));

      const newParts: object[] = [];
      if (text) newParts.push({ text });
      if (img) newParts.push({ inlineData: { mimeType: img.mime, data: img.base64 } });

      const res = await fetch(`${API_URL}?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [...history, { role: "user", parts: newParts }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 512 },
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error?.message || "Request gagal");
      }

      const data = await res.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Maaf, tidak ada respons. Coba lagi.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        setMessages((prev) => [...prev, { role: "assistant", content: "⏹ Generasi dihentikan." }]);
      } else {
        const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
        setMessages((prev) => [...prev, { role: "assistant", content: `❌ ${msg}` }]);
      }
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  };

  const sendMessage = () => doSend(input.trim(), attachment, messages);
  const sendQuickReply = (text: string) => doSend(text, null, messages);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const loadSession = (s: Session) => {
    sessionIdRef.current = s.id;
    setMessages(s.messages);
    setShowHistory(false);
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions((prev) => { const u = prev.filter((s) => s.id !== id); saveSessions(u); return u; });
  };

  const isLastAiMsg = (idx: number) =>
    idx === messages.reduce((acc, m, i) => (m.role === "assistant" ? i : acc), -1);

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

  // ── Shared class helpers ──────────────────────────────────────────────────
  const btn = `p-1.5 rounded-lg transition-colors ${isDarkMode ? "text-white/60 hover:text-white hover:bg-white/10" : "text-white/70 hover:text-white hover:bg-white/15"}`;
  const actionBtn = `flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors ${isDarkMode ? "text-slate-500 hover:bg-slate-800 hover:text-slate-300" : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"}`;

  // ── Render ────────────────────────────────────────────────────────────────
  const widget = (
    <>
      {/* ── Chat Panel ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
            className={`fixed bottom-20 right-4 sm:right-6 z-[9998] w-[340px] sm:w-[400px] flex flex-col rounded-2xl overflow-hidden ${
              isDarkMode
                ? "bg-slate-900 border border-blue-500/20 shadow-[0_8px_40px_rgba(59,130,246,0.18)]"
                : "bg-white border border-blue-100 shadow-[0_8px_40px_rgba(59,130,246,0.14)]"
            }`}
            style={{ height: "540px" }}
          >
            {/* Header */}
            <div className={`flex items-center gap-2.5 px-4 py-2.5 border-b flex-shrink-0 ${
              isDarkMode
                ? "bg-gradient-to-r from-blue-900/70 to-cyan-900/70 border-slate-700"
                : "bg-gradient-to-r from-blue-600 to-cyan-500 border-blue-500"
            }`}>
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white/40 flex-shrink-0 bg-white/10">
                <img src={takagiImg} alt="Takagi" className="w-full h-full object-cover" />
              </div>
              <p className="text-white font-bold text-sm flex-1">Takagi</p>
              <button onClick={() => setShowHistory((v) => !v)} title="Riwayat Chat" className={btn}>
                <Clock size={15} />
              </button>
              <button onClick={clearChat} title="Hapus Chat" className={btn}>
                <Trash2 size={15} />
              </button>
            </div>

            {/* History panel — slides over everything */}
            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "tween", duration: 0.22 }}
                  className={`absolute inset-0 z-20 flex flex-col ${isDarkMode ? "bg-slate-900" : "bg-white"}`}
                >
                  <div className={`flex items-center gap-2 px-4 py-2.5 border-b flex-shrink-0 ${
                    isDarkMode
                      ? "bg-gradient-to-r from-blue-900/70 to-cyan-900/70 border-slate-700"
                      : "bg-gradient-to-r from-blue-600 to-cyan-500 border-blue-500"
                  }`}>
                    <button onClick={() => setShowHistory(false)} className={btn}>
                      <ChevronLeft size={18} />
                    </button>
                    <p className="text-white font-bold text-sm flex-1">Riwayat Chat</p>
                  </div>
                  <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {sessions.length === 0 ? (
                      <p className={`text-center text-sm py-10 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
                        Belum ada riwayat chat
                      </p>
                    ) : sessions.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => loadSession(s)}
                        className={`group flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors border ${
                          isDarkMode ? "border-slate-800 hover:bg-slate-800" : "border-slate-100 hover:bg-slate-50"
                        }`}
                      >
                        <Clock size={13} className={`mt-0.5 flex-shrink-0 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${isDarkMode ? "text-slate-200" : "text-slate-800"}`}>{s.preview}</p>
                          <p className={`text-xs mt-0.5 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>{formatDate(s.ts)}</p>
                        </div>
                        <button
                          onClick={(e) => deleteSession(s.id, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-400/10 transition-all"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto p-3 space-y-3"
              style={{
                minHeight: 0,
                background: isDarkMode
                  ? "radial-gradient(ellipse at top left, rgba(59,130,246,0.06) 0%, transparent 60%), radial-gradient(ellipse at bottom right, rgba(6,182,212,0.05) 0%, transparent 60%)"
                  : "radial-gradient(ellipse at top left, rgba(59,130,246,0.06) 0%, transparent 60%), radial-gradient(ellipse at bottom right, rgba(6,182,212,0.04) 0%, transparent 60%), #f8faff",
              }}
            >
              {messages.map((msg, i) => (
                <div key={i} className={`group flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  {msg.role === "assistant" && (
                    <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 bg-white border border-blue-200 mt-0.5">
                      <img src={takagiImg} alt="Takagi" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className={`flex flex-col gap-1 ${msg.role === "user" ? "items-end" : "items-start"} max-w-[78%]`}>
                    {msg.image && (
                      <img
                        src={`data:${msg.image.mime};base64,${msg.image.base64}`}
                        alt={msg.image.name}
                        className="rounded-xl max-h-36 object-contain border border-slate-200"
                      />
                    )}
                    {msg.content && (
                      <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                        msg.role === "user"
                          ? "bg-blue-500 text-white rounded-tr-sm"
                          : isDarkMode
                          ? "bg-slate-800 text-slate-100 rounded-tl-sm"
                          : "bg-slate-100 text-slate-800 rounded-tl-sm"
                      }`}>
                        {msg.content}
                      </div>
                    )}
                    {/* Copy & Regenerate — visible on hover */}
                    {msg.role === "assistant" && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => copyMessage(msg.content, i)} className={actionBtn}>
                          {copiedIdx === i
                            ? <><Check size={11} className="text-emerald-500" /> Disalin</>
                            : <><Copy size={11} /> Salin</>}
                        </button>
                        {isLastAiMsg(i) && !isLoading && (
                          <button onClick={regenerate} className={actionBtn}>
                            <RefreshCw size={11} /> Ulangi
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <div className="flex gap-2 items-center">
                  <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 bg-white border border-blue-200">
                    <img src={takagiImg} alt="Takagi" className="w-full h-full object-cover" />
                  </div>
                  <div className={`px-4 py-3 rounded-2xl rounded-tl-sm ${isDarkMode ? "bg-slate-800" : "bg-slate-100"}`}>
                    <div className="flex gap-1">
                      {[0, 150, 300].map((d) => (
                        <span key={d} className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: `${d}ms` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick replies — only at initial state */}
            {messages.length === 1 && !isLoading && (
              <div className={`flex-shrink-0 px-3 pt-2 pb-2.5 border-t ${isDarkMode ? "border-slate-800" : "border-slate-100"}`}
                style={{
                  background: isDarkMode
                    ? "rgba(30,41,59,0.8)"
                    : "linear-gradient(to bottom, #f0f7ff, #ffffff)",
                }}
              >
                <p className={`text-[10px] font-bold uppercase tracking-widest pb-2 ${isDarkMode ? "text-blue-400/70" : "text-blue-500/70"}`}>
                  Pertanyaan cepat
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {QUICK_REPLIES.map((qr, i) => {
                    const colors = [
                      { bg: "from-blue-500 to-blue-600", light: "from-blue-50 to-blue-100 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-blue-200" },
                      { bg: "from-cyan-500 to-cyan-600", light: "from-cyan-50 to-cyan-100 border-cyan-200 text-cyan-700 hover:from-cyan-100 hover:to-cyan-200" },
                      { bg: "from-violet-500 to-violet-600", light: "from-violet-50 to-violet-100 border-violet-200 text-violet-700 hover:from-violet-100 hover:to-violet-200" },
                      { bg: "from-emerald-500 to-emerald-600", light: "from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-700 hover:from-emerald-100 hover:to-emerald-200" },
                    ];
                    const c = colors[i % colors.length];
                    return (
                      <button
                        key={qr}
                        onClick={() => sendQuickReply(qr)}
                        className={`w-full text-xs px-2.5 py-2 rounded-xl border font-medium transition-all text-center leading-snug ${
                          isDarkMode
                            ? `bg-gradient-to-br ${c.bg} text-white border-transparent opacity-85 hover:opacity-100 hover:shadow-md`
                            : `bg-gradient-to-br border ${c.light}`
                        }`}
                      >
                        {qr}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Attachment preview */}
            {attachment && (
              <div className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 border-t ${
                isDarkMode ? "border-slate-700 bg-slate-800/50" : "border-slate-100 bg-slate-50"
              }`}>
                <img
                  src={`data:${attachment.mime};base64,${attachment.base64}`}
                  alt={attachment.name}
                  className="h-9 w-9 rounded-lg object-cover border border-slate-200"
                />
                <span className={`text-xs flex-1 truncate ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                  {attachment.name}
                </span>
                <button
                  onClick={() => setAttachment(null)}
                  className={`p-1 rounded-lg ${isDarkMode ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"}`}
                >
                  <X size={13} />
                </button>
              </div>
            )}

            {/* Input row */}
            <div className={`flex items-center gap-1.5 px-3 py-2.5 border-t flex-shrink-0 ${
              isDarkMode ? "border-blue-500/10 bg-slate-900/95" : "border-blue-100 bg-gradient-to-r from-slate-50 to-blue-50/30"
            }`}>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileAttach} />
              <button
                onClick={() => fileInputRef.current?.click()}
                title="Unggah gambar"
                className={`p-2 rounded-xl flex-shrink-0 transition-colors ${
                  isDarkMode ? "text-slate-400 hover:bg-slate-800 hover:text-slate-200" : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                } ${attachment ? "text-blue-500" : ""}`}
              >
                <Paperclip size={16} />
              </button>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tanya seputar SMKN 11 Bandung..."
                disabled={isLoading}
                className={`flex-1 text-sm px-3 py-1.5 rounded-xl border outline-none transition-colors ${
                  isDarkMode
                    ? "bg-slate-800 border-slate-600 text-white placeholder-slate-500 focus:border-blue-500"
                    : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-400"
                } disabled:opacity-50`}
              />
              {isLoading ? (
                <button
                  onClick={stopGeneration}
                  title="Stop"
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-red-500 hover:bg-red-600 text-white transition-colors flex-shrink-0"
                >
                  <Square size={13} fill="white" />
                </button>
              ) : (
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() && !attachment}
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white transition-colors flex-shrink-0"
                >
                  <Send size={14} />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating Trigger ── */}
      <motion.button
        onClick={() => setIsOpen((v) => !v)}
        whileHover={{ scale: 1.1, y: -2 }}
        whileTap={{ scale: 0.92 }}
        className="fixed bottom-4 right-4 sm:right-6 z-[9999] w-14 h-14 focus:outline-none"
        style={{ background: "none", border: "none", padding: 0 }}
        title="Chat dengan Takagi"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
              transition={{ duration: 0.18 }}
              className="w-full h-full flex items-center justify-center"
            >
              <X
                size={34}
                strokeWidth={2.5}
                className={isDarkMode ? "text-white" : "text-slate-700"}
                style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.3))" }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="robot"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.18 }}
              className="w-full h-full"
            >
              <img
                src={robotImg}
                alt="Chat dengan Takagi"
                className="w-full h-full object-contain"
                style={{ filter: "drop-shadow(0 4px 14px rgba(59,130,246,0.45))" }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );

  return createPortal(widget, document.body);
}
