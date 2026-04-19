import { motion } from "framer-motion"
import { t } from "@/i18n"

const isEN = t.meta.lang === "en"

const copy = isEN
  ? {
      eyebrow: "Before / After",
      heading: "A new RFQ shouldn't eat your whole week.",
      lede: "Same procurement manager, same sourcing brief, two timelines.",
      beforeLabel: "Without Procurea",
      beforeDuration: "5 days",
      beforeTitle: "The old way",
      beforeLines: [
        { t: "Mon 09:00", l: "Dig through 3 directories and old email threads" },
        { t: "Tue",       l: "Send 22 cold emails, get 4 autoresponders" },
        { t: "Wed",       l: "Phone-tag with 6 distributors for datasheets" },
        { t: "Thu",       l: "Receive 5 quotes in 5 different formats & currencies" },
        { t: "Fri 17:30", l: "Normalize into a spreadsheet, hope nothing is missed" },
      ],
      afterLabel: "With Procurea",
      afterDuration: "20 minutes",
      afterTitle: "What it looks like now",
      afterLines: [
        { t: "00:00", l: "Paste the spec sheet, set region & budget" },
        { t: "00:02", l: "Procurea returns 50–250 verified suppliers, ranked" },
        { t: "00:06", l: "Shortlist 12; auto-generated RFQs sent in your template" },
        { t: "00:14", l: "Side-by-side comparison of responses as they land" },
        { t: "00:20", l: "Shortlist exported to your ERP / e-mail chain" },
      ],
    }
  : {
      eyebrow: "Przed / Po",
      heading: "Nowe zapytanie ofertowe nie musi pochłaniać całego tygodnia.",
      lede: "Ten sam manager procurement, to samo zapytanie — dwa różne scenariusze.",
      beforeLabel: "Bez Procurea",
      beforeDuration: "5 dni",
      beforeTitle: "Jak jest dzisiaj",
      beforeLines: [
        { t: "Pon 09:00", l: "Przekopywanie 3 katalogów i starych maili" },
        { t: "Wt",        l: "22 zimne maile, 4 autorespondery" },
        { t: "Śr",        l: "Telefony do 6 dystrybutorów po specyfikacje" },
        { t: "Czw",       l: "5 ofert w 5 różnych formatach i walutach" },
        { t: "Pt 17:30",  l: "Ręczne wpisywanie do arkusza, mam nadzieję, że nic nie umknęło" },
      ],
      afterLabel: "Z Procurea",
      afterDuration: "20 minut",
      afterTitle: "Jak wygląda to teraz",
      afterLines: [
        { t: "00:00", l: "Wklejasz specyfikację, ustawiasz region i budżet" },
        { t: "00:02", l: "Procurea zwraca 50–250 zweryfikowanych dostawców, z rankingiem" },
        { t: "00:06", l: "Skracasz listę do 12; auto-RFQ wysyłane z Twojego szablonu" },
        { t: "00:14", l: "Porównanie side-by-side odpowiedzi w czasie rzeczywistym" },
        { t: "00:20", l: "Shortlist eksportowana do ERP / łańcucha mailowego" },
      ],
    }

export function BeforeAfterSection() {
  return (
    <section className="relative py-[clamp(56px,8vw,112px)]" aria-labelledby="ba-heading">
      <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,72px)]">
        {/* Section head */}
        <div className="grid justify-items-center text-center gap-3.5 mb-[clamp(36px,5vw,64px)]">
          <span className="eyebrow">
            <span className="eyebrow-dot" />
            {copy.eyebrow}
          </span>
          <h2 className="text-[clamp(28px,3.4vw,42px)] font-bold leading-[1.1] max-w-[22ch]" id="ba-heading">
            {copy.heading}
          </h2>
          <p className="text-[18px] leading-[1.55] text-[hsl(var(--ds-ink-3))] max-w-[58ch] text-pretty">
            {copy.lede}
          </p>
        </div>

        {/* Before / After grid */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="ba-grid"
        >
          {/* Before column */}
          <div className="ba-col before">
            <div className="ba-h before">
              {copy.beforeLabel} · <strong className="font-semibold">{copy.beforeDuration}</strong>
            </div>
            <h3 className="text-[22px] tracking-[-0.02em] font-semibold mb-2.5 text-[hsl(var(--ds-ink))]">
              {copy.beforeTitle}
            </h3>
            {copy.beforeLines.map((line) => (
              <div key={line.t} className="ba-line">
                <span className="ba-time">{line.t}</span>
                <span className="text-[hsl(var(--ds-ink-2))]">{line.l}</span>
              </div>
            ))}
          </div>

          {/* After column */}
          <div className="ba-col">
            <div className="ba-h after">
              {copy.afterLabel} · <strong className="font-semibold">{copy.afterDuration}</strong>
            </div>
            <h3 className="text-[22px] tracking-[-0.02em] font-semibold mb-2.5 text-[hsl(var(--ds-ink))]">
              {copy.afterTitle}
            </h3>
            {copy.afterLines.map((line) => (
              <div key={line.t} className="ba-line">
                <span className="ba-time">{line.t}</span>
                <span className="text-[hsl(var(--ds-ink-2))]">{line.l}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
