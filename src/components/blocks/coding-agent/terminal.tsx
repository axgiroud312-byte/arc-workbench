import { useState } from "react"
import { SquareTerminal } from "lucide-react"
import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
} from "../../ui/trace"
import { ActivityLine } from "./activity-line"
import { CodeSample } from "./code-sample"
import { PreviewCard } from "./preview-card"
import type { ToolCallData } from "./tool-call"

export function Terminal({ commands }: { commands: ToolCallData[] }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  return (
    <Trace aria-label="终端命令">
      {commands.map((command, index) => (
        <TraceCollapsible
          key={command.id}
          open={expanded[command.id] ?? index === commands.length - 1}
          onOpenChange={(open) =>
            setExpanded((current) => ({ ...current, [command.id]: open }))
          }
        >
          <TraceCollapsibleTrigger>
            <ActivityLine
              icon={SquareTerminal}
              title={command.input ?? command.title}
              status={command.status}
              description={command.duration}
            />
          </TraceCollapsibleTrigger>
          <TraceCollapsibleContent>
            <CodeSample
              title={command.title}
              value={
                command.error ??
                command.output ??
                (command.status === "stopped"
                  ? "命令已停止。"
                  : "等待命令输出…")
              }
              error={command.status === "error"}
            />
          </TraceCollapsibleContent>
        </TraceCollapsible>
      ))}
    </Trace>
  )
}

const sampleCommands: ToolCallData[] = [
  {
    id: "list",
    name: "run_command",
    title: "搜索键盘处理函数",
    input: 'rg -n "onKeyDown" src',
    status: "done",
    duration: "0.3 秒",
    output: "src/chat-input.tsx:28: function onKeyDown(event) {",
  },
  {
    id: "test",
    name: "run_command",
    title: "运行输入框测试",
    input: "npm test -- chat-input",
    status: "done",
    duration: "0.8 秒",
    output:
      "✓ 选字时回车不发送\n✓ 普通回车发送\n✓ Shift + Enter 换行\n\n3 项通过 · 退出码 0",
  },
]

export function TerminalDemo() {
  return (
    <PreviewCard title="命令记录">
      <Terminal commands={sampleCommands} />
    </PreviewCard>
  )
}
