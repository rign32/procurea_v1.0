import { motion } from "framer-motion"
import { t } from "@/i18n"

const isEN = t.meta.lang === "en"

const stats = isEN
  ? [
      { value: "4.9%",  label: "avg. cost reduction on the first RFQ vs. incumbent" },
      { value: "37%",   label: "faster end-to-end sourcing cycle (internal benchmark, n=128)" },
      { value: "47%",   label: "of buyers reduced single-source dependency within 8 weeks" },
      { value: "$62B+", label: "of SMB procurement spend across indexed categories" },
    ]
  : [
      { value: "4,9%",  label: "średnia redukcja kosztu na pierwszym RFQ vs. obecny dostawca" },
      { value: "37%",   label: "szybszy cykl sourcingowy end-to-end (benchmark wewnętrzny, n=128)" },
      { value: "47%",   label: "kupców zredukowało single-source dependency w 8 tygodni" },
      { value: "62B+",  label: "wydatków procurement SMB w indeksowanych kategoriach" },
    ]

export function StatsStripSection() {
  return (
    <section className="py-[clamp(32px,5vw,72px)]">
      <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,72px)]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="stats-strip"
        >
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.08 * i }}
            >
              <div className="stat-value tabular-nums">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
