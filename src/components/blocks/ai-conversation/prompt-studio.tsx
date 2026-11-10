import { useState } from "react"
import {
  Check,
  ChevronDown,
  FileCode2,
  History,
  Play,
  Save,
  Square,
  Upload,
} from "lucide-react"
import { Button } from "../../ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card"
import { Badge } from "../../ui/badge"
import { Textarea } from "../../ui/textarea"
import { Input } from "../../ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../ui/tabs"
import { FieldGroup, Field, FieldLabel } from "../../ui/field"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "../../ui/dropdown-menu"
import { ModelMenu } from "./model-picker"
import { CopyAction, useTextStream } from "./demo-helpers"

const initialSystem =
  "你是 {{company}} 的客服助手。\n\n请用清楚、友好的语言直接回答客户的问题。只使用已提供的信息，不要编造政策。\n\n回复不超过 {{max_words}} 字。"
const initialUser =
  "客户：{{customer_name}}\n问题：{{question}}\n\n请草拟一段恰当的回复。"
type Version = { id: number; system: string; user: string; note: string }

export function PromptStudio({
  onPromote,
}: { onPromote?: (version: Version) => void } = {}) {
  const [versions, setVersions] = useState<Version[]>([
    {
      id: 3,
      system: initialSystem,
      user: initialUser,
      note: "新增回复长度限制",
    },
    {
      id: 2,
      system: "你是 {{company}} 的客服助手。请友好、准确地回答。",
      user: initialUser,
      note: "改善语气与准确性",
    },
    {
      id: 1,
      system: "回答客户的问题。",
      user: initialUser,
      note: "初始提示词",
    },
  ])
  const [version, setVersion] = useState(3)
  const [production, setProduction] = useState(2)
  const [system, setSystem] = useState(initialSystem)
  const [user, setUser] = useState(initialUser)
  const [model, setModel] = useState("sonnet")
  const [company, setCompany] = useState("Forma")
  const [customer, setCustomer] = useState("小林")
  const [question, setQuestion] = useState("下次扣款之前可以更换套餐吗？")
  const [maxWords, setMaxWords] = useState("120")
  const [compare, setCompare] = useState(false)
  const stream = useTextStream()
  const selected = versions.find((item) => item.id === version)!
  const dirty = system !== selected.system || user !== selected.user
  function selectVersion(id: string) {
    const next = versions.find((item) => item.id === Number(id))!
    setVersion(next.id)
    setSystem(next.system)
    setUser(next.user)
    setCompare(false)
  }
  function saveVersion() {
    const next = {
      id: Math.max(...versions.map((item) => item.id)) + 1,
      system,
      user,
      note: "刚刚保存",
    }
    setVersions([next, ...versions])
    setVersion(next.id)
  }
  function run() {
    const reply = `${customer || "客户"}，你好：\n\n感谢你向 ${company || "我们"} 咨询“${question}”。\n\n你可以在“设置 → 账单 → 管理套餐”中查看订阅。确认更改前，请核对页面显示的费用与生效时间。如果问题涉及具体政策，我们的客服可以查询你的账户并协助处理。\n\n祝好，\n${company || "客服"} 团队`
    const limit = Math.max(10, Math.min(500, Number(maxWords) || 120))
    const words = Array.from(reply)
    stream.start(
      words.length <= limit ? reply : words.slice(0, limit).join("") + "…"
    )
  }
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileCode2 className="size-4 text-muted-foreground" />
            <CardTitle>客服回复</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button variant="outline" size="sm" />}
              >
                v{version}
                {dirty ? " · 已编辑" : ""}
                <ChevronDown data-icon="inline-end" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuGroup>
                  <DropdownMenuRadioGroup
                    value={String(version)}
                    onValueChange={selectVersion}
                  >
                    {versions.map((item) => (
                      <DropdownMenuRadioItem
                        key={item.id}
                        value={String(item.id)}
                      >
                        <div className="flex flex-col gap-1">
                          <span>
                            v{item.id}
                            {production === item.id ? " · 当前使用" : ""}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {item.note}
                          </span>
                        </div>
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <ModelMenu value={model} onChange={setModel} />
        </div>
        <CardDescription>
          编辑提示词、试跑示例，再选择使用哪个版本。
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <Tabs defaultValue="system">
          <div className="flex items-center justify-between gap-2">
            <TabsList>
              <TabsTrigger value="system">系统指令</TabsTrigger>
              <TabsTrigger value="user">用户输入</TabsTrigger>
            </TabsList>
            <Button
              size="sm"
              variant={compare ? "secondary" : "ghost"}
              onClick={() => setCompare(!compare)}
            >
              <History data-icon="inline-start" />
              {compare ? "关闭对比" : "对比版本"}
            </Button>
          </div>
          <TabsContent value="system">
            <Textarea
              aria-label="系统提示词模板"
              value={system}
              onChange={(event) => setSystem(event.target.value)}
              className="min-h-44"
            />
          </TabsContent>
          <TabsContent value="user">
            <Textarea
              aria-label="用户提示词模板"
              value={user}
              onChange={(event) => setUser(event.target.value)}
              className="min-h-44"
            />
          </TabsContent>
        </Tabs>
        {compare && (
          <div className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Badge variant="outline">当前使用 · v{production}</Badge>
              <p className="text-sm whitespace-pre-line text-muted-foreground">
                {versions.find((item) => item.id === production)?.system}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Badge variant="secondary">正在编辑 · v{version}</Badge>
              <p className="text-sm whitespace-pre-line">{system}</p>
            </div>
          </div>
        )}
        <FieldGroup className="grid gap-3 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="prompt-company">公司</FieldLabel>
            <Input
              id="prompt-company"
              value={company}
              onChange={(event) => setCompany(event.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="prompt-customer">客户姓名</FieldLabel>
            <Input
              id="prompt-customer"
              value={customer}
              onChange={(event) => setCustomer(event.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="prompt-question">客户问题</FieldLabel>
            <Input
              id="prompt-question"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="prompt-limit">字数上限</FieldLabel>
            <Input
              id="prompt-limit"
              inputMode="numeric"
              value={maxWords}
              onChange={(event) => setMaxWords(event.target.value)}
            />
          </Field>
        </FieldGroup>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={saveVersion}
              disabled={!dirty}
            >
              <Save data-icon="inline-start" />
              保存版本
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={dirty || production === version}
              onClick={() => {
                setProduction(version)
                onPromote?.(selected)
              }}
            >
              {production === version ? (
                <Check data-icon="inline-start" />
              ) : (
                <Upload data-icon="inline-start" />
              )}
              {production === version ? "当前使用" : "设为使用版本"}
            </Button>
          </div>
          <Button onClick={stream.running ? stream.stop : run}>
            {stream.running ? (
              <Square data-icon="inline-start" />
            ) : (
              <Play data-icon="inline-start" />
            )}
            {stream.running ? "停止" : "试跑"}
          </Button>
        </div>
        {(stream.text || stream.running) && (
          <div className="rounded-lg border">
            <div className="flex items-center justify-between border-b px-4 py-2">
              <span className="text-xs text-muted-foreground">
                {stream.running
                  ? "正在生成示例回复…"
                  : stream.stopped
                    ? "已停止"
                    : "输出结果 · 本地演示"}
              </span>
              <CopyAction value={stream.text} />
            </div>
            <p
              className="p-4 text-sm leading-7 whitespace-pre-line"
              aria-busy={stream.running}
            >
              {stream.text}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
