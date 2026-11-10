import { ListChecks } from "lucide-react"
import { Button } from "../../ui/button"
import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
} from "../../ui/trace"
import { useLocalProgress } from "../ai-workflows/demo-hooks"
import {
  ActivityLine,
  type ActivityStatus,
} from "../coding-agent/activity-line"
import { PreviewCard } from "../coding-agent/preview-card"

export function Task({
  title,
  status,
  findings,
}: {
  title: string
  status: ActivityStatus
  findings: string[]
}) {
  return (
    <TraceCollapsible defaultOpen>
      <TraceCollapsibleTrigger>
        <ActivityLine icon={ListChecks} title={title} status={status} />
      </TraceCollapsibleTrigger>
      <TraceCollapsibleContent>
        {findings.length ? (
          <Trace>
            {findings.map((text) => (
              <ActivityLine key={text} title={text} status="done" />
            ))}
          </Trace>
        ) : (
          <p className="text-sm">等待读取文件。</p>
        )}
      </TraceCollapsibleContent>
    </TraceCollapsible>
  )
}

const findings = [
  "定位到 ChatInput 的 onKeyDown",
  "复现选字回车误发送",
  "确认普通回车与换行的行为",
]

export function TaskDemo() {
  const run = useLocalProgress(1800)
  const count = Math.floor((run.progress / 100) * findings.length)
  return (
    <PreviewCard title="Agent 任务">
      <Trace>
        <Task
          title="排查聊天输入框"
          status={run.running ? "running" : run.complete ? "done" : "pending"}
          findings={findings.slice(0, count)}
        />
      </Trace>
      <Button
        size="sm"
        variant="outline"
        className="self-start"
        disabled={run.running}
        onClick={run.start}
      >
        {run.complete ? "再次排查" : "开始排查"}
      </Button>
    </PreviewCard>
  )
}
