import { Brain } from "lucide-react"
import { Button } from "../../ui/button"
import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
} from "../../ui/trace"
import { useTextStream } from "../ai-conversation/demo-helpers"
import { ActivityLine } from "../coding-agent/activity-line"
import { PreviewCard } from "../coding-agent/preview-card"

export function Reasoning({
  summary,
  running = false,
  duration,
}: {
  summary: string
  running?: boolean
  duration?: string
}) {
  return (
    <TraceCollapsible
      key={running ? "writing" : "finished"}
      defaultOpen={running}
    >
      <TraceCollapsibleTrigger>
        <ActivityLine
          icon={Brain}
          title={running ? "正在整理判断" : "思考摘要"}
          status={running ? "running" : "done"}
          description={duration}
        />
      </TraceCollapsibleTrigger>
      <TraceCollapsibleContent>
        <p className="text-sm whitespace-pre-line">{summary}</p>
      </TraceCollapsibleContent>
    </TraceCollapsible>
  )
}

const example =
  "输入法选字和普通回车触发的是同一个键盘事件。应该先看组字状态，再决定要不要发送消息，最后补测试覆盖选字、发送和换行。"

export function ReasoningDemo() {
  const stream = useTextStream()
  return (
    <PreviewCard title="推理摘要">
      <Trace>
        <Reasoning
          summary={stream.running ? stream.text : example}
          running={stream.running}
        />
      </Trace>
      <Button
        size="sm"
        variant="outline"
        className="self-start"
        disabled={stream.running}
        onClick={() => stream.start(example)}
      >
        重播摘要
      </Button>
    </PreviewCard>
  )
}
