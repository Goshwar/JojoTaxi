import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import sitemap from 'vite-plugin-sitemap';
import { SITEMAP_ROUTES } from './src/lib/routes';

// The SSR build exists only to feed scripts/prerender.mjs, so the plugins that
// emit site assets (sitemap, service worker) are skipped for it — they belong
// to the client build that actually ships.
export default defineConfig(({ isSsrBuild }) => ({
  plugins: [
    react({
      jsxRuntime: 'automatic'
    }),
    ...(isSsrBuild
      ? []
      : [
          sitemap({
            hostname: 'https://funtastictaxitours.com',
            dynamicRoutes: [...SITEMAP_ROUTES],
            exclude: ['/404', '/500', '/offline'],
            // This plugin generates dist/robots.txt and overwrites
            // public/robots.txt, so all rules must be declared here to reach
            // production.
            //
            // AI crawlers are listed explicitly so the policy is a deliberate
            // decision rather than an accident of the wildcard rule: these
            // engines are how travellers increasingly find transport
            // operators, and we want the site cited in their answers.
            robots: [
              // OpenAI: ChatGPT browsing and search indexing
              { userAgent: 'GPTBot', allow: '/', disallow: ['/admin', '/admin/'] },
              { userAgent: 'OAI-SearchBot', allow: '/', disallow: ['/admin', '/admin/'] },
              { userAgent: 'ChatGPT-User', allow: '/', disallow: ['/admin', '/admin/'] },
              // Anthropic: Claude
              { userAgent: 'ClaudeBot', allow: '/', disallow: ['/admin', '/admin/'] },
              { userAgent: 'Claude-Web', allow: '/', disallow: ['/admin', '/admin/'] },
              { userAgent: 'anthropic-ai', allow: '/', disallow: ['/admin', '/admin/'] },
              // Perplexity
              { userAgent: 'PerplexityBot', allow: '/', disallow: ['/admin', '/admin/'] },
              // Google Gemini / AI Overviews (separate from Googlebot indexing)
              { userAgent: 'Google-Extended', allow: '/', disallow: ['/admin', '/admin/'] },
              // Apple Intelligence, Amazon, and Common Crawl (a training and
              // retrieval corpus several engines draw on)
              { userAgent: 'Applebot-Extended', allow: '/', disallow: ['/admin', '/admin/'] },
              { userAgent: 'Amazonbot', allow: '/', disallow: ['/admin', '/admin/'] },
              { userAgent: 'CCBot', allow: '/', disallow: ['/admin', '/admin/'] },
              // Everything else, including Googlebot and Bingbot
              { userAgent: '*', allow: '/', disallow: ['/admin', '/admin/'] },
            ],
          }),
          // The site runs without a service worker. index.html used to carry an
          // inline script that unregistered every registration on load, while
          // this plugin simultaneously injected a render-blocking
          // registerSW.js that registered a new one — so each visit paid for
          // registering a worker the next visit killed, and the PWA never
          // actually worked. Lighthouse measured registerSW.js at ~300 ms of
          // blocked rendering.
          //
          // `selfDestroying` resolves that in the plugin's own supported way:
          // it emits a sw.js that unregisters itself and clears its caches.
          // Browsers re-check sw.js on navigation, so anyone still carrying a
          // registration from an earlier deploy gets cleanly torn down, while
          // `injectRegister: false` means new visitors never register anything
          // and no blocking script is added to the document.
          //
          // To turn the PWA back on, drop `selfDestroying`, restore
          // `registerType`/`workbox` options, and let the plugin inject the
          // registration again — but leave the site a release or two on this
          // config first so existing workers are gone.
          VitePWA({
            selfDestroying: true,
            injectRegister: false
          })
        ])
  ],
  optimizeDeps: {
    include: ['sweetalert2'],
    exclude: ['lucide-react'],
  },
  build: {
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: isSsrBuild
          ? undefined
          : {
              vendor: ['react', 'react-dom', 'react-router-dom'],
              ui: ['lucide-react', 'swiper']
            }
      }
    },
    chunkSizeWarningLimit: 2048,
    assetsInlineLimit: 4096,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  server: {
    headers: {
      'Cache-Control': 'no-store',
      'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
      'Content-Security-Policy': "default-src * 'unsafe-inline' 'unsafe-eval'; script-src * 'unsafe-inline' 'unsafe-eval'; connect-src * 'unsafe-inline'; img-src * data: blob: 'unsafe-inline'; frame-src *; style-src * 'unsafe-inline';",
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'ALLOW-FROM https://www.google.com',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    }
  }
}));
