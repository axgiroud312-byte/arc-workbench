import { Bubble, BubbleContent } from "../../ui/bubble"
import { Message, MessageContent, MessageFooter } from "../../ui/message"
import { CopyAction, FeedbackActions } from "../ai-conversation/demo-helpers"
import { PreviewCard } from "../coding-agent/preview-card"
import { BrandMark } from "../shared"

export function MessageDemo() {
  const answer = "先检查键盘事件的 isComposing 状态，组字期间跳过发送逻辑。"
  return (
    <PreviewCard title="对话消息">
      <Message align="end">
        <MessageContent>
          <Bubble align="end" variant="muted">
            <BubbleContent>怎样避免选字时误发消息？</BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
      <Message align="start">
        <MessageContent>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <BrandMark brand="codex" />
            Codex
          </div>
          <Bubble variant="ghost">
            <BubbleContent>
              <p className="leading-relaxed">{answer}</p>
            </BubbleContent>
          </Bubble>
          <MessageFooter>
            <CopyAction value={answer} />
            <FeedbackActions />
          </MessageFooter>
        </MessageContent>
      </Message>
    </PreviewCard>
  )
}
