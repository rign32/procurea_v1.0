import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig(({ mode }) => {
  const isEN = mode === 'production-en' || mode === 'staging-en'
  const isStaging = mode === 'staging' || mode === 'staging-en'
  const outDir = isStaging
    ? (isEN ? 'dist-staging-en' : 'dist-staging')
    : (isEN ? 'dist-en' : 'dist')

  return {
    plugins: [
      react(),
      {
        name: 'html-i18n',
        transformIndexHtml(html) {
          if (!isEN) return html

          return html
            .replace('lang="pl"', 'lang="en"')
            .replace(
              /<title>.*?<\/title>/,
              '<title>Procurea — AI Supplier Discovery | Free Beta</title>'
            )
            .replace(
              /<meta name="description" content=".*?" \/>/,
              '<meta name="description" content="AI-powered tool that automatically discovers, analyzes, and verifies suppliers across global markets. Join the free beta." />'
            )
            .replace(
              /<meta property="og:url" content=".*?" \/>/,
              '<meta property="og:url" content="https://procurea.io/" />'
            )
            .replace(
              /<meta property="og:title" content=".*?" \/>/,
              '<meta property="og:title" content="Procurea — AI Supplier Discovery | Free Beta" />'
            )
            .replace(
              /<meta property="og:description" content=".*?" \/>/,
              '<meta property="og:description" content="AI-powered tool for automated supplier discovery. Try for free." />'
            )
            .replace(
              /<meta property="og:image" content=".*?" \/>/,
              '<meta property="og:image" content="https://procurea.io/hero-screenshot.png" />'
            )
            .replace(
              /<meta property="og:locale" content=".*?" \/>/,
              '<meta property="og:locale" content="en_US" />'
            )
            .replace(
              /<meta name="twitter:title" content=".*?" \/>/,
              '<meta name="twitter:title" content="Procurea — AI Supplier Discovery | Free Beta" />'
            )
            .replace(
              /<meta name="twitter:description" content=".*?" \/>/,
              '<meta name="twitter:description" content="AI-powered tool for automated supplier discovery. Try for free." />'
            )
            .replace(
              /<meta name="twitter:image" content=".*?" \/>/,
              '<meta name="twitter:image" content="https://procurea.io/hero-screenshot.png" />'
            )
            .replace(
              /<link rel="canonical" href=".*?" \/>/,
              '<link rel="canonical" href="https://procurea.io/" />'
            )
            // JSON-LD: swap URLs, currency, language, description for EN build
            .replaceAll('https://procurea.pl', 'https://procurea.io')
            .replace(/"inLanguage": "pl"/, '"inLanguage": "en"')
            .replace(/"priceCurrency": "PLN"/, '"priceCurrency": "USD"')
            .replace(
              /"description": "Polskie narzędzie AI do automatycznego wyszukiwania dostawców dla firm produkcyjnych\. Darmowe beta testy\."/,
              '"description": "AI-powered tool for automated supplier discovery across global markets. Free beta access."'
            )
            .replace(
              /"description": "Darmowe beta testy"/,
              '"description": "Free beta access"'
            )
        },
      },
    ],
    build: {
      outDir,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Split blog content waves into separate chunks so main bundle stays lean
            if (id.includes('/blog-data/wave-1.ts')) return 'blog-wave-1'
            if (id.includes('/blog-data/wave-2.ts')) return 'blog-wave-2'
            if (id.includes('/blog-data/wave-3.ts')) return 'blog-wave-3'
            if (id.includes('/blog-data/skeletons.ts')) return 'blog-skeletons'
            // Content data files
            if (id.includes('/content/features.ts')) return 'content-features'
            if (id.includes('/content/industries.ts')) return 'content-industries'
            if (id.includes('/content/integrations.ts')) return 'content-integrations'
            if (id.includes('/content/resources.ts')) return 'content-resources'
            // Content hub assets (SVG components)
            if (id.includes('/assets/content-hub/')) return 'content-hub-assets'
            // Framer Motion — heavy and rarely used critical-path
            if (id.includes('node_modules/framer-motion')) return 'vendor-framer'
            // React Router — critical, keep with React core
            if (id.includes('node_modules/react-router')) return 'vendor-router'
            if (id.includes('node_modules/react') || id.includes('node_modules/scheduler')) return 'vendor-react'
            // Lucide icons
            if (id.includes('node_modules/lucide-react')) return 'vendor-icons'
            return undefined
          },
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 5175,
    },
  }
})
