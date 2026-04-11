import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { visualizer } from "rollup-plugin-visualizer";
import { sentryVitePlugin } from "@sentry/vite-plugin";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(), 
    mode === "development" && componentTagger(),
    visualizer({
      open: false,
      filename: "dist/stats.html",
      gzipSize: true,
      brotliSize: true,
    }),
    // Sentry plugin must be after other plugins
    sentryVitePlugin({
      org: "zdenek-dias",
      project: "boostup",
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }),
    {
      name: 'html-transform',
      transformIndexHtml(html) {
        return html.replace(/%VITE_GA_ID%/g, process.env.VITE_GA_ID || '');
      },
    },
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // Group all node_modules into a single robust vendor chunk to prevent 
            // initialization race conditions on custom domains/CDNs.
            return 'vendor';
          }
          if (id.includes('src/pages/admin/')) return 'admin-suite';
          if (id.includes('src/pages/legal/')) return 'legal-suite';
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
}));
