import { useState } from "react"
import { Route } from "lucide-react"
import { Button } from "../../ui/button"
import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceDescription,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "../../ui/trace"
import {
  ActivityLine,
  activityLabels,
  type ActivityStatus,
} from "../coding-agent/activity-line"
import { PreviewCard } from "../coding-agent/preview-card"

export type PlanStep = {
  id: string
  title: string
  status: ActivityStatus
  detail?: string
}

export function Plan({
  title,
  steps,
  defaultOpen = true,
}: {
  title: string
  steps: PlanStep[]
  defaultOpen?: boolean
}) {
  const completed = steps.filter((step) => step.status === "done").length
  const active = steps.find(
    (step) =>
      step.status === "waiting" ||
      step.status === "running" ||
      step.status === "error" ||
      step.status === "blocked" ||
      step.status === "stopped"
  )
  return (
    <TraceCollapsible defaultOpen={defaultOpen}>
      <TraceCollapsibleTrigger>
        <TraceLine>
          <TraceIcon>
            <Route />
          </TraceIcon>
          <TraceTitle>{title}</TraceTitle>
          <TraceDescription>
            {active && activityLabels[active.status] + " · "}
            {completed} / {steps.length} 完成
          </TraceDescription>
        </TraceLine>
      </TraceCollapsibleTrigger>
      <TraceCollapsibleContent>
        <Trace>
          {steps.map((step) => {
            const line = (
              <ActivityLine title={step.title} status={step.status} />
            )
            return step.detail ? (
              <TraceCollapsible key={step.id}>
                <TraceCollapsibleTrigger>{line}</TraceCollapsibleTrigger>
                <TraceCollapsibleContent className="text-xs text-muted-foreground">
                  {step.detail}
                </TraceCollapsibleContent>
              </TraceCollapsible>
            ) : (
              <div key={step.id}>{line}</div>
            )
          })}
        </Trace>
      </TraceCollapsibleContent>
    </TraceCollapsible>
  )
}

const sampleSteps = ["定位输入框", "补上组字判断", "验证三种回车行为"]

export function PlanDemo() {
  const [completed, setCompleted] = useState(1)
  const steps: PlanStep[] = sampleSteps.map((title, index) => ({
    id: title,
    title,
    status:
      index < completed ? "done" : index === completed ? "running" : "pending",
  }))
  return (
    <PreviewCard title="执行计划">
      <Trace>
        <Plan title="修复回车误发送" steps={steps} />
      </Trace>
      <Button
        variant="outline"
        size="sm"
        className="self-start"
        onClick={() =>
          setCompleted(completed === steps.length ? 0 : completed + 1)
        }
      >
        {completed === steps.length ? "重置进度" : "完成当前步骤"}
      </Button>
    </PreviewCard>
  )
}
