import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig(({ mode }) => {
  const isEN = mode === 'production-en'

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
              '<meta property="og:image" content="https://procurea.io/og-image.png" />'
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
              '<meta name="twitter:image" content="https://procurea.io/og-image.png" />'
            )
            .replace(
              /<link rel="canonical" href=".*?" \/>/,
              '<link rel="canonical" href="https://procurea.io/" />'
            )
            .replace(
              /"description": "Polskie narzędzie AI do automatycznego wyszukiwania dostawców dla firm produkcyjnych\. Darmowe beta testy\."/,
              '"description": "AI-powered tool for automated supplier discovery across global markets. Free beta access."'
            )
            .replace(
              /"url": "https:\/\/procurea\.pl"/,
              '"url": "https://procurea.io"'
            )
            .replace(
              /"priceCurrency": "PLN"/,
              '"priceCurrency": "USD"'
            )
            .replace(
              /"description": "Darmowe beta testy"/,
              '"description": "Free beta access"'
            )
        },
      },
    ],
    build: {
      outDir: isEN ? 'dist-en' : 'dist',
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
