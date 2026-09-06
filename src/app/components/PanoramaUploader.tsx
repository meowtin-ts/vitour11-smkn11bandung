import { useState, useRef } from "react";
import { Upload, Loader2, X, ImageIcon, AlertCircle } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { toast } from "sonner";

interface PanoramaUploaderProps {
  onFileSelect: (file: File) => void; // Callback saat file dipilih (belum upload)
  currentUrl?: string;
  currentFile?: File | null; // File yang sedang dipilih (belum diupload)
  isDarkMode: boolean;
}

const PANORAMA_BUCKET = "make-731f136a-panoramas";

export function PanoramaUploader({
  onFileSelect,
  currentUrl,
  currentFile,
  isDarkMode,
}: PanoramaUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Format file tidak valid. Hanya JPG dan PNG yang diizinkan.");
      return;
    }

    // Validate file size (max 50MB)
    const maxSize = 52428800; // 50MB
    if (file.size > maxSize) {
      toast.error("Ukuran file terlalu besar. Maksimal 50MB.");
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Pass file object ke parent (tidak upload dulu)
    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium">
        Upload Foto Panorama 360° <span className="text-red-500">*</span>
      </label>

      {/* Upload Area */}
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all
          ${
            dragOver
              ? "border-blue-500 bg-blue-500/10 scale-[1.02]"
              : isDarkMode
              ? "border-slate-700 hover:border-slate-600 bg-slate-900/50"
              : "border-slate-300 hover:border-slate-400 bg-slate-50"
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
          className="hidden"
        />

        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPreview(null);
                onFileSelect(null as any); // Clear file selection
                toast.info("Foto dibatalkan");
              }}
              className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors shadow-lg"
              title="Batalkan & Ganti Foto"
            >
              <X size={18} />
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className={`p-4 rounded-full ${
                isDarkMode ? "bg-slate-800" : "bg-white"
              } shadow-lg`}>
                <Upload className="w-12 h-12 text-blue-500" />
              </div>
            </div>
            <p className={`text-base font-medium mb-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
              Klik atau drag & drop foto panorama
            </p>
            <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
              Format: JPG atau PNG • Maksimal 50MB
            </p>

            {currentUrl && (
              <div className={`mt-4 pt-4 border-t ${
                isDarkMode ? "border-slate-700" : "border-slate-200"
              }`}>
                <div className="flex items-center justify-center gap-2 text-xs text-green-500">
                  <ImageIcon size={14} />
                  <span>Sudah ada foto tersimpan</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
