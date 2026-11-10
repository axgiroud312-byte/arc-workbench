import { useState } from "react"
import { FileDiff, ShieldCheck, ShieldQuestion, ShieldX } from "lucide-react"
import { Button } from "../../ui/button"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemMedia,
  ItemTitle,
} from "../../ui/item"
import { PreviewCard } from "./preview-card"

export type ApprovalStatus = "pending" | "approved" | "denied" | "cancelled"
export type ApprovalRequest = {
  title: string
  detail: string
  status: ApprovalStatus
}

const labels: Record<Exclude<ApprovalStatus, "pending">, string> = {
  approved: "已批准",
  denied: "已拒绝",
  cancelled: "已取消",
}

export function Confirmation({
  request,
  source,
  onDecision,
  onReview,
}: {
  request: ApprovalRequest
  source?: string
  onDecision?: (approved: boolean) => void
  onReview?: () => void
}) {
  const pending = request.status === "pending"
  const Icon = pending
    ? ShieldQuestion
    : request.status === "approved"
      ? ShieldCheck
      : ShieldX

  return (
    <Item
      size="sm"
      variant="outline"
      className="w-full bg-muted/25"
      aria-label={request.title}
    >
      <ItemMedia
        variant="icon"
        className={pending ? "text-warning" : undefined}
      >
        <Icon />
      </ItemMedia>
      <ItemContent className="min-w-0">
        <ItemTitle>
          {request.status === "pending"
            ? request.title
            : labels[request.status]}
        </ItemTitle>
        <ItemDescription>{request.detail}</ItemDescription>
        {source && (
          <span className="text-xs text-muted-foreground">{source}</span>
        )}
      </ItemContent>
      {pending && (onDecision || onReview) && (
        <ItemFooter className="flex-wrap">
          {onReview && (
            <Button variant="ghost" size="sm" onClick={onReview}>
              <FileDiff data-icon="inline-start" />
              查看拟改差异
            </Button>
          )}
          {onDecision && (
            <ItemActions className="ml-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDecision(false)}
              >
                拒绝
              </Button>
              <Button size="sm" onClick={() => onDecision(true)}>
                批准
              </Button>
            </ItemActions>
          )}
        </ItemFooter>
      )}
    </Item>
  )
}

export function ConfirmationDemo() {
  const [status, setStatus] = useState<ApprovalStatus>("pending")
  return (
    <PreviewCard title="工具审批">
      <Confirmation
        request={{
          title: "允许修改示例文件？",
          detail: "更新输入框和对应的回车测试。",
          status,
        }}
        onDecision={(approved) => setStatus(approved ? "approved" : "denied")}
      />
      {status !== "pending" && (
        <Button
          size="sm"
          variant="ghost"
          className="self-start"
          onClick={() => setStatus("pending")}
        >
          重新发起审批
        </Button>
      )}
    </PreviewCard>
  )
}
