import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import App from "./App"
import "./index.css"
import { initCookieConsent } from "./lib/cookieconsent"
import { t } from "./i18n"

initCookieConsent(t.meta.lang as 'pl' | 'en');

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
