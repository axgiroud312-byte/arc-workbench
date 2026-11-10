import { useState } from "react"
import { Brain } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card"
import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
} from "../../ui/trace"
import { ActivityLine, type ActivityStatus } from "./activity-line"

export type ReasoningStep = {
  id: string
  title: string
  status: ActivityStatus
  detail?: string
}

const sampleSteps: ReasoningStep[] = [
  {
    id: "locate",
    title: "定位回车提交入口",
    status: "done",
    detail:
      "键盘事件和发送按钮使用同一个提交函数。本次问题出在键盘事件的判断条件。",
  },
  {
    id: "verify",
    title: "区分选字和发送",
    status: "done",
    detail:
      "输入法组字期间按回车用于确认候选词。普通回车发送，Shift + Enter 换行。",
  },
  {
    id: "test",
    title: "验证三种输入场景",
    status: "done",
    detail:
      "分别检查输入法选字、普通回车和换行，确认修复没有影响原来的快捷键。",
  },
]

export function ReasoningSteps({
  steps = sampleSteps,
  defaultOpen,
}: { steps?: ReasoningStep[]; defaultOpen?: boolean } = {}) {
  const [summaryOpen, setSummaryOpen] = useState(defaultOpen)
  const [openSteps, setOpenSteps] = useState<Record<string, boolean>>({})
  if (!steps.length) return null

  const finished = steps.filter((step) => step.status === "done").length
  const running = steps.some((step) => step.status === "running")
  let status: ActivityStatus = "pending"
  if (running) status = "running"
  else if (steps.some((step) => step.status === "error")) status = "error"
  else if (steps.some((step) => step.status === "stopped")) status = "stopped"
  else if (finished === steps.length) status = "done"

  return (
    <TraceCollapsible
      open={summaryOpen ?? running}
      onOpenChange={setSummaryOpen}
    >
      <TraceCollapsibleTrigger>
        <ActivityLine
          icon={Brain}
          title="思考步骤"
          status={status}
          description={`${finished} / ${steps.length} 步`}
        />
      </TraceCollapsibleTrigger>
      <TraceCollapsibleContent>
        <Trace aria-label="逐步思考摘要">
          {steps.map((step) => {
            const line = (
              <ActivityLine title={step.title} status={step.status} />
            )
            if (!step.detail || step.status === "pending") {
              return <div key={step.id}>{line}</div>
            }
            return (
              <TraceCollapsible
                key={step.id}
                open={openSteps[step.id] ?? false}
                onOpenChange={(open) =>
                  setOpenSteps((prev) => ({ ...prev, [step.id]: open }))
                }
              >
                <TraceCollapsibleTrigger>{line}</TraceCollapsibleTrigger>
                <TraceCollapsibleContent className="text-sm">
                  {step.detail}
                </TraceCollapsibleContent>
              </TraceCollapsible>
            )
          })}
        </Trace>
      </TraceCollapsibleContent>
    </TraceCollapsible>
  )
}

export function ReasoningStepsDemo() {
  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle>修复回车误提交</CardTitle>
        <CardDescription>
          展开任一步骤，查看这一阶段的判断和结果。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Trace>
          <ReasoningSteps defaultOpen />
        </Trace>
      </CardContent>
    </Card>
  )
}
