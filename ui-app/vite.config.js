import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Ini jimat barunya Tailwind v4
  ],
  base: "./", // Wajib buat Ultralight
  build: {
    outDir: "../assets", // Arahin langsung ke C++ sampeyan
    emptyOutDir: true,
  },
});
