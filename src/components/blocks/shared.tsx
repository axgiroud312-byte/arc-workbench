import { useCallback, useEffect, useState, type ReactNode } from "react"
import { Check, Circle, Loader2, X, type LucideIcon } from "lucide-react"
import { Badge } from "../ui/badge"
import { cn } from "../../lib/utils"
import claude from "../../assets/brands/claude.svg"
import openai from "../../assets/brands/openai.svg"
import codex from "../../assets/brands/codex.svg"
import gemini from "../../assets/brands/gemini.svg"
import google from "../../assets/brands/google.svg"
import github from "../../assets/brands/github.svg"
import slack from "../../assets/brands/slack.svg"
import notion from "../../assets/brands/notion.svg"
import linear from "../../assets/brands/linear.svg"
import gmail from "../../assets/brands/gmail.svg"
import googleCalendar from "../../assets/brands/google-calendar.svg"
import googleDrive from "../../assets/brands/google-drive.svg"
import stripe from "../../assets/brands/stripe.svg"
import figma from "../../assets/brands/figma.svg"
import sentry from "../../assets/brands/sentry.svg"
import postgresql from "../../assets/brands/postgresql.svg"
import hubspot from "../../assets/brands/hubspot.svg"
import vercel from "../../assets/brands/vercel.svg"
import retool from "../../assets/brands/retool.svg"
import salesforce from "../../assets/brands/salesforce.svg"
import zoom from "../../assets/brands/zoom.svg"
import confluence from "../../assets/brands/confluence.svg"
import zendesk from "../../assets/brands/zendesk.svg"

const brandAssets = {
  claude,
  openai,
  codex,
  gemini,
  google,
  github,
  slack,
  notion,
  linear,
  gmail,
  "google-calendar": googleCalendar,
  "google-drive": googleDrive,
  stripe,
  figma,
  sentry,
  postgresql,
  hubspot,
  vercel,
  retool,
  salesforce,
  zoom,
  confluence,
  zendesk,
} as const
export type BrandName = keyof typeof brandAssets
const monochromeBrands = new Set<BrandName>([
  "openai",
  "codex",
  "github",
  "linear",
  "vercel",
  "zendesk",
  "sentry",
])

export function BlockHeader({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: LucideIcon
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border bg-muted/40">
            <Icon className="size-4" />
          </div>
        )}
        <div>
          <h3 className="leading-6 font-medium">{title}</h3>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  )
}

export function StatusBadge({
  status = "neutral",
  children,
}: {
  status?: "success" | "warning" | "error" | "neutral" | "running"
  children: ReactNode
}) {
  const Icon =
    status === "success"
      ? Check
      : status === "error"
        ? X
        : status === "running"
          ? Loader2
          : Circle
  return (
    <Badge
      variant="secondary"
      data-status={status}
      className="status-badge gap-1.5"
    >
      <Icon
        data-icon="inline-start"
        className={cn(status === "running" && "animate-spin")}
      />
      {children}
    </Badge>
  )
}

export function BrandMark({
  brand = "claude",
  className,
}: {
  brand?: BrandName
  className?: string
}) {
  return (
    <span
      aria-hidden="true"
      data-brand={brand}
      className={cn(
        "brand-mark inline-flex size-4 shrink-0 items-center justify-center align-middle",
        className
      )}
    >
      {monochromeBrands.has(brand) ? (
        <span
          className="brand-mark-mono"
          style={{
            maskImage: `url("${brandAssets[brand]}")`,
            WebkitMaskImage: `url("${brandAssets[brand]}")`,
          }}
        />
      ) : (
        <img
          src={brandAssets[brand]}
          alt=""
          draggable={false}
          className="size-full object-contain"
        />
      )}
    </span>
  )
}

export function useDemoRun({
  steps = 100,
  interval = 80,
}: { steps?: number; interval?: number } = {}) {
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    if (!running) return
    const timer = window.setInterval(
      () => setProgress((value) => Math.min(steps, value + 1)),
      interval
    )
    return () => window.clearInterval(timer)
  }, [running, steps, interval])
  useEffect(() => {
    if (progress >= steps) setRunning(false)
  }, [progress, steps])
  const start = useCallback(() => {
    setProgress(0)
    setRunning(true)
  }, [])
  const stop = useCallback(() => setRunning(false), [])
  const reset = useCallback(() => {
    setRunning(false)
    setProgress(0)
  }, [])
  return {
    running,
    progress: steps > 0 ? (progress / steps) * 100 : 0,
    step: progress,
    start,
    stop,
    reset,
  }
}
