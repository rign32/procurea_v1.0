import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { AccordionItem } from "@/components/ui/AccordionItem"
import { MessageCircleQuestion } from "lucide-react"

const faqs = [
  {
    question: "Jak działa wyszukiwanie AI?",
    answer:
      "Procurea wykorzystuje wieloetapowy system agentów AI. Agent strategii generuje zapytania w wielu językach dopasowane do Twoich wymagań. Agent eksploracji przeszukuje internet i identyfikuje producentów. Agent analizy ocenia ich możliwości, a agent wzbogacania automatycznie znajduje dane kontaktowe. Cały proces trwa minuty, nie tygodnie.",
  },
  {
    question: "Jakie regiony są obsługiwane?",
    answer:
      "Możesz wyszukiwać dostawców w Polsce, całej Unii Europejskiej lub globalnie. System generuje zapytania w 26 językach, w tym niemieckim, czeskim, włoskim, ale też japońskim, koreańskim, chińskim, tureckim czy hindi — dzięki czemu dociera do dostawców, których nie znajdziesz standardowym wyszukiwaniem.",
  },
  {
    question: "Co dokładnie jest dostępne w beta testach?",
    answer:
      "W ramach beta testów masz pełny dostęp do wyszukiwarki AI dostawców, włącznie z wieloetapowym wyszukiwaniem w 26 językach, automatycznym wzbogacaniem danych kontaktowych, bazą dostawców i monitoringiem na żywo. Funkcje takie jak zapytania ofertowe i sekwencje email są w fazie rozwoju i pojawią się w pełnej wersji produktu.",
  },
  {
    question: "Jak długo trwają beta testy?",
    answer:
      "Beta testy planujemy na okres 2–3 miesięcy. W tym czasie zbieramy opinie i udoskonalamy narzędzie. Po zakończeniu beta testów otrzymasz darmowe kredyty na start w pełnej wersji produktu.",
  },
  {
    question: "Czy moje dane są bezpieczne?",
    answer:
      "Tak. Korzystamy z infrastruktury Google Cloud (region europa-west1), szyfrowania danych w transmisji i spoczynku oraz uwierzytelniania OAuth 2.0 przez Google i Microsoft. Twoje dane nigdy nie opuszczają infrastruktury europejskiej.",
  },
  {
    question: "Czy muszę coś płacić po zakończeniu beta?",
    answer:
      "Nie. Udział w beta testach jest całkowicie darmowy i nie zobowiązuje do zakupu. Po zakończeniu beta otrzymasz darmowe kredyty jako podziękowanie. Dalsze korzystanie z platformy będzie opcjonalne.",
  },
]

export function FaqSection() {
  return (
    <section id="faq" className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] rounded-full bg-indigo-500/[0.02] blur-[80px] pointer-events-none" />

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 relative z-10">
        <RevealOnScroll>
          <div className="text-center mb-14">
            <div className="inline-flex items-center justify-center h-13 w-13 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white mb-5 shadow-sm">
              <MessageCircleQuestion className="h-6 w-6" />
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight mb-4">
              Często zadawane pytania
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground">
              Wszystko co musisz wiedzieć o beta testach Procurea
            </p>
          </div>
        </RevealOnScroll>

        <RevealOnScroll delay={0.1}>
          <div className="rounded-2xl border border-border bg-card p-1.5 shadow-sm">
            <div className="divide-y divide-border px-5 sm:px-6">
              {faqs.map((faq) => (
                <AccordionItem
                  key={faq.question}
                  question={faq.question}
                  answer={faq.answer}
                />
              ))}
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  )
}
