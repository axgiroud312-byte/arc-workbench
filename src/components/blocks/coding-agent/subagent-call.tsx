import { Bot } from "lucide-react"
import { Badge } from "../../ui/badge"
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
import { BrandMark, type BrandName } from "../shared"
import { ActivityLine, type ActivityStatus } from "./activity-line"
import { ToolCall, type ToolCallData } from "./tool-call"
import type { RunFile } from "./run-record"
import type { TestRun } from "./test-results"

export type SubagentCallData = {
  id: string
  title: string
  task: string
  status: ActivityStatus
  dependsOn?: string[]
  model?: { name: string; brand?: BrandName }
  tools?: ToolCallData[]
  files?: RunFile[]
  testRuns?: TestRun[]
  note?: string
  result?: string
  duration?: string
}

const sampleSubagent: SubagentCallData = {
  id: "check-ime",
  title: "子 Agent · 输入法边界检查",
  task: "检查输入法选字、普通回车和 Shift + Enter 的行为。",
  status: "done",
  model: { name: "Gemini", brand: "gemini" },
  tools: [
    {
      id: "read-keydown",
      name: "read_file",
      title: "读取键盘事件处理函数",
      status: "done",
      input: '{"path":"src/components/chat-input.tsx"}',
      output:
        'if (event.key === "Enter" && !event.shiftKey) {\n  handleSubmit()\n}',
    },
  ],
  result:
    "选字时也会触发回车事件。应先检查输入法是否仍在组字，再决定是否提交。",
  duration: "1.2 秒",
}

export function SubagentCall({
  call = sampleSubagent,
  defaultOpen = false,
}: { call?: SubagentCallData; defaultOpen?: boolean } = {}) {
  return (
    <TraceCollapsible defaultOpen={defaultOpen}>
      <TraceCollapsibleTrigger>
        <ActivityLine
          icon={Bot}
          title={call.title}
          status={call.status}
          description={call.duration}
        />
      </TraceCollapsibleTrigger>
      <TraceCollapsibleContent className="flex flex-col gap-3">
        <p className="text-sm">{call.task}</p>
        {call.model && (
          <Badge variant="outline">
            {call.model.brand && (
              <BrandMark brand={call.model.brand} className="size-3.5" />
            )}
            {call.model.name}
          </Badge>
        )}
        {!!call.tools?.length && (
          <Trace aria-label="子 Agent 的工具调用">
            {call.tools.map((tool) => (
              <ToolCall key={tool.id} call={tool} />
            ))}
          </Trace>
        )}
        {call.result && (
          <p className="text-sm text-foreground">{call.result}</p>
        )}
      </TraceCollapsibleContent>
    </TraceCollapsible>
  )
}

export function SubagentCallDemo() {
  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle>委派任务</CardTitle>
        <CardDescription>
          查看分配给子 Agent 的任务、工具调用和结论。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Trace>
          <SubagentCall defaultOpen />
        </Trace>
      </CardContent>
    </Card>
  )
}
