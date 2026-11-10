import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
} from "../../ui/trace"
import { ActivityLine } from "../coding-agent/activity-line"
import { CodeSample } from "../coding-agent/code-sample"
import { PreviewCard } from "../coding-agent/preview-card"

export function StackTrace({
  error,
  frames,
}: {
  error: string
  frames: string[]
}) {
  return (
    <TraceCollapsible>
      <TraceCollapsibleTrigger>
        <ActivityLine title={error} status="error" />
      </TraceCollapsibleTrigger>
      <TraceCollapsibleContent>
        <CodeSample
          title="错误堆栈"
          value={[error, ...frames].join("\n")}
          error
        />
      </TraceCollapsibleContent>
    </TraceCollapsible>
  )
}

export function StackTraceDemo() {
  return (
    <PreviewCard title="堆栈跟踪">
      <Trace>
        <StackTrace
          error="TypeError · 无法读取未初始化的输入框"
          frames={[
            "at submitMessage (src/chat-input.tsx:42:13)",
            "at onKeyDown (src/chat-input.tsx:31:9)",
            "at reproduceComposition (src/chat-input.test.tsx:17:7)",
          ]}
        />
      </Trace>
    </PreviewCard>
  )
}
