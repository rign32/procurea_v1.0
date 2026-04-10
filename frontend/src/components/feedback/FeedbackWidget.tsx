import { useState } from "react"
import { useLocation } from "react-router-dom"
import { MessageSquare, Bug, Lightbulb, Send, X } from "lucide-react"
import { toast } from "sonner"
import { isEN } from "@/i18n"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { apiClient } from "@/services/api.client"

type FeedbackType = "bug" | "feature" | "other"

const typeConfig: Record<FeedbackType, { icon: typeof Bug; label: string; labelEN: string }> = {
  bug: { icon: Bug, label: "Bug", labelEN: "Bug" },
  feature: { icon: Lightbulb, label: "Propozycja", labelEN: "Feature" },
  other: { icon: MessageSquare, label: "Inne", labelEN: "Other" },
}

export function FeedbackWidget() {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<FeedbackType>("bug")
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const location = useLocation()

  const handleSubmit = async () => {
    if (!message.trim()) {
      toast.error(isEN ? "Please enter a message" : "Wpisz wiadomosc")
      return
    }

    setSubmitting(true)
    try {
      await apiClient.post("/feedback", {
        type,
        message: message.trim(),
        page: location.pathname,
      })
      toast.success(
        isEN
          ? "Thank you for your feedback!"
          : "Dziekujemy za zgoszenie!"
      )
      setMessage("")
      setType("bug")
      setOpen(false)
    } catch {
      toast.error(
        isEN
          ? "Failed to send feedback. Please try again."
          : "Nie udalo sie wyslac. Sprobuj ponownie."
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "fixed bottom-5 right-5 z-50 flex h-11 w-11 items-center justify-center rounded-full shadow-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          open
            ? "bg-muted text-muted-foreground"
            : "bg-primary text-primary-foreground"
        )}
        title={isEN ? "Send feedback" : "Wyslij feedback"}
      >
        {open ? <X className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
      </button>

      {/* Slide-out panel */}
      {open && (
        <div className="fixed bottom-20 right-5 z-50 w-80 rounded-lg border bg-background p-4 shadow-xl animate-in slide-in-from-bottom-2 fade-in-0 duration-200">
          <div className="mb-3">
            <h3 className="text-sm font-semibold">
              {isEN ? "Send Feedback" : "Wyslij feedback"}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isEN
                ? "Report a bug or suggest a feature"
                : "Zglos blad lub zaproponuj funkcje"}
            </p>
          </div>

          {/* Type selector */}
          <div className="mb-3">
            <Label className="text-xs mb-1.5 block">
              {isEN ? "Type" : "Typ"}
            </Label>
            <div className="flex gap-1.5">
              {(Object.entries(typeConfig) as [FeedbackType, typeof typeConfig.bug][]).map(
                ([key, config]) => {
                  const Icon = config.icon
                  return (
                    <button
                      key={key}
                      onClick={() => setType(key)}
                      className={cn(
                        "flex flex-1 items-center justify-center gap-1.5 rounded-md border px-2 py-1.5 text-xs font-medium transition-colors",
                        type === key
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-input text-muted-foreground hover:bg-muted"
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {isEN ? config.labelEN : config.label}
                    </button>
                  )
                }
              )}
            </div>
          </div>

          {/* Message */}
          <div className="mb-3">
            <Label htmlFor="feedback-msg" className="text-xs mb-1.5 block">
              {isEN ? "Message" : "Wiadomosc"}
            </Label>
            <Textarea
              id="feedback-msg"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                isEN
                  ? "Describe the issue or your idea..."
                  : "Opisz problem lub swoj pomysl..."
              }
              className="min-h-[80px] resize-none text-sm"
              maxLength={2000}
            />
            <div className="text-right text-[10px] text-muted-foreground mt-0.5">
              {message.length}/2000
            </div>
          </div>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={submitting || !message.trim()}
            size="sm"
            className="w-full"
          >
            <Send className="h-3.5 w-3.5 mr-1.5" />
            {submitting
              ? (isEN ? "Sending..." : "Wysylanie...")
              : (isEN ? "Send" : "Wyslij")}
          </Button>
        </div>
      )}
    </>
  )
}
