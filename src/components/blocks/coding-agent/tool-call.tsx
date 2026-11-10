import { Terminal } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card"
import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockTitle,
} from "../../ui/code-block"
import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
} from "../../ui/trace"
import { ActivityLine, type ActivityStatus } from "./activity-line"

export type ToolCallData = {
  id: string
  name: string
  title: string
  status: ActivityStatus
  input?: string
  output?: string
  error?: string
  duration?: string
}

const sampleCall: ToolCallData = {
  id: "search-submit",
  name: "run_command",
  title: "查找输入框的提交入口",
  status: "done",
  input: 'rg -n "onKeyDown|handleSubmit" src',
  output:
    "src/components/chat-input.tsx:28:  function onKeyDown(event) {\nsrc/components/chat-input.tsx:42:    handleSubmit()",
  duration: "0.3 秒",
}

export function ToolCall({
  call = sampleCall,
  defaultOpen = false,
}: { call?: ToolCallData; defaultOpen?: boolean } = {}) {
  const line = (
    <ActivityLine
      icon={Terminal}
      title={call.title}
      status={call.status}
      description={call.duration}
    />
  )
  const hasDetails =
    call.output !== undefined ||
    call.error !== undefined ||
    (call.status === "stopped" && call.input !== undefined)

  if (!hasDetails) return line

  return (
    <TraceCollapsible defaultOpen={defaultOpen}>
      <TraceCollapsibleTrigger>{line}</TraceCollapsibleTrigger>
      <TraceCollapsibleContent className="flex flex-col gap-3">
        <p className="font-mono text-xs">{call.name}</p>
        {call.input !== undefined && (
          <ToolValue title="输入参数" value={call.input} />
        )}
        {call.output !== undefined && (
          <ToolValue title="工具输出" value={call.output || "无输出"} />
        )}
        {call.error !== undefined && (
          <ToolValue title="错误信息" value={call.error} error />
        )}
      </TraceCollapsibleContent>
    </TraceCollapsible>
  )
}

function ToolValue({
  title,
  value,
  error,
}: {
  title: string
  value: string
  error?: boolean
}) {
  return (
    <CodeBlock size="sm" variant={error ? "destructive" : "default"}>
      <CodeBlockHeader>
        <CodeBlockTitle>{title}</CodeBlockTitle>
        <CodeBlockActions>
          <CodeBlockCopyButton value={value} aria-label={`复制${title}`} />
        </CodeBlockActions>
      </CodeBlockHeader>
      <CodeBlockContent wrap className="max-h-48">
        {value}
      </CodeBlockContent>
    </CodeBlock>
  )
}

export function ToolCallDemo() {
  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle>命令执行记录</CardTitle>
        <CardDescription>展开一条记录，查看命令和返回结果。</CardDescription>
      </CardHeader>
      <CardContent>
        <Trace>
          <ToolCall defaultOpen />
          <ToolCall
            call={{
              id: "failed-test",
              name: "run_command",
              title: "复现输入法回车误提交",
              status: "error",
              input: "npm test -- chat-input",
              error: "预期提交 0 次，实际提交 1 次。\n退出码 1",
            }}
          />
        </Trace>
      </CardContent>
    </Card>
  )
}
