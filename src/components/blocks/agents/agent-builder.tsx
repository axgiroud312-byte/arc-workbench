import { useRef, useState } from "react"
import {
  ArrowUp,
  Bot,
  FileText,
  Plus,
  RotateCcw,
  Upload,
  X,
} from "lucide-react"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Textarea } from "../../ui/textarea"
import { Field, FieldGroup, FieldLabel } from "../../ui/field"
import { Switch } from "../../ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../../ui/input-group"
import { Message, MessageContent, MessageHeader } from "../../ui/message"
import { Bubble, BubbleContent } from "../../ui/bubble"
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "../../ui/message-scroller"
import { BrandMark, StatusBadge } from "../shared"
import { AgentPanel, DemoNote, IntegrationMark, useTimers } from "./common"

const toolList = [
  { name: "Gmail", description: "读取会话并起草回复" },
  { name: "Slack", description: "向 #support-escalations 发送消息" },
  { name: "Linear", description: "创建和更新工单" },
  { name: "Notion", description: "搜索帮助中心" },
  {
    name: "Google Calendar",
    description: "预约销售团队通话",
  },
  { name: "Stripe", description: "查询客户和扣款记录" },
]
type Config = {
  name: string
  model: string
  instructions: string
  tools: string[]
  files: string[]
}
const initial: Config = {
  name: "账单助手",
  model: "Claude Sonnet 5.5",
  instructions:
    "你是客服团队的账单助手。用友好、简洁的语气回答发票、退款和套餐变更问题。说明金额前，先在 Stripe 中查询客户。超过 200 美元的退款需要人工审核：先起草回复，再发送到 #support-escalations。",
  tools: ["Gmail", "Slack", "Linear", "Notion", "Stripe"],
  files: ["退款政策 2026.pdf", "套餐与价格.md"],
}
const examples = [
  "客户说同一笔账单被扣了两次钱",
  "团队工作区的 CSV 导出失败了",
  "可以预约通话了解企业套餐吗？",
]

export function AgentBuilder() {
  const [config, setConfig] = useState<Config>(initial)
  const [published, setPublished] = useState<Config>(initial)
  const [version, setVersion] = useState(12)
  const [publishing, setPublishing] = useState(false)
  const [saved, setSaved] = useState(false)
  const [mode, setMode] = useState("configure")
  const [input, setInput] = useState("")
  const [thinking, setThinking] = useState(false)
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; text: string }[]
  >([])
  const picker = useRef<HTMLInputElement>(null)
  const later = useTimers()
  const dirty = JSON.stringify(config) !== JSON.stringify(published)
  const update = (patch: Partial<Config>) => {
    setConfig((c) => ({ ...c, ...patch }))
    setSaved(false)
  }
  const send = (value = input) => {
    if (!value.trim() || thinking) return
    setMessages((items) => [...items, { role: "user", text: value.trim() }])
    setInput("")
    setThinking(true)
    const lower = value.toLowerCase()
    const reply = /charge|refund|bill|扣款|扣了|退款|账单|发票/.test(lower)
      ? config.tools.includes("Stripe")
        ? "演示记录中，同一张发票有两笔扣款，其中一笔疑似重复。我可以准备退款申请和确认邮件草稿；超过 200 美元的退款会交给人工审核。"
        : "当前配置未启用 Stripe，无法查询扣款记录。启用 Stripe 后可以测试账单查询，也可以先请客户提供发票。"
      : /book|call|meeting|预约|通话|会议/.test(lower)
        ? config.tools.includes("Google Calendar")
          ? "演示日历中，周二 10:00 和周四 14:00 有空位。选定时间后，我可以起草会议邀请。"
          : "日历访问未启用。我可以起草一条消息，请销售团队安排通话。"
        : /broken|bug|error|失败|错误|故障|坏了/.test(lower)
          ? config.tools.includes("Linear")
            ? "已为 CSV 导出失败准备一条演示 Linear 工单，包含复现步骤和客户影响。暂不承诺修复日期。"
            : "工单创建未启用。我仍可以整理问题，交给客服同事处理。"
          : `我是${config.name}，可以帮助处理发票、退款和套餐变更。目前启用了 ${config.tools.length} 个工具。`
    later(() => {
      setMessages((items) => [...items, { role: "assistant", text: reply }])
      setThinking(false)
    }, 1000)
  }
  return (
    <AgentPanel
      title={
        <span className="flex items-center gap-2">
          <Bot className="size-5" />
          {config.name || "未命名智能体"}
        </span>
      }
      description={`Lumen 客服 · v${version}`}
      action={
        <Button
          size="icon-sm"
          variant="ghost"
          aria-label="还原配置"
          onClick={() => {
            setConfig(published)
            setMessages([])
            setSaved(false)
          }}
        >
          <RotateCcw />
        </Button>
      }
      footer={
        <>
          <div className="flex flex-col gap-1">
            <span role="status" className="text-xs text-muted-foreground">
              {publishing
                ? "正在保存配置…"
                : dirty
                  ? "有未保存的修改"
                  : saved
                    ? "已保存到当前预览"
                    : "所有修改已保存"}
            </span>
            <DemoNote>演示不会部署或调用真实智能体</DemoNote>
          </div>
          <Button
            size="sm"
            disabled={!dirty || publishing || !config.name.trim()}
            onClick={() => {
              setPublishing(true)
              later(() => {
                setPublished(config)
                setVersion((v) => v + 1)
                setPublishing(false)
                setSaved(true)
              }, 800)
            }}
          >
            <Upload data-icon="inline-start" />
            {publishing ? "保存中…" : "发布演示配置"}
          </Button>
        </>
      }
    >
      <Tabs value={mode} onValueChange={setMode}>
        <TabsList className="mb-5">
          <TabsTrigger value="configure">配置</TabsTrigger>
          <TabsTrigger value="test">测试</TabsTrigger>
        </TabsList>
        <TabsContent value="configure">
          <FieldGroup className="gap-5">
            <Field>
              <FieldLabel htmlFor="agent-name">智能体名称</FieldLabel>
              <Input
                id="agent-name"
                value={config.name}
                onChange={(e) => update({ name: e.target.value })}
                maxLength={60}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="agent-model">模型</FieldLabel>
              <Select
                value={config.model}
                onValueChange={(model) => {
                  if (model) update({ model })
                }}
              >
                <SelectTrigger id="agent-model" className="w-full">
                  <BrandMark
                    brand={config.model.startsWith("GPT") ? "openai" : "claude"}
                  />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {[
                      "Claude Sonnet 5.5",
                      "Claude Opus 5.5",
                      "GPT-6.1 Sol",
                    ].map((model) => (
                      <SelectItem value={model} key={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel
                htmlFor="agent-instructions"
                className="flex justify-between"
              >
                指令
                <span className="text-xs font-normal text-muted-foreground">
                  {config.instructions.length} / 2,000
                </span>
              </FieldLabel>
              <Textarea
                id="agent-instructions"
                className="min-h-32"
                maxLength={2000}
                value={config.instructions}
                onChange={(e) => update({ instructions: e.target.value })}
              />
            </Field>
            <Field>
              <FieldLabel className="flex justify-between">
                工具
                <span className="text-xs font-normal text-muted-foreground">
                  已启用 {config.tools.length} / 6
                </span>
              </FieldLabel>
              <div className="flex flex-col gap-4">
                {toolList.map((tool) => (
                  <div key={tool.name} className="flex items-center gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-muted/30">
                      <IntegrationMark name={tool.name} className="size-4" />
                    </div>
                    <label
                      htmlFor={`builder-${tool.name}`}
                      className="flex min-w-0 flex-1 flex-col gap-0.5"
                    >
                      <span className="text-sm">{tool.name}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {tool.description}
                      </span>
                    </label>
                    <Switch
                      id={`builder-${tool.name}`}
                      checked={config.tools.includes(tool.name)}
                      onCheckedChange={(checked) =>
                        update({
                          tools: checked
                            ? [...config.tools, tool.name]
                            : config.tools.filter((t) => t !== tool.name),
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            </Field>
            <Field>
              <FieldLabel className="flex justify-between">
                知识文件
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="添加知识文件"
                  onClick={() => picker.current?.click()}
                >
                  <Plus data-icon="inline-start" />
                  添加文件
                </Button>
              </FieldLabel>
              <input
                type="file"
                multiple
                accept=".pdf,.md,.txt,.csv"
                ref={picker}
                className="hidden"
                onChange={(e) => {
                  if (e.target.files)
                    update({
                      files: [
                        ...config.files,
                        ...Array.from(e.target.files).map((f) => f.name),
                      ],
                    })
                  e.target.value = ""
                }}
              />
              <div className="flex flex-col gap-2">
                {config.files.map((file, i) => (
                  <div
                    key={`${file}-${i}`}
                    className="flex items-center gap-2 rounded-lg border px-3 py-2"
                  >
                    <FileText className="size-4 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate text-xs">
                      {file}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      aria-label={`移除文件：${file}`}
                      onClick={() =>
                        update({
                          files: config.files.filter((_, n) => i !== n),
                        })
                      }
                    >
                      <X />
                    </Button>
                  </div>
                ))}
              </div>
            </Field>
          </FieldGroup>
        </TabsContent>
        <TabsContent value="test">
          <div className="flex h-[500px] flex-col gap-4">
            <div>
              <h3 className="text-sm font-medium">测试{config.name}</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                回复会根据配置中启用的工具变化。
              </p>
            </div>
            <MessageScrollerProvider autoScroll>
              <MessageScroller className="min-h-0 flex-1">
                <MessageScrollerViewport>
                  <MessageScrollerContent>
                    {messages.length === 0 && (
                      <MessageScrollerItem>
                        <div className="flex flex-col gap-2 py-8">
                          {examples.map((example) => (
                            <Button
                              key={example}
                              variant="outline"
                              className="h-auto justify-start py-3 text-left whitespace-normal"
                              onClick={() => send(example)}
                            >
                              {example}
                            </Button>
                          ))}
                        </div>
                      </MessageScrollerItem>
                    )}
                    {messages.map((message, i) => (
                      <MessageScrollerItem
                        key={i}
                        messageId={`builder-message-${i}`}
                        scrollAnchor={message.role === "user"}
                      >
                        <Message
                          align={message.role === "user" ? "end" : "start"}
                        >
                          <MessageContent>
                            <MessageHeader>
                              {message.role === "user" ? "你" : config.name}
                            </MessageHeader>
                            <Bubble
                              variant={
                                message.role === "user" ? "secondary" : "ghost"
                              }
                            >
                              <BubbleContent>{message.text}</BubbleContent>
                            </Bubble>
                          </MessageContent>
                        </Message>
                      </MessageScrollerItem>
                    ))}
                    {thinking && (
                      <MessageScrollerItem>
                        <StatusBadge status="running">
                          正在检查已启用的工具…
                        </StatusBadge>
                      </MessageScrollerItem>
                    )}
                  </MessageScrollerContent>
                </MessageScrollerViewport>
                <MessageScrollerButton />
              </MessageScroller>
            </MessageScrollerProvider>
            <InputGroup>
              <InputGroupInput
                aria-label="测试消息"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="输入测试问题…"
                onKeyDown={(e) => {
                  if (e.key === "Enter") send()
                }}
              />
              <InputGroupAddon align="inline-end">
                <Button
                  size="icon-sm"
                  disabled={thinking || !input.trim()}
                  aria-label="发送测试消息"
                  onClick={() => send()}
                >
                  <ArrowUp />
                </Button>
              </InputGroupAddon>
            </InputGroup>
          </div>
        </TabsContent>
      </Tabs>
    </AgentPanel>
  )
}
