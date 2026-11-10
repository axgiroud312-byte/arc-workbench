import { useState } from "react"
import {
  ArrowRight,
  CircleCheck,
  Play,
  RotateCcw,
  Square,
  Trophy,
} from "lucide-react"
import { Button } from "../../ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../ui/card"
import { Input } from "../../ui/input"
import { Badge } from "../../ui/badge"
import { Switch } from "../../ui/switch"
import { Field, FieldLabel } from "../../ui/field"
import { BrandMark } from "../shared"
import { useTextStream } from "./demo-helpers"

const voteOptions = [
  { value: "Model A", label: "A 更好" },
  { value: "Tie", label: "差不多" },
  { value: "Model B", label: "B 更好" },
  { value: "Both bad", label: "都不好" },
]

export function ModelArena({
  onVote,
}: { onVote?: (vote: string) => void } = {}) {
  const [prompt, setPrompt] = useState("用一个简单的比喻解释数据库索引。")
  const [blind, setBlind] = useState(true)
  const [voted, setVoted] = useState<string | null>(null)
  const [round, setRound] = useState(1)
  const a = useTextStream()
  const b = useTextStream()
  const busy = a.running || b.running
  const hasAnswers = !!a.text && !!b.text
  function run() {
    if (!prompt.trim()) return
    setVoted(null)
    if (/launch|email|发布|邮件/i.test(prompt)) {
      a.start(
        "主题：认识你们的新工作空间\n\n小林，你好：\n\n今天向你介绍 Forma：把项目、文档和讨论放在一起的团队工作空间。\n\n和同事一起找到需要的信息，把时间花在重要的工作上。\n\n欢迎这周带团队体验 Forma，也期待听到你们的建议。\n\nForma 团队"
      )
      b.start(
        "主题：少切换工具，多专注工作\n\n让下一个项目从容开始。\n\nForma 把任务、文档和讨论放在一起，减少信息在工具间流失。创建工作空间、邀请同事，就从你手头的项目开始。\n\n开始使用 Forma →\n\n为有想法的小团队而设计。"
      )
      return
    }
    if (/REST|GraphQL/i.test(prompt)) {
      a.start(
        "REST 通过不同接口提供资源。GraphQL 定义数据结构，让客户端自行选择需要的字段。\n\n如果产品适合简单的 HTTP 约定、常规缓存和少量接口，可以选择 REST。\n\n如果不同客户端需要不同组合的数据，而且团队能够维护类型定义与数据解析逻辑，可以考虑 GraphQL。\n\n先看最常见的请求，用更容易理解和维护的方案。"
      )
      b.start(
        "REST 和 GraphQL 都用来让客户端访问应用数据。\n\nREST\n• 使用熟悉的资源地址和 HTTP 方法。\n• 基础设施与缓存比较直接。\n\nGraphQL\n• 通过统一的数据结构支持灵活查询。\n• 客户端决定响应包含哪些字段。\n\n没有一种方案在所有场景下都更好。先梳理真实请求，再比较维护成本。"
      )
      return
    }
    if (!/database|index|数据库|索引/i.test(prompt)) {
      a.start(
        `关于“${prompt}”，可以先明确结果，再倒推步骤。\n\n定义怎样才算完成，找出最小的有效步骤。验证结果后再扩大范围，让其他人也能理解和重复这个过程。\n\n这是模型 A 的本地示例回答。`
      )
      b.start(
        `处理“${prompt}”时，可以先写下三件事：\n\n1. 你需要的结果。\n2. 必须遵守的限制。\n3. 今天就能验证的一个小例子。\n\n先通过这个例子积累经验，再决定是否扩大实施范围。\n\n这是模型 B 的本地示例回答。`
      )
      return
    }
    a.start(
      `可以把数据库想成图书馆，把索引想成检索目录。\n\n没有索引时，找一本书需要逐个书架查看。有索引时，查到书名就能直接找到位置。\n\n对于“${prompt}”，也有同样的取舍：目录需要空间，馆藏变化后还要更新。\n\n优先给经常查询或排序的字段添加索引。不要给所有字段都加索引，每个索引都会增加写入时的工作量。`
    )
    b.start(
      `数据库索引就像菜谱后面的检索表。\n\n想找“意大利面”，可以逐页翻阅，也可以查检索表，直接翻到第 42、78 或 113 页。\n\n对于你问的“${prompt}”，这意味着：\n\n• 读取更快：直接定位匹配记录。\n• 占用额外空间：保存检索结构。\n• 写入更慢：还需要同步更新索引。\n\n如果经常按同一个字段查询大表，可以考虑添加索引。`
    )
  }
  const castVote = (value: string) => {
    setVoted(value)
    onVote?.(value)
  }
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Trophy className="size-4 text-muted-foreground" />
            <CardTitle>模型对比</CardTitle>
            <Badge variant="outline">第 {round} 轮</Badge>
          </div>
          <Field orientation="horizontal" className="w-auto">
            <FieldLabel htmlFor="arena-blind">隐藏模型</FieldLabel>
            <Switch
              id="arena-blind"
              checked={blind}
              onCheckedChange={setBlind}
            />
          </Field>
        </div>
        <CardDescription>同一道问题，对比两个模型的回答。</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            if (!busy) run()
          }}
        >
          <Input
            aria-label="对比问题"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="输入要向两个模型提出的问题…"
          />
          <Button
            disabled={!prompt.trim()}
            type={busy ? "button" : "submit"}
            onClick={
              busy
                ? () => {
                    a.stop()
                    b.stop()
                  }
                : undefined
            }
          >
            {busy ? (
              <Square data-icon="inline-start" />
            ) : (
              <Play data-icon="inline-start" />
            )}
            {busy ? "停止" : "开始"}
          </Button>
        </form>
        <div className="flex flex-wrap gap-2">
          {["解释数据库索引", "写一封产品发布邮件", "对比 REST 和 GraphQL"].map(
            (value) => (
              <Button
                key={value}
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={() => setPrompt(value)}
              >
                {value}
              </Button>
            )
          )}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            {
              label: "A",
              stream: a,
              model: "Claude Sonnet 5.5",
              brand: "claude" as const,
              speed: "87",
            },
            {
              label: "B",
              stream: b,
              model: "GPT-6.1 Sol",
              brand: "openai" as const,
              speed: "94",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="flex min-h-64 flex-col overflow-hidden rounded-lg border"
            >
              <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
                <div className="flex items-center gap-2">
                  {!blind || voted ? (
                    <BrandMark brand={item.brand} />
                  ) : (
                    <span className="flex size-6 items-center justify-center rounded-md bg-muted text-xs">
                      {item.label}
                    </span>
                  )}
                  <span className="text-sm font-medium">
                    {!blind || voted ? item.model : `模型 ${item.label}`}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {item.stream.running
                    ? "正在回答…"
                    : item.stream.stopped
                      ? "已停止"
                      : item.stream.text
                        ? "已完成"
                        : "待开始"}
                </span>
              </div>
              <div
                className="min-h-56 flex-1 p-4 text-sm leading-7 whitespace-pre-line"
                aria-busy={item.stream.running}
              >
                {item.stream.text || (
                  <span className="text-muted-foreground">
                    回答将在这里显示。
                  </span>
                )}
              </div>
              {item.stream.text && (
                <div className="flex justify-between gap-2 border-t px-4 py-2.5 text-xs text-muted-foreground">
                  <span>首字延迟 0.6 秒</span>
                  <span>{item.speed} 词元/秒</span>
                  <span>$0.002</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap items-center justify-between gap-3">
        {voted ? (
          <>
            <span role="status" className="flex items-center gap-2 text-sm">
              <CircleCheck className="size-4 text-success" />
              {voted === "Tie"
                ? "本轮平局。"
                : voted === "Both bad"
                  ? "两个回答都需要改进。"
                  : `${voted === "Model A" ? "模型 A" : "模型 B"} 赢得本轮。`}{" "}
              已显示模型名称。
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                a.reset()
                b.reset()
                setVoted(null)
                setRound(round + 1)
              }}
            >
              下一轮
              <ArrowRight data-icon="inline-end" />
            </Button>
          </>
        ) : (
          <>
            <p className="text-xs text-muted-foreground">
              示例回答 · 两个回答结束后即可投票
            </p>
            <div className="flex flex-wrap gap-2">
              {voteOptions.map((option) => (
                <Button
                  key={option.value}
                  variant="outline"
                  size="sm"
                  disabled={!hasAnswers || busy}
                  onClick={() => castVote(option.value)}
                >
                  {option.label}
                </Button>
              ))}
              {hasAnswers && (
                <Button
                  aria-label="重置对比"
                  variant="ghost"
                  size="icon-sm"
                  disabled={busy}
                  onClick={() => {
                    a.reset()
                    b.reset()
                  }}
                >
                  <RotateCcw />
                </Button>
              )}
            </div>
          </>
        )}
      </CardFooter>
    </Card>
  )
}
