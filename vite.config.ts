import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { visualizer } from "rollup-plugin-visualizer";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import Sitemap from "vite-plugin-sitemap";
import pkg from './package.json';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "127.0.0.1",
    port: 5174,
  },
  define: {
    '__APP_VERSION__': JSON.stringify(pkg.version),
    '__COMMIT_SHA__': JSON.stringify((process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || '').slice(0, 7) || 'local'),
    '__BUILD_TIME__': JSON.stringify(new Date().toISOString()),
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
    Sitemap({ 
      hostname: 'https://www.drinkboostup.cz',
      exclude: ['/admin', '/admin/*', '/checkout', '/profile', '/payment/*', '/stats'],
      dynamicRoutes: [
        '/',
        '/login',
        '/register',
        '/obchodni-podminky',
        '/ochrana-osobnich-udaju',
        '/cookies',
        '/doprava-a-platba',
        '/reklamace',
        '/odstoupeni-od-smlouvy',
        '/podminky-opakovane-platby',
        '/blog'
      ]
    }),
    // Sentry plugin must be after other plugins
    process.env.SENTRY_AUTH_TOKEN ? sentryVitePlugin({
      org: "zdenek-dias",
      project: "boostup",
      authToken: process.env.SENTRY_AUTH_TOKEN,
      disable: true, // Dočasně vypnuto kvůli výpadkům Sentry (504)
      telemetry: false,
      sourcemaps: {
        assets: ["./dist/**"],
        filesToDeleteAfterUpload: ["./dist/**/*.map"],
      },
    }) : null,
    {
      name: 'html-transform',
      transformIndexHtml(html) {
        const gaId = process.env.VITE_GA_ID;
        const gaScript = gaId ? `
  <!-- Google Analytics (GA4) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=${gaId}"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', '${gaId}', {
      send_page_view: true,
      cookie_domain: 'auto',
      anonymize_ip: true
    });
  </script>` : '';
        
        return html.replace(/<!-- GOOGLE_ANALYTICS -->/g, gaScript);
      },
    },
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    sourcemap: mode !== "production",
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react-quill') || id.includes('quill')) return 'vendor-quill';
            if (id.includes('recharts') || id.includes('d3')) return 'vendor-recharts';
            if (id.includes('pdf-lib') || id.includes('@pdf-lib')) return 'vendor-pdf';
            if (id.includes('@supabase')) return 'vendor-supabase';
            if (id.includes('lucide-react')) return 'vendor-lucide';
            if (id.includes('framer-motion')) return 'vendor-framer';
            if (id.includes('@radix-ui') || id.includes('cmdk') || id.includes('embla-carousel')) return 'vendor-ui';
            if (id.includes('@stripe')) return 'vendor-stripe';
            return 'vendor-core';
          }
          if (id.includes('src/pages/admin/') || id.includes('src/components/admin/')) return 'admin-suite';
          if (id.includes('src/pages/legal/')) return 'legal-suite';
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
}));
