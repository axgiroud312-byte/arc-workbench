import { useState, type ReactNode } from "react"
import { Button } from "../../ui/button"
import { cn } from "../../../lib/utils"
import { PreviewCard } from "../coding-agent/preview-card"

export function Shimmer({
  children,
  active = true,
}: {
  children: ReactNode
  active?: boolean
}) {
  return (
    <span className={cn(active && "shimmer motion-reduce:shimmer-none")}>
      {children}
    </span>
  )
}

export function ShimmerDemo() {
  const [running, setRunning] = useState(true)
  return (
    <PreviewCard title="等待状态">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm text-muted-foreground" role="status">
          <Shimmer active={running}>
            {running ? "正在读取工作区文件…" : "文件读取完成"}
          </Shimmer>
        </span>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setRunning(!running)}
        >
          {running ? "结束读取" : "重新读取"}
        </Button>
      </div>
    </PreviewCard>
  )
}
