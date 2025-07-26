console.log("🚀 Vite config loaded");

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path"; // Elegendő csak ez
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  base: "/", // minden asset a gyökérből töltődik be
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
        main: path.resolve(__dirname, "index.html"),
        admin: path.resolve(__dirname, "admin.html"),
      },
    },
  },
  preview: {
    open: true,
    historyApiFallback: true,
  },
}));
