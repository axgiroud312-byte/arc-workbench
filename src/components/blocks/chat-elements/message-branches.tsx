"use client"

import { useId, useState } from "react"
import { ChevronLeftIcon, ChevronRightIcon, PencilIcon } from "lucide-react"

import { Button } from "../../ui/button"
import { Card, CardContent } from "../../ui/card"
import {
  Message,
  MessageContent,
  MessageFooter,
  MessageHeader,
} from "../../ui/message"
import { Textarea } from "../../ui/textarea"

export type MessageBranch = {
  id: string
  prompt: string
  answer?: string
}

export function MessageBranches({
  branches,
  value,
  onValueChange,
  onEditPrompt,
}: {
  branches: readonly MessageBranch[]
  value: string
  onValueChange: (id: string) => void
  onEditPrompt?: (branchId: string, prompt: string) => void
}) {
  const index = Math.max(
    0,
    branches.findIndex((branch) => branch.id === value)
  )
  const branch = branches[index]
  if (!branch) return null

  return (
    <div className="grid min-w-0 gap-4">
      <BranchMessage
        key={branch.id}
        branch={branch}
        onEditPrompt={onEditPrompt}
      />
      <Message>
        <MessageContent>
          <MessageHeader>Agent</MessageHeader>
          <p
            className="px-3 text-sm leading-6 whitespace-pre-wrap"
            aria-live="polite"
          >
            {branch.answer ?? "正在等待回复…"}
          </p>
          {branches.length > 1 && (
            <MessageFooter>
              <div
                className="inline-flex items-center gap-1 rounded-md border p-0.5"
                aria-label="对话分支"
                role="group"
              >
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label="上一个分支"
                  disabled={index === 0}
                  onClick={() => onValueChange(branches[index - 1].id)}
                >
                  <ChevronLeftIcon />
                </Button>
                <span aria-live="polite" className="px-1 text-xs tabular-nums">
                  {index + 1} / {branches.length}
                </span>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label="下一个分支"
                  disabled={index === branches.length - 1}
                  onClick={() => onValueChange(branches[index + 1].id)}
                >
                  <ChevronRightIcon />
                </Button>
              </div>
            </MessageFooter>
          )}
        </MessageContent>
      </Message>
    </div>
  )
}

function BranchMessage({
  branch,
  onEditPrompt,
}: {
  branch: MessageBranch
  onEditPrompt?: (id: string, prompt: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState("")
  const field = useId()

  return (
    <Message align="end">
      <MessageContent className="items-end">
        {editing ? (
          <form
            className="grid w-full gap-2 rounded-lg border bg-muted/50 p-3"
            onSubmit={(event) => {
              event.preventDefault()
              const prompt = draft.trim()
              if (!prompt || prompt === branch.prompt) return
              onEditPrompt?.(branch.id, prompt)
              setEditing(false)
            }}
          >
            <label className="text-xs font-medium" htmlFor={field}>
              编辑消息
            </label>
            <Textarea
              id={field}
              autoFocus
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setEditing(false)}
              >
                取消
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={!draft.trim() || draft.trim() === branch.prompt}
              >
                创建分支
              </Button>
            </div>
          </form>
        ) : (
          <>
            <p className="max-w-[88%] rounded-2xl rounded-br-sm bg-muted px-4 py-2.5 leading-6 whitespace-pre-wrap">
              {branch.prompt}
            </p>
            {onEditPrompt && (
              <Button
                variant="ghost"
                size="xs"
                className="text-muted-foreground"
                onClick={() => {
                  setDraft(branch.prompt)
                  setEditing(true)
                }}
              >
                <PencilIcon />
                编辑消息
              </Button>
            )}
          </>
        )}
      </MessageContent>
    </Message>
  )
}

const initialBranches: MessageBranch[] = [
  {
    id: "test",
    prompt: "帮我找出表单提交失败的原因。",
    answer:
      "提交按钮在加载期间会被禁用。当前的异常分支没有恢复按钮状态，重试时就无法再次提交。",
  },
  {
    id: "review",
    prompt: "给我一份表单提交的审查清单。",
    answer:
      "先检查表单校验，再验证成功、超时和重试三条路径。最后确认键盘回车和点击按钮的行为一致。",
  },
]

export function MessageBranchesDemo() {
  const [branches, setBranches] = useState(initialBranches)
  const [selected, setSelected] = useState(initialBranches[0].id)
  return (
    <Card className="mx-auto w-full max-w-lg">
      <CardContent>
        <MessageBranches
          branches={branches}
          value={selected}
          onValueChange={setSelected}
          onEditPrompt={(_, prompt) => {
            const id = crypto.randomUUID()
            setBranches((current) => [
              ...current,
              {
                id,
                prompt,
                answer:
                  "已将编辑后的消息保存为新分支。这条回复是本地示例，切回前一个分支可以查看原回复。",
              },
            ])
            setSelected(id)
          }}
        />
      </CardContent>
    </Card>
  )
}
