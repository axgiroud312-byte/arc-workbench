import { useEffect, useRef, useState, type ReactNode } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../ui/card"
import { cn } from "../../../lib/utils"
import { Blocks } from "lucide-react"
import { BrandMark, type BrandName } from "../shared"

const integrationBrands: Record<string, BrandName> = {
  GitHub: "github",
  github: "github",
  Slack: "slack",
  slack: "slack",
  Notion: "notion",
  notion: "notion",
  Linear: "linear",
  linear: "linear",
  Gmail: "gmail",
  gmail: "gmail",
  Stripe: "stripe",
  stripe: "stripe",
  Figma: "figma",
  figma: "figma",
  Sentry: "sentry",
  sentry: "sentry",
  PostgreSQL: "postgresql",
  postgres: "postgresql",
  HubSpot: "hubspot",
  "Google Calendar": "google-calendar",
  "google-calendar": "google-calendar",
  "Google Drive": "google-drive",
  "google-drive": "google-drive",
  Vercel: "vercel",
  vercel: "vercel",
}

/** Real brand assets for integrations; a neutral icon for custom services. */
export function IntegrationMark({
  name,
  className,
}: {
  name: string
  className?: string
}) {
  const brand = integrationBrands[name]
  return brand ? (
    <BrandMark brand={brand} className={className} />
  ) : (
    <Blocks aria-hidden="true" className={cn("size-4", className)} />
  )
}

export function AgentPanel({
  title,
  description,
  action,
  children,
  footer,
  className,
}: {
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  children: ReactNode
  footer?: ReactNode
  className?: string
}) {
  return (
    <Card
      className={cn(
        "mx-auto w-full max-w-[720px] gap-5 overflow-hidden",
        className
      )}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-1.5">
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {action}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
      {footer && (
        <CardFooter className="flex-wrap justify-between gap-3">
          {footer}
        </CardFooter>
      )}
    </Card>
  )
}

/** A deterministic, cancellable local demo clock. No requests are sent. */
export function useSimulation(length = 5, interval = 650) {
  const [step, setStep] = useState(0)
  const [running, setRunning] = useState(false)
  useEffect(() => {
    if (!running) return
    const timer = window.setInterval(
      () => setStep((current) => Math.min(current + 1, length)),
      interval
    )
    return () => window.clearInterval(timer)
  }, [running, length, interval])
  useEffect(() => {
    if (step >= length) setRunning(false)
  }, [step, length])
  return {
    step,
    running,
    done: step >= length,
    start: () => {
      setStep(0)
      setRunning(true)
    },
    stop: () => setRunning(false),
    reset: () => {
      setStep(0)
      setRunning(false)
    },
  }
}

export function useTimers() {
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])
  return (callback: () => void, delay = 900) => {
    const timer = setTimeout(callback, delay)
    timers.current.push(timer)
    return timer
  }
}

export function DemoNote({ children = "本地演示" }: { children?: ReactNode }) {
  return <span className="text-xs text-muted-foreground">{children}</span>
}
