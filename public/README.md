# 📁 Folder Public

Folder ini digunakan untuk menyimpan **file statis** yang bisa diakses langsung via URL.

## 🎵 Cara Menyimpan File MP3 "Raindance"

### **Langkah 1: Copy File MP3**
Simpan file lagu `Raindance by Dave ft. Tems.mp3` ke folder ini dengan nama:
```
/public/raindance.mp3
```

### **Struktur Folder:**
```
project/
├── public/
│   ├── raindance.mp3          ← Simpan file MP3 di sini
│   └── README.md              ← File ini
├── src/
└── ...
```

### **Langkah 2: Sudah Selesai!**
Kode sudah otomatis menggunakan `/raindance.mp3`.  
Lihat file: `/src/app/contexts/AudioContext.tsx` (line 16)

```typescript
const audioUrl = "/raindance.mp3";
```

### **Langkah 3: Test**
1. Copy file `raindance.mp3` ke folder `/public`
2. Refresh browser (http://localhost:5173)
3. Tunggu splash screen selesai (3 detik)
4. Musik akan auto-play
5. Klik Sound Toggle untuk pause/play

---

## ⚠️ Catatan Penting:

1. **Nama file harus PERSIS:** `raindance.mp3` (huruf kecil semua)
2. **Jangan taruh di subfolder** (langsung di `/public`)
3. Jika nama file berbeda, ubah di `/src/app/contexts/AudioContext.tsx`
4. File di `/public` bisa diakses via: `http://localhost:5173/raindance.mp3`

---

## 🔄 Alternatif: Pakai Link Online

Jika file MP3 tidak tersedia secara lokal, Anda masih bisa pakai link online:

**Edit file:** `/src/app/contexts/AudioContext.tsx`

```typescript
// Ganti baris 16:
const audioUrl = "https://example.com/link-ke-raindance.mp3";
```

Sumber link MP3 yang bisa digunakan:
- Google Drive (set public, pakai direct download link)
- Dropbox (pakai ?dl=1 di akhir link)
- Hosting audio lainnya

---

## 📂 Kegunaan Folder `/public`

Folder ini juga bisa digunakan untuk:
- 🎵 Audio files (`.mp3`, `.wav`, `.ogg`)
- 🖼️ Images (`.jpg`, `.png`, `.svg`)
- 📄 PDFs
- 🎬 Videos
- 📝 Dokumen lainnya

Semua file di sini bisa diakses langsung via URL:
```
http://localhost:5173/nama-file.ext
```
