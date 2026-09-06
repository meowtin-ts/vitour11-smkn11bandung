// Sample virtual tour data untuk testing
// Gunakan panorama 360 dari URL gratis atau upload ke storage

export const sampleTours = [
  {
    name: "Ruang Kelas XI RPL 1",
    description: "Ruang kelas jurusan Rekayasa Perangkat Lunak dengan fasilitas komputer lengkap dan AC",
    panoramaUrl: "https://pannellum.org/images/alma.jpg", // Sample panorama
    thumbnailUrl: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400",
    order: 1,
    initialView: {
      pitch: 0,
      yaw: 0,
      hfov: 100,
    },
    autoRotate: true,
    compass: true,
    hotspots: [],
  },
  {
    name: "Laboratorium Komputer",
    description: "Lab komputer dengan 40 unit PC modern untuk praktik programming dan desain",
    panoramaUrl: "https://pannellum.org/images/cerro-toco-0.jpg", // Sample panorama
    thumbnailUrl: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400",
    order: 2,
    initialView: {
      pitch: -10,
      yaw: 90,
      hfov: 100,
    },
    autoRotate: true,
    compass: true,
    hotspots: [],
  },
  {
    name: "Perpustakaan",
    description: "Perpustakaan dengan koleksi buku lengkap dan area baca yang nyaman",
    panoramaUrl: "https://pannellum.org/images/jfk.jpg", // Sample panorama
    thumbnailUrl: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=400",
    order: 3,
    initialView: {
      pitch: 0,
      yaw: 180,
      hfov: 100,
    },
    autoRotate: false,
    compass: true,
    hotspots: [],
  },
  {
    name: "Ruang Multimedia",
    description: "Studio multimedia dengan peralatan editing video dan audio profesional",
    panoramaUrl: "https://pannellum.org/images/bma-0.jpg", // Sample panorama
    thumbnailUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400",
    order: 4,
    initialView: {
      pitch: 5,
      yaw: 270,
      hfov: 100,
    },
    autoRotate: true,
    compass: true,
    hotspots: [],
  },
  {
    name: "Bengkel Praktik",
    description: "Bengkel untuk praktik jurusan Teknik Kendaraan Ringan dengan peralatan modern",
    panoramaUrl: "https://pannellum.org/images/bma-1.jpg", // Sample panorama
    thumbnailUrl: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400",
    order: 5,
    initialView: {
      pitch: 0,
      yaw: 0,
      hfov: 100,
    },
    autoRotate: false,
    compass: true,
    hotspots: [],
  },
];

export async function seedToursToBackend(token: string, projectId: string) {
  const results = [];
  
  for (const tour of sampleTours) {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-731f136a/tours`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(tour),
        }
      );

      const result = await response.json();
      results.push({ tour: tour.name, success: result.success });
    } catch (error) {
      console.error(`Failed to seed tour: ${tour.name}`, error);
      results.push({ tour: tour.name, success: false, error });
    }
  }

  return results;
}
