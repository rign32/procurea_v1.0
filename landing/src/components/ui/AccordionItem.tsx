import { useId, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface AccordionItemProps {
  question: string
  answer: string
}

export function AccordionItem({ question, answer }: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(false)
  const id = useId()
  const panelId = `accordion-panel-${id}`
  const triggerId = `accordion-trigger-${id}`

  return (
    <div className={cn("border-b border-border last:border-b-0", isOpen && "border-l-2 border-primary pl-[calc(1rem-2px)]")}>
      <button
        id={triggerId}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="flex w-full items-center justify-between py-5 text-left group hover:bg-muted/40 rounded-lg px-3 -mx-3"
      >
        <span className="text-base font-semibold pr-4 group-hover:text-foreground transition-colors">{question}</span>
        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 text-muted-foreground transition-all duration-200 group-hover:text-primary",
            isOpen && "rotate-180"
          )}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={triggerId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] as const }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm sm:text-[0.925rem] text-muted-foreground leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
