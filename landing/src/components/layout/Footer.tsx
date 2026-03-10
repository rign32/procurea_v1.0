import { Link } from "react-router-dom"

const footerLinks = {
  produkt: [
    { label: "Co zyskujesz", href: "#co-zyskujesz" },
    { label: "Jak to działa", href: "#jak-to-dziala" },
    { label: "Dla kogo", href: "#dla-kogo" },
    { label: "FAQ", href: "#faq" },
  ],
  firma: [
    { label: "kontakt@procurea.pl", href: "mailto:kontakt@procurea.pl" },
    { label: "+48 536 067 316", href: "tel:+48536067316" },
  ],
}

const legalLinks = [
  { label: "Regulamin", to: "/regulamin" },
  { label: "Polityka prywatności", to: "/polityka-prywatnosci" },
  { label: "RODO", to: "/rodo" },
]

export function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-gray-900">
                <span className="text-sm font-bold">P</span>
              </div>
              <span className="text-lg font-bold text-white">Procurea</span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              Polskie narzędzie AI do wyszukiwania dostawców. Obecnie w beta testach.
            </p>
          </div>

          {/* Produkt */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-4 text-gray-500">
              Produkt
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.produkt.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Firma */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-4 text-gray-500">
              Firma
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.firma.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Prawne */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-4 text-gray-500">
              Prawne
            </h3>
            <ul className="space-y-2.5">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/[0.06]">
          <p className="text-xs text-gray-600 text-center">
            &copy; {new Date().getFullYear()} Procurea sp. z o.o. Wszelkie prawa zastrzeżone.
          </p>
        </div>
      </div>
    </footer>
  )
}
