import { useState } from "react"
import {
  ArrowUpRight,
  Brain,
  Code2,
  PenLine,
  RotateCcw,
  Search,
} from "lucide-react"
import { Button } from "../../ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../ui/card"
import { Message, MessageContent, MessageFooter } from "../../ui/message"
import { Bubble, BubbleContent } from "../../ui/bubble"
import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "../../ui/trace"
import { BrandMark } from "../shared"
import { ComposerInput, type ComposerSubmission } from "./composer-input"
import { getDemoModel } from "./model-picker"
import {
  CopyAction,
  FeedbackActions,
  makeDemoReply,
  useTextStream,
} from "./demo-helpers"

export function AiComposer({
  onSend,
}: { onSend?: (submission: ComposerSubmission) => void } = {}) {
  const [prompt, setPrompt] = useState("")
  const [model, setModel] = useState("sonnet")
  const [submitted, setSubmitted] = useState<ComposerSubmission | null>(null)
  const stream = useTextStream()
  const send = (submission: ComposerSubmission) => {
    setSubmitted(submission)
    setPrompt("")
    onSend?.(submission)
    stream.start(makeDemoReply(submission.text))
  }
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BrandMark brand={getDemoModel(model).brand} />
            <CardTitle>AI 助手</CardTitle>
          </div>
          {submitted && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                stream.reset()
                setSubmitted(null)
                setPrompt("")
              }}
            >
              <RotateCcw data-icon="inline-start" />
              重新开始
            </Button>
          )}
        </div>
        <CardDescription>本地交互演示</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-7">
        {!submitted ? (
          <div className="flex min-h-56 flex-col items-center justify-center gap-7 py-8">
            <BrandMark brand={getDemoModel(model).brand} className="size-9" />
            <h3 className="text-center text-2xl font-medium tracking-tight">
              今天想一起做些什么？
            </h3>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                {
                  text: "写点内容",
                  value: "写一封语气友好的产品发布邮件",
                  Icon: PenLine,
                },
                {
                  text: "实现想法",
                  value: "解释如何搭建一个组件库",
                  Icon: Code2,
                },
                {
                  text: "了解一个话题",
                  value: "总结设计系统能带来哪些好处",
                  Icon: Search,
                },
              ].map(({ text, value, Icon }) => (
                <Button
                  key={text}
                  variant="outline"
                  onClick={() => setPrompt(value)}
                >
                  <Icon data-icon="inline-start" />
                  {text}
                  <ArrowUpRight data-icon="inline-end" />
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <Message align="end">
              <MessageContent>
                <Bubble variant="muted" align="end">
                  <BubbleContent>{submitted.text}</BubbleContent>
                </Bubble>
                {submitted.files.length > 0 && (
                  <MessageFooter>
                    {submitted.files.length} 个本地附件
                  </MessageFooter>
                )}
              </MessageContent>
            </Message>
            <Message>
              <MessageContent>
                <div className="flex items-center gap-2">
                  <BrandMark brand={getDemoModel(submitted.model).brand} />
                  <span className="text-sm font-medium">
                    {getDemoModel(submitted.model).name}
                  </span>
                </div>
                <Trace>
                  <TraceCollapsible>
                    <TraceCollapsibleTrigger>
                      <TraceLine
                        status={stream.running ? "running" : undefined}
                      >
                        <TraceIcon>
                          <Brain />
                        </TraceIcon>
                        <TraceTitle>
                          {stream.running
                            ? "正在生成示例回答"
                            : stream.stopped
                              ? "已停止回复"
                              : "已完成思考"}
                        </TraceTitle>
                      </TraceLine>
                    </TraceCollapsibleTrigger>
                    <TraceCollapsibleContent>
                      <p className="text-sm text-muted-foreground">
                        演示会根据你的输入生成本地示例回答。{" "}
                        {submitted.thinking ? "已选择深入思考。" : ""}
                        {submitted.webSearch
                          ? "已选择联网搜索，预览中不会实际访问网络。"
                          : "不会向真实模型发送数据。"}
                      </p>
                    </TraceCollapsibleContent>
                  </TraceCollapsible>
                </Trace>
                <Bubble variant="ghost">
                  <BubbleContent>
                    <p
                      className="leading-7 whitespace-pre-line"
                      aria-busy={stream.running}
                    >
                      {stream.text}
                    </p>
                  </BubbleContent>
                </Bubble>
                <MessageFooter>
                  <CopyAction value={stream.text} />
                  <FeedbackActions />
                </MessageFooter>
              </MessageContent>
            </Message>
          </div>
        )}
        <div className="flex flex-col gap-2">
          <ComposerInput
            value={prompt}
            onChange={setPrompt}
            onSend={send}
            running={stream.running}
            onStop={stream.stop}
            model={model}
            onModelChange={setModel}
          />
          <p className="text-center text-xs text-muted-foreground">
            输入 / 选择指令 · 输入 @ 添加上下文 · Shift + Enter 换行
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
