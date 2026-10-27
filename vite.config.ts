import { defineConfig, type Plugin } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function figmaAssetResolver(): Plugin {
  return {
    name: "figma-asset-resolver",

    resolveId(id: string) {
      if (id.startsWith("figma:asset/")) {
        const filename = id.replace("figma:asset/", "");

        return path.resolve(
          __dirname,
          "src/assets",
          filename,
        );
      }

      return null;
    },
  };
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),

    // React dan Tailwind dibutuhkan oleh Figma Make.
    react(),
    tailwindcss(),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "/utils": path.resolve(__dirname, "./utils"),
    },
  },

  // Jangan tambahkan .css, .tsx, atau .ts ke assetsInclude.
  assetsInclude: [
    "**/*.svg",
    "**/*.csv",
  ],
});