import { ChartPie } from "lucide-react"
import { Button } from "../../ui/button"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../../ui/hover-card"
import { Progress } from "../../ui/progress"
import { PreviewCard } from "../coding-agent/preview-card"

export function ContextUsage({
  limit,
  usage,
}: {
  limit: number
  usage: { label: string; tokens: number }[]
}) {
  const used = usage.reduce((total, item) => total + item.tokens, 0)
  const percent = limit > 0 ? Math.round((used / limit) * 100) : 0
  return (
    <HoverCard>
      <HoverCardTrigger
        delay={120}
        render={<Button variant="outline" size="sm" className="self-start" />}
      >
        <ChartPie data-icon="inline-start" />
        上下文 {percent}%
      </HoverCardTrigger>
      <HoverCardContent className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium">上下文用量</span>
          <span className="text-xs text-muted-foreground">
            {used.toLocaleString("zh-CN")} / {limit.toLocaleString("zh-CN")}
          </span>
        </div>
        <Progress value={Math.min(percent, 100)} aria-label="上下文用量" />
        <dl className="flex flex-col gap-1.5 text-xs text-muted-foreground">
          {usage.map((item) => (
            <div key={item.label} className="flex justify-between gap-2">
              <dt>{item.label}</dt>
              <dd>{item.tokens.toLocaleString("zh-CN")}</dd>
            </div>
          ))}
        </dl>
      </HoverCardContent>
    </HoverCard>
  )
}

export function ContextDemo() {
  return (
    <PreviewCard title="上下文用量">
      <ContextUsage
        limit={32000}
        usage={[
          { label: "对话消息", tokens: 3150 },
          { label: "文件与工具输出", tokens: 850 },
        ]}
      />
    </PreviewCard>
  )
}
