import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // In production (GitHub Pages) the app lives at /TIMUS/
  base: mode === "production" ? "/TIMUS/" : "/",
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // All /api/* requests are forwarded to the Flask backend
      "/api": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
