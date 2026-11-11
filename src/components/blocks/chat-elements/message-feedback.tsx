"use client"

import { useId, useState } from "react"
import { ThumbsDownIcon, ThumbsUpIcon } from "lucide-react"

import { Button } from "../../ui/button"
import { Card, CardContent } from "../../ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog"
import {
  Message,
  MessageContent,
  MessageFooter,
  MessageHeader,
} from "../../ui/message"
import { RadioGroup, RadioGroupItem } from "../../ui/radio-group"
import { Textarea } from "../../ui/textarea"

export type MessageFeedbackValue = {
  rating: "helpful" | "unhelpful"
  reason?: string
  comment?: string
}

const reasons = [
  { id: "incorrect", label: "内容有误" },
  { id: "unclear", label: "说明不够清楚" },
  { id: "irrelevant", label: "没有回答我的问题" },
  { id: "other", label: "其他原因" },
]

export function MessageFeedback({
  value,
  onChange,
}: {
  value?: MessageFeedbackValue
  onChange: (feedback: MessageFeedbackValue | undefined) => void
}) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [comment, setComment] = useState("")
  const field = useId()

  return (
    <div
      className="flex flex-wrap items-center gap-1"
      role="group"
      aria-label="回复反馈"
    >
      <Button
        variant={value?.rating === "helpful" ? "secondary" : "ghost"}
        size="icon-sm"
        aria-label="有帮助"
        aria-pressed={value?.rating === "helpful"}
        onClick={() =>
          onChange(
            value?.rating === "helpful" ? undefined : { rating: "helpful" }
          )
        }
      >
        <ThumbsUpIcon />
      </Button>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (next) {
            setReason(value?.reason ?? "")
            setComment(value?.comment ?? "")
          }
          setOpen(next)
        }}
      >
        <DialogTrigger
          render={
            <Button
              variant={value?.rating === "unhelpful" ? "secondary" : "ghost"}
              size="icon-sm"
              aria-label="没帮助"
              aria-pressed={value?.rating === "unhelpful"}
            />
          }
        >
          <ThumbsDownIcon />
        </DialogTrigger>
        <DialogContent>
          <DialogHeader className="pr-8">
            <DialogTitle>这条回复哪里需要改进？</DialogTitle>
            <DialogDescription>
              选择一个原因，也可以补充具体问题。
            </DialogDescription>
          </DialogHeader>
          <RadioGroup
            value={reason}
            onValueChange={(next) => setReason(String(next))}
            aria-label="反馈原因"
            className="gap-2"
          >
            {reasons.map(({ id, label }) => (
              <label
                key={id}
                className="flex cursor-pointer items-center gap-2 rounded-md border p-2 has-data-checked:border-foreground/50"
              >
                <RadioGroupItem value={id} />
                {label}
              </label>
            ))}
          </RadioGroup>
          <div className="grid gap-1.5">
            <label className="text-xs font-medium" htmlFor={field}>
              补充说明（可选）
            </label>
            <Textarea
              id={field}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
            />
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              取消
            </DialogClose>
            <Button
              disabled={!reason}
              onClick={() => {
                onChange({
                  rating: "unhelpful",
                  reason,
                  comment: comment.trim() || undefined,
                })
                setOpen(false)
              }}
            >
              提交反馈
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <span aria-live="polite" className="pl-1 text-xs text-muted-foreground">
        {value?.rating === "helpful"
          ? "已标记有帮助"
          : value?.rating === "unhelpful"
            ? "反馈已保存"
            : ""}
      </span>
    </div>
  )
}

export function MessageFeedbackDemo() {
  const [feedback, setFeedback] = useState<MessageFeedbackValue>()
  return (
    <Card className="mx-auto w-full max-w-lg">
      <CardContent>
        <Message>
          <MessageContent>
            <MessageHeader>Agent</MessageHeader>
            <p className="px-3 leading-6">
              改动已通过组件测试。我也检查了失败后再次提交的流程，按钮会恢复可用。
            </p>
            <MessageFooter>
              <MessageFeedback value={feedback} onChange={setFeedback} />
            </MessageFooter>
          </MessageContent>
        </Message>
      </CardContent>
    </Card>
  )
}
