import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Try to import the Replit runtime error modal plugin if available.
// If it's not installed, we fall back to a no-op so the dev server still starts.
const runtimeErrorPlugin = await (async () => {
  try {
    const mod = await import("@replit/vite-plugin-runtime-error-modal");
    const factory = mod.default ?? Object.values(mod).find((v) => typeof v === "function");
    return typeof factory === "function" ? factory() : null;
  } catch (e) {
    return null;
  }
})();

// Load Vite env to determine backend URL for proxying `/api` during dev.
const env = loadEnv(process.env.NODE_ENV || 'development', process.cwd());
const backendUrl = env.VITE_BACKEND_URL || 'http://localhost:5000';

export default defineConfig({
  plugins: [
    react(),
    ...(runtimeErrorPlugin ? [runtimeErrorPlugin] : []),
    ...(process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) => m.cartographer()),
          await import("@replit/vite-plugin-dev-banner").then((m) => m.devBanner()),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@shared": path.resolve(import.meta.dirname, "..", "shared"),
      "@assets": path.resolve(import.meta.dirname, "..", "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
    host: true,
    port: 5173,
    proxy: {
      "/api": {
        target: backendUrl,
        changeOrigin: true,
        secure: false,
      }
    }
  },
});
