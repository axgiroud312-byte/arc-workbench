import { useEffect, useRef, useState } from "react"
import {
  Check,
  ChevronDown,
  FileText,
  Globe,
  Plus,
  Search,
  Settings2,
  Upload,
  X,
} from "lucide-react"
import { Button } from "../../ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs"
import { Input } from "../../ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../../ui/input-group"
import { Field, FieldGroup, FieldLabel } from "../../ui/field"
import { Switch } from "../../ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog"
import { Progress } from "../../ui/progress"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../ui/collapsible"
import { StatusBadge } from "../shared"
import { AgentPanel, DemoNote, IntegrationMark } from "./common"

type Source = {
  id: number
  name: string
  pages: number
  chunks: number
  progress: number
  error?: string
  integration?: string
}
const initial: Source[] = [
  {
    id: 1,
    name: "退款与取消政策.pdf",
    pages: 12,
    chunks: 45,
    progress: 100,
  },
  {
    id: 2,
    name: "SOC 2 Type II 报告摘要.pdf",
    pages: 38,
    chunks: 159,
    progress: 100,
  },
  {
    id: 3,
    name: "新员工入职指南",
    integration: "Notion",
    pages: 24,
    chunks: 82,
    progress: 100,
  },
  {
    id: 4,
    name: "安全问卷答复",
    integration: "Google Drive",
    pages: 18,
    chunks: 68,
    progress: 60,
    error: "生成向量超时：已处理 41 段，共 68 段",
  },
  { id: 5, name: "help.copperline.dev", pages: 86, chunks: 124, progress: 18 },
]
const corpus = [
  {
    source: "退款与取消政策.pdf",
    page: 3,
    text: "客户可在首次付款后的 30 天内申请全额退款。年度订阅按未使用月份退款。请提供发票编号，并联系账单团队。",
    score: 96,
  },
  {
    source: "退款与取消政策.pdf",
    page: 5,
    text: "取消订阅会在当前计费周期结束时生效，此前仍可继续使用。取消后，工作区数据会保留 90 天。",
    score: 89,
  },
  {
    source: "新员工入职指南",
    page: 8,
    text: "客服修改账单前应核实客户身份。超过 200 美元的退款需要客服主管批准。",
    score: 84,
  },
  {
    source: "SOC 2 Type II 报告摘要.pdf",
    page: 6,
    text: "客户数据在存储和传输时都会加密。访问生产系统需要多重身份验证，访问权限每季度审核一次。",
    score: 82,
  },
]
export function KnowledgeBase() {
  const [sources, setSources] = useState(initial)
  const [query, setQuery] = useState("我们的退款政策是什么？")
  const [searched, setSearched] = useState(false)
  const [rerank, setRerank] = useState(true)
  const [chunkSize, setChunkSize] = useState("512")
  const [topK, setTopK] = useState("3")
  const fileInput = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (!sources.some((s) => s.progress < 100 && !s.error)) return
    const timer = setInterval(
      () =>
        setSources((items) =>
          items.map((s) =>
            s.error ? s : { ...s, progress: Math.min(100, s.progress + 14) }
          )
        ),
      650
    )
    return () => clearInterval(timer)
  }, [sources])
  const addFiles = (files: FileList | null) => {
    if (!files) return
    setSources((items) => [
      ...items,
      ...Array.from(files).map((f, i) => ({
        id: Date.now() + i,
        name: f.name,
        pages: Math.max(1, Math.ceil(f.size / 3000)),
        chunks: Math.max(1, Math.ceil(f.size / 1800)),
        progress: 0,
      })),
    ])
  }
  const queryTerms =
    query
      .toLowerCase()
      .match(
        /[a-z]{4,}|退款|取消|发票|账单|客户|数据|安全|身份|访问|加密|订阅|客服|审批|批准/g
      ) ?? []
  const results = [...corpus]
    .map((item) => ({
      ...item,
      relevance: queryTerms.filter((word) =>
        item.text.toLowerCase().includes(word)
      ).length,
    }))
    .sort((a, b) =>
      rerank
        ? b.relevance - a.relevance || b.score - a.score
        : b.score - a.score
    )
    .slice(0, Number(topK) || 3)
  return (
    <AgentPanel
      title="客服知识库"
      description={`${sources.length} 份资料 · ${sources.filter((s) => s.progress === 100).reduce((sum, s) => sum + s.chunks, 0)} 个段落`}
      action={
        <div className="flex gap-1">
          <Dialog>
            <DialogTrigger
              render={
                <Button
                  size="icon-sm"
                  variant="ghost"
                  aria-label="知识库设置"
                />
              }
            >
              <Settings2 />
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>检索设置</DialogTitle>
                <DialogDescription>
                  调整本地演示检索。分段大小会保存在当前预览中。
                </DialogDescription>
              </DialogHeader>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="chunk-size">每段大小（词元）</FieldLabel>
                  <Input
                    id="chunk-size"
                    type="number"
                    min="128"
                    max="2048"
                    value={chunkSize}
                    onChange={(e) => setChunkSize(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="top-k">显示结果数量</FieldLabel>
                  <Input
                    id="top-k"
                    type="number"
                    min="1"
                    max="4"
                    value={topK}
                    onChange={(e) =>
                      setTopK(
                        String(Math.min(4, Math.max(1, Number(e.target.value))))
                      )
                    }
                  />
                </Field>
                <Field orientation="horizontal">
                  <FieldLabel htmlFor="rerank-setting">
                    按相关程度重新排序
                  </FieldLabel>
                  <Switch
                    id="rerank-setting"
                    checked={rerank}
                    onCheckedChange={setRerank}
                  />
                </Field>
              </FieldGroup>
            </DialogContent>
          </Dialog>
          <Button
            size="sm"
            variant="outline"
            onClick={() => fileInput.current?.click()}
          >
            <Plus data-icon="inline-start" />
            添加资料
          </Button>
        </div>
      }
      footer={
        <DemoNote>索引和检索使用演示数据，文件仅保留在浏览器中。</DemoNote>
      }
    >
      <input
        type="file"
        accept=".pdf,.docx,.md,.txt"
        multiple
        ref={fileInput}
        className="hidden"
        onChange={(e) => {
          addFiles(e.target.files)
          e.target.value = ""
        }}
      />
      <Tabs defaultValue="sources">
        <TabsList className="mb-5">
          <TabsTrigger value="sources">资料 · {sources.length}</TabsTrigger>
          <TabsTrigger value="retrieval">测试检索</TabsTrigger>
        </TabsList>
        <TabsContent value="sources">
          <div className="flex flex-col gap-5">
            {sources.map((source) => (
              <div key={source.id} className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted/20">
                  {source.integration ? (
                    <IntegrationMark
                      name={source.integration}
                      className="size-4"
                    />
                  ) : source.name.includes(".dev") ? (
                    <Globe className="size-4" />
                  ) : (
                    <FileText className="size-4" />
                  )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="truncate text-sm" title={source.name}>
                      {source.name}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      aria-label={`移除资料：${source.name}`}
                      onClick={() =>
                        setSources((items) =>
                          items.filter((s) => s.id !== source.id)
                        )
                      }
                    >
                      <X />
                    </Button>
                  </div>
                  {source.error ? (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-destructive">
                        {source.error}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setSources((items) =>
                            items.map((s) =>
                              s.id === source.id
                                ? { ...s, error: undefined, progress: 0 }
                                : s
                            )
                          )
                        }
                      >
                        重试
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span>{source.pages} 页</span>
                        <span>
                          {Math.round((source.chunks * source.progress) / 100)}{" "}
                          段
                        </span>
                        <span>
                          {source.progress === 100
                            ? "已建立索引"
                            : ["解析中", "分段中", "生成向量中", "建立索引中"][
                                Math.min(3, Math.floor(source.progress / 25))
                              ]}
                        </span>
                      </div>
                      <div
                        className="grid grid-cols-4 gap-2"
                        aria-label={`资料处理进度 ${source.progress}%`}
                      >
                        {["解析", "分段", "向量", "索引"].map((step, i) => (
                          <div key={step} className="flex flex-col gap-1.5">
                            <Progress
                              value={Math.min(
                                100,
                                Math.max(0, (source.progress - i * 25) * 4)
                              )}
                              className="h-1"
                            />
                            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              {source.progress >= (i + 1) * 25 && (
                                <Check className="size-2.5 text-success" />
                              )}
                              {step}
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                addFiles(e.dataTransfer.files)
              }}
              className="flex flex-col items-center gap-2 rounded-xl border border-dashed p-6 transition-colors hover:bg-muted/50"
            >
              <Upload className="size-5 text-muted-foreground" />
              <span className="text-sm">将文件拖到这里，或点击选择</span>
              <span className="text-xs text-muted-foreground">
                支持 PDF、DOCX、Markdown 和 TXT
              </span>
            </button>
          </div>
        </TabsContent>
        <TabsContent value="retrieval">
          <div className="flex flex-col gap-5">
            <InputGroup>
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              <InputGroupInput
                aria-label="检索问题"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setSearched(false)
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && query.trim()) setSearched(true)
                }}
              />
              <InputGroupAddon align="inline-end">
                <Button
                  size="sm"
                  disabled={!query.trim()}
                  onClick={() => setSearched(true)}
                >
                  搜索
                </Button>
              </InputGroupAddon>
            </InputGroup>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {searched ? `${results.length} 条演示结果` : "搜索演示知识库"}
              </p>
              <div className="flex items-center gap-2">
                <label className="text-xs" htmlFor="rerank">
                  重新排序
                </label>
                <Switch
                  id="rerank"
                  checked={rerank}
                  onCheckedChange={setRerank}
                />
              </div>
            </div>
            {searched &&
              results.map((result, i) => (
                <Collapsible
                  key={result.source + result.page}
                  className="rounded-xl border p-4"
                >
                  <CollapsibleTrigger className="flex w-full items-center gap-2 text-left">
                    <FileText className="size-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate text-xs font-medium">
                      {result.source}
                    </span>
                    <StatusBadge status="success">{result.score}%</StatusBadge>
                    <ChevronDown className="size-3.5" />
                  </CollapsibleTrigger>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {result.text}
                  </p>
                  <div className="mt-3 flex justify-between text-xs text-muted-foreground">
                    <span>
                      第 {result.page} 页 · 段落 {12 + i * 7}
                    </span>
                    <span>{rerank ? "已按相关程度排序" : "语义相似度"}</span>
                  </div>
                  <CollapsibleContent>
                    <div className="mt-4 rounded-lg bg-muted p-3 text-xs leading-6 text-muted-foreground">
                      上一段：本政策适用于所有付费工作区套餐。
                      <br />
                      <strong className="font-medium text-foreground">
                        当前段落： {result.text}
                      </strong>
                      <br />
                      下一段：特殊情况请联系客户经理。
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </AgentPanel>
  )
}
