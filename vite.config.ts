import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { resolve } from "path";

export default defineConfig(({ mode }) => ({
  base: "/", // Minden asset a gyökérből töltődik be
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
      },
    },
  },
  // ⚠️ Ez az a rész, amit mindenképp hozzá kell adni:
  // SPA fallback
  preview: {
    // preview szerver fallback az index.html-re
    // csak `vite preview` esetén számít
    open: true,
    historyApiFallback: true,
  },
}));
