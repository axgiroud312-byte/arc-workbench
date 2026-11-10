import { useState } from "react"
import { Button } from "../../ui/button"
import { Marker, MarkerContent } from "../../ui/marker"
import { Bubble, BubbleContent } from "../../ui/bubble"
import { Message, MessageContent } from "../../ui/message"
import { PreviewCard } from "../coding-agent/preview-card"

export function Checkpoint({
  label,
  onRestore,
}: {
  label: string
  onRestore: () => void
}) {
  return (
    <Marker variant="separator">
      <MarkerContent className="inline-flex items-center gap-2">
        {label}
        <Button variant="outline" size="xs" onClick={onRestore}>
          恢复到这里
        </Button>
      </MarkerContent>
    </Marker>
  )
}

export function CheckpointDemo() {
  const [restored, setRestored] = useState(false)
  return (
    <PreviewCard title="对话检查点">
      <Message align="start">
        <MessageContent>
          <Bubble variant="ghost">
            <BubbleContent>已在输入框加入组字检查。</BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
      <Checkpoint label="修复已保存" onRestore={() => setRestored(true)} />
      {restored ? (
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground" role="status">
            已恢复到检查点。
          </p>
          <Button variant="ghost" size="sm" onClick={() => setRestored(false)}>
            重置示例
          </Button>
        </div>
      ) : (
        <Message align="end">
          <MessageContent>
            <Bubble align="end" variant="muted">
              <BubbleContent>再把测试说明更新一下。</BubbleContent>
            </Bubble>
          </MessageContent>
        </Message>
      )}
    </PreviewCard>
  )
}
