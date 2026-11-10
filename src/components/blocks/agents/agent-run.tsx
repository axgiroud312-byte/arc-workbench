import { useState } from "react"
import {
  Check,
  ChevronDown,
  FileCode2,
  GitPullRequest,
  Loader2,
  Play,
  RotateCcw,
  Search,
  Sparkles,
  Terminal,
  X,
} from "lucide-react"
import { Button } from "../../ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../ui/collapsible"
import { Input } from "../../ui/input"
import { Field, FieldGroup, FieldLabel } from "../../ui/field"
import { Separator } from "../../ui/separator"
import { BrandMark, StatusBadge } from "../shared"
import { AgentPanel, DemoNote, useSimulation } from "./common"
import { cn } from "../../../lib/utils"

const steps = [
  {
    title: "已制定修改计划",
    icon: Sparkles,
    output: "使用 Redis 实现滑动窗口限流，保留现有的错误格式。",
  },
  {
    title: "已读取 src/api/routes.ts",
    icon: FileCode2,
    output: 'router.use(authenticate)\nrouter.get("/projects", listProjects)',
  },
  {
    title: "已搜索限流中间件",
    icon: Search,
    output: "src/ 中没有现成的限流中间件。",
  },
  {
    title: "已读取 src/lib/redis.ts",
    icon: FileCode2,
    output: "export const redis = new Redis(process.env.REDIS_URL)",
  },
]
const diffs = {
  "rate-limit.ts": [
    '+ import { redis } from "../lib/redis";',
    "+ const WINDOW = 60;",
    "+ const LIMIT = 60;",
    "+",
    "+ export async function rateLimit(req, res, next) {",
    "+   const key = `limit:${req.apiKey}`;",
    "+   const count = await redis.incr(key);",
    "+   if (count === 1) await redis.expire(key, WINDOW);",
    "+   if (count > LIMIT) return res.status(429).json({",
    '+     error: "Too many requests"',
    "+   });",
    "+   next();",
    "+ }",
  ],
  "routes.ts": [
    '  import { authenticate } from "./auth";',
    '+ import { rateLimit } from "./rate-limit";',
    "  ",
    "- router.use(authenticate);",
    "+ router.use(authenticate, rateLimit);",
    '  router.get("/projects", listProjects);',
  ],
}

export function AgentRun({
  task = "为公开 API 添加请求限流",
}: {
  task?: string
}) {
  const simulation = useSimulation(5, 650)
  const [decision, setDecision] = useState<
    "waiting" | "approved" | "revising" | null
  >(null)
  const [rejecting, setRejecting] = useState(false)
  const [note, setNote] = useState("")
  const [pr, setPr] = useState(false)
  const waiting = simulation.done && decision !== "approved"
  const completed = decision === "approved"
  const restart = () => {
    setDecision(null)
    setRejecting(false)
    setPr(false)
    setNote("")
    simulation.start()
  }
  return (
    <AgentPanel
      title={task}
      description={
        <span className="flex flex-wrap items-center gap-2">
          <BrandMark brand="claude" /> Claude Sonnet 5.5{" "}
          <span className="ml-auto">
            <StatusBadge
              status={
                completed
                  ? "success"
                  : waiting
                    ? "warning"
                    : simulation.running
                      ? "running"
                      : "neutral"
              }
            >
              {completed
                ? "已完成"
                : waiting
                  ? "等待你审核"
                  : simulation.running
                    ? "执行中"
                    : "待开始"}
            </StatusBadge>
          </span>
        </span>
      }
      action={
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="重新运行"
          onClick={restart}
        >
          <RotateCcw />
        </Button>
      }
      footer={
        <>
          <DemoNote />
          {!simulation.running && !simulation.done && (
            <Button size="sm" onClick={restart}>
              <Play data-icon="inline-start" />
              开始运行
            </Button>
          )}
          {completed && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPr(true)}
              disabled={pr}
            >
              <GitPullRequest data-icon="inline-start" />
              {pr ? "已创建演示合并请求 #482" : "创建演示合并请求"}
            </Button>
          )}
        </>
      }
    >
      {simulation.step === 0 && !simulation.running ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          智能体将检查代码、提出修改，并等待你确认。
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {steps
            .slice(0, Math.min(simulation.step + 1, 4))
            .map((step, index) => (
              <Collapsible key={step.title}>
                <CollapsibleTrigger className="flex w-full items-center gap-3 rounded-lg py-2 text-left text-sm">
                  <step.icon className="size-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1 truncate">{step.title}</span>
                  {index < simulation.step ? (
                    <Check className="size-4 text-success" />
                  ) : (
                    <Loader2 className="size-4 motion-safe:animate-spin" />
                  )}
                  <ChevronDown className="size-3.5 text-muted-foreground" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <pre className="my-2 overflow-x-auto rounded-lg bg-muted p-3 text-xs leading-6">
                    {step.output}
                  </pre>
                </CollapsibleContent>
              </Collapsible>
            ))}
          {waiting && (
            <div className="flex flex-col gap-4 pt-3">
              <Separator />
              <div className="flex items-center gap-2 text-sm font-medium">
                <FileCode2 className="size-4 text-warning" />
                审核 2 个文件的修改
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                {decision === "revising"
                  ? `已根据意见调整方案：${note}。请重新审核修改。`
                  : "在所有 API 路由前加入 Redis 限流：每个 API 密钥每分钟最多请求 60 次。"}
              </p>
              <Tabs defaultValue="rate-limit.ts" className="min-w-0">
                <TabsList className="w-full justify-start">
                  {Object.keys(diffs).map((file) => (
                    <TabsTrigger key={file} value={file}>
                      {file}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {Object.entries(diffs).map(([file, lines]) => (
                  <TabsContent key={file} value={file}>
                    <pre className="max-h-64 overflow-auto rounded-xl border bg-muted/30 py-3 text-xs leading-6">
                      {lines.map((line, i) => (
                        <div
                          key={i}
                          className={cn(
                            "px-3",
                            line.startsWith("+")
                              ? "bg-success/10 text-success"
                              : line.startsWith("-")
                                ? "bg-destructive/10 text-destructive"
                                : "text-muted-foreground"
                          )}
                        >
                          <span className="mr-4 inline-block w-4 text-right opacity-50 select-none">
                            {i + 1}
                          </span>
                          {decision === "revising" &&
                          line.includes("const LIMIT")
                            ? "+ const LIMIT = 100; // 根据审核意见调整"
                            : line}
                        </div>
                      ))}
                    </pre>
                  </TabsContent>
                ))}
              </Tabs>
              {rejecting ? (
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="revision-note">
                      希望智能体如何修改？
                    </FieldLabel>
                    <Input
                      id="revision-note"
                      autoFocus
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="将请求上限提高到 100 次"
                    />
                  </Field>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setRejecting(false)}
                    >
                      取消
                    </Button>
                    <Button
                      size="sm"
                      disabled={!note.trim()}
                      onClick={() => {
                        setDecision("revising")
                        setRejecting(false)
                      }}
                    >
                      发送修改意见
                    </Button>
                  </div>
                </FieldGroup>
              ) : (
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRejecting(true)}
                  >
                    <X data-icon="inline-start" />
                    要求修改
                  </Button>
                  <Button size="sm" onClick={() => setDecision("approved")}>
                    <Check data-icon="inline-start" />
                    批准修改
                  </Button>
                </div>
              )}
            </div>
          )}
          {completed && (
            <div role="status" className="flex flex-col gap-3 pt-3">
              <Separator />
              <p className="text-sm leading-6">
                限流修改已准备好。公开接口超过请求上限时，将返回明确的 429
                错误。
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <FileCode2 className="size-3.5" />
                  已修改 2 个文件
                </span>
                <span className="text-success">+17 −1</span>
                <span className="flex items-center gap-1.5">
                  <Terminal className="size-3.5" />
                  12 项演示检查通过
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </AgentPanel>
  )
}
