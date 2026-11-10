import { useState } from "react"
import {
  Check,
  FileText,
  PanelRightClose,
  PanelRightOpen,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react"
import { Button } from "../../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Badge } from "../../ui/badge"
import { Message, MessageContent } from "../../ui/message"
import { Bubble, BubbleContent } from "../../ui/bubble"
import { BrandMark } from "../shared"
import { ComposerInput } from "./composer-input"
import { getDemoModel } from "./model-picker"
import { useTextStream } from "./demo-helpers"
import { cn } from "../../../lib/utils"

const initialParagraphs = [
  "我们正在为小团队搭建一个更好用的工作空间。现在，重要决策分散在各种工具、对话和文档里，有时查找背景信息比完成工作本身还要耗时。",
  "Forma 把项目、文档和讨论集中到一个地方。我们希望减少协作中的额外负担，让团队少花时间管理工具，多花时间完成真正重要的工作。",
  "我们将先邀请十个团队参加小范围测试，根据他们的反馈准备首次公开发布。当前优先保证速度和可靠性，再逐步增加功能。",
]

export function AiSidePanel({
  onApply,
}: { onApply?: (paragraph: number, text: string) => void } = {}) {
  const [paragraphs, setParagraphs] = useState(initialParagraphs)
  const [open, setOpen] = useState(true)
  const [prompt, setPrompt] = useState("")
  const [model, setModel] = useState("sonnet")
  const [selection, setSelection] = useState<{
    text: string
    index: number
  } | null>(null)
  const [change, setChange] = useState<{
    index: number
    before: string
    after: string
  } | null>(null)
  const [undo, setUndo] = useState<{ index: number; text: string } | null>(null)
  const [applied, setApplied] = useState<number | null>(null)
  const stream = useTextStream()
  function ask(value: string) {
    setPrompt("")
    setApplied(null)
    if (/summari|what|explain|总结|概括|摘要|解释|什么/i.test(value)) {
      setChange(null)
      stream.start(
        "文档介绍了 Forma，一个面向小团队的共享工作空间。它把分散的信息放在一起，计划先邀请十个团队测试，再公开发布。目前最重视的是速度和可靠性。"
      )
    } else {
      const index = selection?.index ?? 1
      const after =
        index === 0
          ? "小团队需要随时找到工作所需的信息。Forma 把决策、讨论和文档放在一起，让查找资料不再打断工作。"
          : index === 1
            ? "Forma 把项目、文档和讨论放在一起。少花时间管理工具，多花时间完成重要的工作。"
            : "我们先邀请十个团队测试，根据反馈准备首次发布，优先保证速度和可靠性。"
      setChange({ index, before: paragraphs[index], after })
      stream.start(
        "下面是保留原意的精简版本，重点更加清楚。请先检查改动，再决定是否应用到文档。"
      )
    }
  }
  const apply = () => {
    if (!change) return
    setUndo({ index: change.index, text: paragraphs[change.index] })
    setParagraphs(
      paragraphs.map((text, index) =>
        index === change.index ? change.after : text
      )
    )
    setApplied(change.index)
    onApply?.(change.index, change.after)
    setChange(null)
    setSelection(null)
  }
  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="border-b pb-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-muted-foreground" />
            <CardTitle>产品简介</CardTitle>
            <Badge variant="secondary">草稿</Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setOpen(!open)}>
            {open ? (
              <PanelRightClose data-icon="inline-start" />
            ) : (
              <PanelRightOpen data-icon="inline-start" />
            )}
            {open ? "收起助手" : "展开助手"}
          </Button>
        </div>
      </CardHeader>
      <CardContent
        className={cn("grid gap-0 p-0", open && "lg:grid-cols-[1.1fr_1fr]")}
      >
        <article className="flex flex-col gap-6 px-6 py-8 sm:px-8">
          <div className="flex flex-col gap-2">
            <p className="text-xs text-muted-foreground">Forma · 产品规划</p>
            <h3 className="text-2xl font-medium tracking-tight">
              让工作更从容。
            </h3>
          </div>
          {paragraphs.map((paragraph, index) => (
            <div key={index} className="flex flex-col gap-2">
              <p
                className={cn(
                  "rounded-md text-sm leading-7 transition-colors",
                  applied === index && "bg-accent"
                )}
                onMouseUp={() => {
                  const text = window.getSelection()?.toString().trim()
                  if (text) {
                    setSelection({ text, index })
                    setOpen(true)
                  }
                }}
              >
                {paragraph}
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="w-fit"
                onClick={() => {
                  setSelection({ text: paragraph, index })
                  setOpen(true)
                  setPrompt("把这一段写得更简洁")
                }}
              >
                <Sparkles data-icon="inline-start" />
                询问这一段
              </Button>
            </div>
          ))}
          <p className="pt-4 text-xs text-muted-foreground">
            刚刚编辑 · 修改仅保存在当前演示中
          </p>
        </article>
        {open && (
          <aside className="flex min-w-0 flex-col gap-5 border-t bg-muted/20 p-5 lg:border-t-0 lg:border-l">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <BrandMark brand={getDemoModel(model).brand} />
                <span className="text-sm font-medium">
                  {getDemoModel(model).name}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="关闭助手面板"
                onClick={() => setOpen(false)}
              >
                <X />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">
                <FileText data-icon="inline-start" />
                当前页面
              </Badge>
              {selection && (
                <Badge variant="secondary">
                  <span className="max-w-40 truncate">{selection.text}</span>
                  <button
                    type="button"
                    aria-label="移除选中的上下文"
                    onClick={() => setSelection(null)}
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              )}
            </div>
            {stream.text ? (
              <Message>
                <MessageContent>
                  <Bubble variant="ghost">
                    <BubbleContent>
                      <p
                        className="text-sm leading-7 whitespace-pre-line"
                        aria-busy={stream.running}
                      >
                        {stream.text}
                      </p>
                    </BubbleContent>
                  </Bubble>
                </MessageContent>
              </Message>
            ) : (
              <div className="flex flex-col gap-3 py-6">
                <h4 className="font-medium">一起完善这份文档。</h4>
                <p className="text-sm leading-6 text-muted-foreground">
                  可以询问整份文档，也可以选中一段文字一起修改。
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => ask("总结当前页面")}
                  >
                    总结当前页面
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => ask("精简文字")}
                  >
                    精简文字
                  </Button>
                </div>
              </div>
            )}
            {change && !stream.running && (
              <div className="flex flex-col gap-3 rounded-lg border bg-background p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <FileText className="size-3.5" />
                  建议修改 · 第 {change.index + 1} 段
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  <del>{change.before}</del>
                </p>
                <p className="text-sm leading-6">{change.after}</p>
                <div className="flex gap-2">
                  <Button size="sm" onClick={apply}>
                    <Check data-icon="inline-start" />
                    应用修改
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setChange(null)}
                  >
                    放弃修改
                  </Button>
                </div>
              </div>
            )}
            {undo && (
              <div
                role="status"
                className="flex items-center justify-between gap-2 text-sm"
              >
                <span className="flex items-center gap-2">
                  <Check className="size-4" />
                  已应用到文档
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setParagraphs(
                      paragraphs.map((text, index) =>
                        index === undo.index ? undo.text : text
                      )
                    )
                    setUndo(null)
                    setApplied(null)
                  }}
                >
                  <RotateCcw data-icon="inline-start" />
                  撤销
                </Button>
              </div>
            )}
            <div className="mt-auto pt-6">
              <ComposerInput
                value={prompt}
                onChange={setPrompt}
                onSend={({ text }) => ask(text)}
                running={stream.running}
                onStop={stream.stop}
                model={model}
                onModelChange={setModel}
                placeholder="询问当前页面…"
                compact
              />
            </div>
          </aside>
        )}
      </CardContent>
    </Card>
  )
}
