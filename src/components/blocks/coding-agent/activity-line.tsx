import {
  Check,
  Circle,
  CircleAlert,
  CircleHelp,
  CircleStop,
  Loader2,
  type LucideIcon,
} from "lucide-react"
import {
  TraceDescription,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "../../ui/trace"
import { cn } from "../../../lib/utils"

export type ActivityStatus =
  "pending" | "running" | "done" | "error" | "stopped" | "waiting" | "blocked"

export const activityLabels: Record<ActivityStatus, string> = {
  pending: "待执行",
  running: "执行中",
  done: "已完成",
  error: "失败",
  stopped: "已停止",
  waiting: "待你处理",
  blocked: "受阻",
}

export function ActivityLine({
  icon: Icon = Check,
  title,
  status,
  description,
}: {
  icon?: LucideIcon
  title: string
  status: ActivityStatus
  description?: string
}) {
  const traceStatus =
    status === "running" || status === "error" || status === "pending"
      ? status
      : undefined
  const StatusIcon =
    status === "running"
      ? Loader2
      : status === "error"
        ? CircleAlert
        : status === "stopped"
          ? CircleStop
          : status === "waiting" || status === "blocked"
            ? CircleHelp
            : status === "pending"
              ? Circle
              : Icon

  return (
    <TraceLine status={traceStatus}>
      <TraceIcon>
        <StatusIcon
          className={cn(status === "running" && "motion-safe:animate-spin")}
        />
      </TraceIcon>
      <TraceTitle>{title}</TraceTitle>
      <TraceDescription className="text-xs">
        {description || activityLabels[status]}
        {description && (
          <span className="sr-only">，{activityLabels[status]}</span>
        )}
      </TraceDescription>
    </TraceLine>
  )
}
