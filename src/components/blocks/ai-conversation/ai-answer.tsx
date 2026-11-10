import { useState } from "react"
import {
  ArrowRight,
  Brain,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Globe,
  Plus,
  RotateCcw,
  Share2,
} from "lucide-react"
import { Button } from "../../ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../ui/card"
import { Badge } from "../../ui/badge"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../../ui/hover-card"
import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "../../ui/trace"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
} from "../../ui/dropdown-menu"
import { BrandMark } from "../shared"
import { ComposerInput } from "./composer-input"
import { getDemoModel } from "./model-picker"
import {
  CopyAction,
  FeedbackActions,
  makeDemoReply,
  useTextStream,
} from "./demo-helpers"

const sources = [
  {
    title: "用 React 思考界面",
    domain: "react.dev",
    url: "https://react.dev/learn/thinking-in-react",
    note: "把用户界面拆分为层级清楚的组件。",
  },
  {
    title: "为组件设置主题",
    domain: "ui.shadcn.com",
    url: "https://ui.shadcn.com/docs/theming",
    note: "通过共享颜色、间距等设计变量保持界面一致。",
  },
  {
    title: "无障碍交互模式",
    domain: "w3.org",
    url: "https://www.w3.org/WAI/ARIA/apg/",
    note: "提供符合预期的键盘操作和清楚的控件名称。",
  },
]
const initialQuestion = "怎样让设计系统支持不断扩大的团队？"
const initialAnswer =
  "好的设计系统能让团队更容易做出一致、好用的界面。除了组件，共同遵守的设计约定也很重要。\n\n先建立基础约定\n\n统一颜色用途、字号和间距，并用名称说明它们的作用。这样，同一个按钮在浅色和深色主题中都能保持一致。\n\n围绕真实任务设计\n\n把小而可复用的元素组合成产品实际需要的界面。每个组件都应职责明确、默认配置合理，并能容纳真实内容。\n\n把易用性做进组件\n\n键盘操作、清楚的焦点、准确的标签和及时的反馈都应由组件提供。团队使用组件时，就能自然得到这些能力。\n\n像维护产品一样维护它\n\n明确负责人，持续更新示例，让团队可以方便地提出改进。从小范围开始，根据真实使用情况逐步完善。"

function Citation({ index }: { index: number }) {
  const source = sources[index]
  return (
    <HoverCard>
      <HoverCardTrigger
        render={
          <Button
            variant="secondary"
            size="icon-xs"
            aria-label={`来源 ${index + 1}：${source.title}`}
          />
        }
      >
        {index + 1}
      </HoverCardTrigger>
      <HoverCardContent>
        <div className="flex flex-col gap-2">
          <span className="text-xs text-muted-foreground">{source.domain}</span>
          <p className="text-sm font-medium">{source.title}</p>
          <p className="text-sm text-muted-foreground">{source.note}</p>
          <a
            className="flex items-center gap-1 text-sm underline underline-offset-4"
            href={source.url}
            target="_blank"
            rel="noreferrer"
          >
            阅读来源
            <ExternalLink className="size-3.5" />
          </a>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}

type AnswerVersion = { text: string; model: string }
const answerHeadings = new Set([
  "先建立基础约定",
  "围绕真实任务设计",
  "把易用性做进组件",
  "像维护产品一样维护它",
])

export function AiAnswer() {
  const [question, setQuestion] = useState(initialQuestion)
  const [prompt, setPrompt] = useState("")
  const [versions, setVersions] = useState<AnswerVersion[]>([
    { text: initialAnswer, model: "sonnet" },
  ])
  const [model, setModel] = useState("sonnet")
  const [activeModel, setActiveModel] = useState("sonnet")
  const [version, setVersion] = useState(0)
  const [generating, setGenerating] = useState(false)
  const [shared, setShared] = useState(false)
  const stream = useTextStream()
  const text = generating ? stream.text : (versions[version]?.text ?? "")
  const answerModel = getDemoModel(
    generating ? activeModel : versions[version]?.model
  )
  function generate(mode: "again" | "concise" | "detailed") {
    if (generating && stream.text) {
      setVersions((previous) => [
        ...previous,
        { text: stream.text, model: activeModel },
      ])
      setVersion(versions.length)
    }
    setGenerating(true)
    setActiveModel(model)
    const output =
      mode === "concise"
        ? "要让设计系统支持更多团队，需要统一的基础约定、可复用组件和默认提供的无障碍能力。围绕真实产品需求建设，持续维护示例，并让团队能够方便地参与改进。"
        : mode === "detailed"
          ? initialAnswer +
            "\n\n可以先检查三个重要页面，找出重复出现的界面模式，只实现这些页面需要的组件。再看它们是否让下一个页面更容易完成。"
          : initialAnswer
    stream.start(output)
  }
  function followUp(value: string) {
    setQuestion(value)
    setPrompt("")
    setVersions([])
    setVersion(0)
    setActiveModel(model)
    setGenerating(true)
    stream.start(makeDemoReply(value))
  }
  function showVersion(next: number) {
    if (generating && !stream.running && stream.text) {
      setVersions([...versions, { text: stream.text, model: activeModel }])
      setGenerating(false)
      setVersion(next)
      return
    }
    setGenerating(false)
    setVersion(next)
  }
  return (
    <Card className="w-full">
      <CardHeader className="border-b pb-4">
        <div className="flex items-center justify-between gap-2">
          <CardTitle>AI 回答</CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="新建问答"
              onClick={() => {
                stream.reset()
                setGenerating(false)
                setQuestion(initialQuestion)
                setVersions([{ text: initialAnswer, model: "sonnet" }])
                setVersion(0)
                setPrompt("")
              }}
            >
              <Plus />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(`${question}\n\n${text}`)
                  setShared(true)
                } catch {
                  setShared(false)
                }
              }}
            >
              <Share2 data-icon="inline-start" />
              {shared ? "已复制" : "分享"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <h3 className="text-2xl font-medium tracking-tight">{question}</h3>
        <Trace>
          <TraceCollapsible>
            <TraceCollapsibleTrigger>
              <TraceLine status={stream.running ? "running" : undefined}>
                <TraceIcon>
                  <Brain />
                </TraceIcon>
                <TraceTitle>
                  {stream.running ? "正在生成回答" : "已思考 4 秒"}
                </TraceTitle>
              </TraceLine>
            </TraceCollapsibleTrigger>
            <TraceCollapsibleContent>
              <p className="text-sm text-muted-foreground">
                从基础约定、实际组件和持续维护三个方面组织回答。这是本地示例。
              </p>
            </TraceCollapsibleContent>
          </TraceCollapsible>
          <TraceCollapsible>
            <TraceCollapsibleTrigger>
              <TraceLine>
                <TraceIcon>
                  <Globe />
                </TraceIcon>
                <TraceTitle>3 个来源</TraceTitle>
              </TraceLine>
            </TraceCollapsibleTrigger>
            <TraceCollapsibleContent>
              <div className="grid gap-2 sm:grid-cols-3">
                {sources.map((source, index) => (
                  <a
                    key={source.url}
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-col gap-2 rounded-lg border p-3 transition-colors hover:bg-muted"
                  >
                    <span className="text-xs text-muted-foreground">
                      {source.domain} · {index + 1}
                    </span>
                    <span className="text-sm font-medium">{source.title}</span>
                    <ExternalLink className="size-3.5 text-muted-foreground" />
                  </a>
                ))}
              </div>
            </TraceCollapsibleContent>
          </TraceCollapsible>
        </Trace>
        <article className="flex flex-col gap-4" aria-busy={stream.running}>
          {text.split("\n\n").map((paragraph, index) =>
            answerHeadings.has(paragraph) ? (
              <h4 key={index} className="pt-2 font-medium">
                {paragraph}
              </h4>
            ) : (
              <p key={index} className="text-sm leading-7">
                {paragraph}
                {!generating && [2, 4, 6].includes(index) && (
                  <span className="ml-1 inline-flex align-middle">
                    <Citation index={[2, 4, 6].indexOf(index)} />
                  </span>
                )}
              </p>
            )
          )}
        </article>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1">
            <CopyAction value={text} />
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="重新生成回答"
                    disabled={stream.running}
                  />
                }
              >
                <RotateCcw />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => generate("again")}>
                    重新生成
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => generate("concise")}>
                    更简洁
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => generate("detailed")}>
                    更详细
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <FeedbackActions />
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="上一个回答版本"
              disabled={
                stream.running ||
                (generating ? versions.length === 0 : version === 0)
              }
              onClick={() =>
                showVersion(
                  generating ? versions.length - 1 : Math.max(0, version - 1)
                )
              }
            >
              <ChevronLeft />
            </Button>
            <span className="text-xs text-muted-foreground">
              {generating ? versions.length + 1 : version + 1} /{" "}
              {versions.length + (generating ? 1 : 0)}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="下一个回答版本"
              disabled={generating || version >= versions.length - 1}
              onClick={() => showVersion(version + 1)}
            >
              <ChevronRight />
            </Button>
          </div>
          <span className="flex items-center gap-2 text-xs text-muted-foreground">
            <BrandMark brand={answerModel.brand} />
            {answerModel.name}
            <Badge variant="outline">示例</Badge>
          </span>
        </div>
        <div className="flex flex-col gap-1">
          {[
            "小团队应该从哪里开始？",
            "应该先做哪些组件？",
            "怎样了解团队的使用情况？",
          ].map((value) => (
            <Button
              key={value}
              variant="ghost"
              className="justify-between"
              disabled={stream.running}
              onClick={() => followUp(value)}
            >
              {value}
              <ArrowRight data-icon="inline-end" />
            </Button>
          ))}
        </div>
      </CardContent>
      <CardFooter className="mx-auto w-full max-w-3xl">
        <ComposerInput
          value={prompt}
          onChange={setPrompt}
          onSend={({ text: value }) => followUp(value)}
          running={stream.running}
          onStop={stream.stop}
          model={model}
          onModelChange={setModel}
          placeholder="继续追问…"
          compact
        />
      </CardFooter>
    </Card>
  )
}
