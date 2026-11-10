import { useEffect, useRef, useState } from "react"
import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  CircleAlert,
  Clock3,
  Play,
  RotateCcw,
  Square,
  X,
} from "lucide-react"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
} from "../ui/card"
import { Separator } from "../ui/separator"
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../ui/tooltip"
import { Alert, AlertDescription } from "../ui/alert"
import { cn } from "../../lib/utils"
import { BrandMark } from "./shared"

type Outcome = "pass" | "fail" | "error"
const outcomeLabels: Record<Outcome, string> = {
  pass: "通过",
  fail: "失败",
  error: "错误",
}
const filterLabels: Record<string, string> = {
  all: "全部",
  failed: "失败",
  regressions: "退步",
  improved: "改善",
}
export type EvalCase = {
  id: string
  category: string
  title: string
  baseline: Outcome
  input: string
  expected: string
  baselineOutput: string
}
export type EvalResult = {
  caseId: string
  outcome: Outcome
  output: string
  rationale: string
  scores: number[]
}
export type EvalSuiteProps = {
  title?: string
  cases?: EvalCase[]
  onRun?: (cases: EvalCase[], signal: AbortSignal) => AsyncIterable<EvalResult>
  onTriage?: (
    caseId: string,
    action: "expected" | "issue"
  ) => void | Promise<void>
}

const categories = ["退款", "配送", "语气", "转交人工", "工具调用"]
const scenarios = [
  "订单部分送达",
  "超出退款期限",
  "重复扣款",
  "缺少配送进度",
  "账户验证",
  "破损商品换货",
  "取消订阅",
  "修改收货地址",
]
const demoCases: EvalCase[] = Array.from({ length: 120 }, (_, i) => ({
  id: `SUP-${String(i + 1).padStart(3, "0")}`,
  category: categories[Math.floor(i / 24)],
  title: scenarios[i % scenarios.length],
  baseline: i % 6 === 5 ? "fail" : "pass",
  input: `订单 #${4800 + i} 收到时少了一件商品，可以帮我检查配送情况并退款吗？`,
  expected: "核实订单，只为缺失的商品退款，并清楚说明后续处理。",
  baselineOutput:
    i % 6 === 5
      ? "我已取消您的订单，并退还所有商品的费用。"
      : "我已核实订单。缺失商品的金额为 24 美元，可以按原支付方式退还，订单中的其他商品保持不变。",
}))
function outcomeFor(i: number): Outcome {
  return i % 37 === 19
    ? "error"
    : i % 17 === 3 || i % 29 === 8
      ? "fail"
      : "pass"
}
function sampleResult(item: EvalCase, index: number): EvalResult {
  const outcome = outcomeFor(index)
  return {
    caseId: item.id,
    outcome,
    output:
      outcome === "pass"
        ? "我已核实配送情况，并为缺失商品发起 24 美元退款。款项预计在 3–5 个工作日内原路退回。"
        : outcome === "fail"
          ? "我已取消整个订单，并为所有商品发起退款。"
          : "查询订单时超时，未能生成回复。",
    rationale:
      outcome === "pass"
        ? "回复核实了订单，只退还缺失商品的费用，并给出了明确的到账时间。"
        : outcome === "fail"
          ? "回复错误地为整个订单退款，影响了客户原本想保留的商品。"
          : "本次运行未完成必要的工具调用。请重试后再评价回复质量。",
    scores:
      outcome === "pass"
        ? [5, 5, 4, 5]
        : outcome === "fail"
          ? [2, 1, 4, 2]
          : [1, 1, 1, 1],
  }
}
const history = [68, 74, 72, 79, 77, 81, 83.3]

export function EvalSuite({
  title = "客服智能体",
  cases = demoCases,
  onRun,
  onTriage,
}: EvalSuiteProps) {
  const [results, setResults] = useState<Record<string, EvalResult>>({})
  const [running, setRunning] = useState(false)
  const [filter, setFilter] = useState("regressions")
  const [error, setError] = useState("")
  const [elapsed, setElapsed] = useState(0)
  const [selectedHistory, setSelectedHistory] = useState(6)
  const [visible, setVisible] = useState(6)
  const [triaged, setTriaged] = useState<Record<string, string>>({})
  const controller = useRef<AbortController | null>(null)
  useEffect(() => () => controller.current?.abort(), [])
  useEffect(() => {
    if (!running) return
    const timer = window.setInterval(() => setElapsed((v) => v + 1), 1000)
    return () => window.clearInterval(timer)
  }, [running])
  const total = Object.keys(results).length
  const passes = Object.values(results).filter(
    (r) => r.outcome === "pass"
  ).length
  const baseline = cases.length
    ? (cases.filter((c) => c.baseline === "pass").length / cases.length) * 100
    : 0
  const score = cases.length ? (passes / cases.length) * 100 : 0
  const runHistory = total ? [...history, Number(score.toFixed(1))] : history
  const historyY = (value: number) => 46 - (value / 100) * 40
  const historyX = (index: number) =>
    8 + index * (216 / (runHistory.length - 1))
  const complete = total === cases.length && total > 0
  const regression = (c: EvalCase) =>
    c.baseline === "pass" && results[c.id] && results[c.id].outcome !== "pass"
  const improved = (c: EvalCase) =>
    c.baseline !== "pass" && results[c.id]?.outcome === "pass"
  const counts: Record<string, number> = {
    all: total,
    failed: Object.values(results).filter((r) => r.outcome !== "pass").length,
    regressions: cases.filter(regression).length,
    improved: cases.filter(improved).length,
  }
  const filtered = cases.filter(
    (c) =>
      results[c.id] &&
      (filter === "all" ||
        (filter === "failed" && results[c.id].outcome !== "pass") ||
        (filter === "regressions" && regression(c)) ||
        (filter === "improved" && improved(c)))
  )

  async function start() {
    controller.current?.abort()
    const abort = new AbortController()
    controller.current = abort
    setResults({})
    setTriaged({})
    setError("")
    setElapsed(0)
    setVisible(6)
    setSelectedHistory(6)
    setRunning(true)
    try {
      if (onRun) {
        for await (const result of onRun(cases, abort.signal)) {
          if (abort.signal.aborted) break
          if (cases.some((c) => c.id === result.caseId))
            setResults((previous) => ({ ...previous, [result.caseId]: result }))
        }
      } else {
        for (let i = 0; i < cases.length; i += 4) {
          await new Promise<void>((resolve) => {
            const finish = () => {
              clearTimeout(timer)
              abort.signal.removeEventListener("abort", finish)
              resolve()
            }
            const timer = setTimeout(finish, 170)
            abort.signal.addEventListener("abort", finish, { once: true })
          })
          if (abort.signal.aborted) break
          const batch = Object.fromEntries(
            cases
              .slice(i, i + 4)
              .map((item, j) => [item.id, sampleResult(item, i + j)])
          )
          setResults((previous) => ({ ...previous, ...batch }))
        }
      }
    } catch (cause) {
      if (!abort.signal.aborted)
        setError(
          cause instanceof Error ? cause.message : "评测未能完成，请重试。"
        )
    } finally {
      if (controller.current === abort) setRunning(false)
    }
  }
  async function triage(id: string, action: "expected" | "issue") {
    setTriaged((previous) => ({ ...previous, [id]: "保存中…" }))
    try {
      await onTriage?.(id, action)
      setTriaged((previous) => ({
        ...previous,
        [id]: action === "expected" ? "已标记为符合预期" : "已在本地记录问题",
      }))
    } catch {
      setTriaged((previous) => ({
        ...previous,
        [id]: "保存失败，请重试。",
      }))
    }
  }

  return (
    <Card className="eval-suite w-full gap-0 overflow-hidden py-0">
      <CardHeader className="gap-1 p-6">
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          v12 对比 v11 · {cases.length} 个测试案例
        </CardDescription>
        <CardAction>
          <Button
            onClick={
              running
                ? () => {
                    controller.current?.abort()
                    setRunning(false)
                  }
                : start
            }
            disabled={!cases.length}
            className="rounded-full"
          >
            {running ? (
              <Square data-icon="inline-start" />
            ) : complete ? (
              <RotateCcw data-icon="inline-start" />
            ) : (
              <Play data-icon="inline-start" fill="currentColor" />
            )}
            {running ? "停止" : total ? "重新运行" : "运行"}
          </Button>
        </CardAction>
        <div className="model-comparison col-span-full mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary">
            <BrandMark /> Claude Sonnet 5.5{" "}
            <span className="text-muted-foreground">v12</span>
          </Badge>
          <span>对比</span>
          <Badge variant="secondary">
            <BrandMark brand="openai" /> GPT-6 Luna{" "}
            <span className="text-muted-foreground">v11</span>
          </Badge>
          <span className="px-1">·</span>
          <span>评判模型</span>
          <Badge variant="secondary">
            <BrandMark /> Claude Opus 5.5
          </Badge>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="eval-summary grid gap-7 p-6">
        <div className="flex flex-col gap-2">
          <span className="text-muted-foreground">通过率</span>
          <div aria-live="polite" aria-atomic="true">
            {total ? (
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-3xl font-medium tracking-tight">
                  {score.toFixed(1)}
                  <span className="text-base text-muted-foreground">%</span>
                </span>
                <span
                  className={cn(
                    "flex items-center text-xs",
                    score >= baseline ? "text-success" : "text-destructive"
                  )}
                >
                  {score >= baseline ? (
                    <ArrowUpRight className="size-3" />
                  ) : (
                    <ArrowDownRight className="size-3" />
                  )}
                  {Math.abs(score - baseline).toFixed(1)} 个百分点
                </span>
              </div>
            ) : (
              <p className="py-1 text-muted-foreground">尚未运行</p>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            │ v11 通过率 {baseline.toFixed(1)}%
          </span>
        </div>
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap justify-between gap-1 text-xs text-muted-foreground">
            <span>最近 8 次运行</span>
            <span>
              v{selectedHistory + 5} · {runHistory[selectedHistory]}%
            </span>
          </div>
          <div className="relative h-14">
            <svg
              viewBox="0 0 240 52"
              role="img"
              aria-label="最近几次评测的通过率趋势"
              className="size-full overflow-visible"
            >
              <path
                d={runHistory
                  .map(
                    (value, index) =>
                      `${index === 0 ? "M" : "L"}${historyX(index)} ${historyY(value)}`
                  )
                  .join(" ")}
                fill="none"
                stroke="var(--muted-foreground)"
                strokeWidth="1.3"
              />
              {runHistory.map((value, i) => (
                <circle
                  key={i}
                  cx={historyX(i)}
                  cy={historyY(value)}
                  r={selectedHistory === i ? 4 : 2.5}
                  fill={
                    selectedHistory === i
                      ? "var(--card)"
                      : "var(--muted-foreground)"
                  }
                  stroke="var(--muted-foreground)"
                />
              ))}
            </svg>
            <div className="absolute inset-0 flex">
              {runHistory.map((value, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedHistory(i)}
                  aria-label={`版本 ${i + 5}，通过率 ${value}%`}
                  className="h-full flex-1 rounded-sm focus-visible:ring-2 focus-visible:ring-ring"
                />
              ))}
            </div>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>v5</span>
            <span>{total ? "v12" : "v11"}</span>
          </div>
        </div>
        <div className="flex flex-col gap-3 text-xs text-muted-foreground">
          <div>
            费用
            <p className="mt-1 text-sm">
              {total ? `$${(total * 0.024).toFixed(2)}` : "约 2.90 美元"}
            </p>
          </div>
          <div>
            耗时
            <p className="mt-1 text-sm">
              {total || running ? `${elapsed} 秒` : "约 3 分钟"}
            </p>
          </div>
        </div>
      </CardContent>
      <Separator />
      <CardContent className="flex flex-col gap-5 p-6">
        {[...new Set(cases.map((c) => c.category))].map((category) => {
          const items = cases.filter((c) => c.category === category)
          const done = items.filter((c) => results[c.id])
          const percent = items.length
            ? (done.filter((c) => results[c.id].outcome === "pass").length /
                items.length) *
              100
            : 0
          return (
            <div key={category} className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span>{category}</span>
                <div className="flex items-center gap-3">
                  <div className="relative h-1.5 w-16 rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-success transition-all"
                      style={{ width: `${percent}%` }}
                    />
                    <span
                      className="absolute -top-0.5 h-2.5 w-px bg-muted-foreground"
                      style={{
                        left: `${(items.filter((c) => c.baseline === "pass").length / items.length) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="w-10 text-right text-xs text-muted-foreground tabular-nums">
                    {done.length ? `${percent.toFixed(0)}%` : "–"}
                  </span>
                </div>
              </div>
              <div
                className="eval-grid"
                style={{
                  gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))`,
                }}
              >
                {items.map((item) => {
                  const result = results[item.id]
                  return (
                    <Tooltip key={item.id}>
                      <TooltipTrigger
                        render={
                          <button
                            type="button"
                            className={cn(
                              "eval-cell",
                              result && `eval-${result.outcome}`,
                              regression(item) && "eval-regression"
                            )}
                            aria-label={`${item.id}: ${result ? outcomeLabels[result.outcome] : "尚未运行"}`}
                            onClick={() => {
                              if (result) {
                                setFilter("all")
                                setVisible(cases.length)
                                setTimeout(
                                  () =>
                                    document
                                      .getElementById(item.id)
                                      ?.scrollIntoView({
                                        block: "nearest",
                                        behavior: "smooth",
                                      }),
                                  0
                                )
                              }
                            }}
                            disabled={!result}
                          />
                        }
                      >
                        {result ? (
                          result.outcome === "pass" ? (
                            <Check />
                          ) : result.outcome === "error" ? (
                            <CircleAlert />
                          ) : (
                            <X />
                          )
                        ) : null}
                      </TooltipTrigger>
                      <TooltipContent>
                        {item.id} · {item.title} ·{" "}
                        {result ? outcomeLabels[result.outcome] : "尚未运行"}
                      </TooltipContent>
                    </Tooltip>
                  )
                })}
              </div>
            </div>
          )
        })}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
          {(
            [
              ["pass", "通过"],
              ["fail", "失败"],
              ["error", "错误"],
              ["regression", "退步"],
            ] as const
          ).map(([status, label]) => (
            <span className="flex items-center gap-1.5" key={status}>
              <span className={cn("legend-dot", `eval-${status}`)} />
              {label}
            </span>
          ))}
          <span className="ml-auto">
            {running
              ? `${total} / ${cases.length}`
              : complete
                ? `已完成 ${cases.length} 个案例`
                : total
                  ? `已完成 ${total} 个案例 · 已停止`
                  : "│ v11 基准"}
          </span>
        </div>
      </CardContent>
      <Separator />
      <CardContent className="flex flex-col gap-4 p-6">
        <ToggleGroup
          value={[filter]}
          onValueChange={([value]) => {
            if (value) {
              setFilter(value)
              setVisible(6)
            }
          }}
          className="max-w-full flex-wrap"
          spacing={1}
          size="sm"
          aria-label="筛选评测案例"
        >
          {["all", "failed", "regressions", "improved"].map((key) => (
            <ToggleGroupItem key={key} value={key}>
              {filterLabels[key]}
              <span className="ml-1 text-muted-foreground">{counts[key]}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        {error && (
          <Alert variant="destructive">
            <CircleAlert />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {!filtered.length && (
          <p className="py-5 text-center text-sm text-muted-foreground">
            {total
              ? `本次运行没有${filter === "all" ? "已完成的" : filterLabels[filter]}案例。`
              : "运行评测后，即可逐项对比 v11 的结果。"}
          </p>
        )}
        <div className="flex flex-col gap-1">
          {filtered.slice(0, visible).map((item) => {
            const result = results[item.id]
            return (
              <Collapsible key={item.id} id={item.id} className="eval-case">
                <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-lg px-2 py-3 text-left hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">
                  <span
                    className={cn(
                      "size-4",
                      result.outcome === "pass"
                        ? "text-success"
                        : "text-destructive"
                    )}
                  >
                    {result.outcome === "pass" ? (
                      <Check className="size-4" />
                    ) : (
                      <X className="size-4" />
                    )}
                  </span>
                  <span className="flex-1 text-sm">
                    {item.title}
                    <span className="ml-2 text-xs text-muted-foreground">
                      {item.id}
                    </span>
                  </span>
                  <span className="hidden text-xs text-muted-foreground sm:inline">
                    {outcomeLabels[item.baseline]} →{" "}
                    {outcomeLabels[result.outcome]}
                  </span>
                  <ChevronDown className="size-3.5 text-muted-foreground" />
                </CollapsibleTrigger>
                <CollapsibleContent className="px-2 pb-4">
                  <div className="flex flex-col gap-4 rounded-xl border bg-muted/25 p-4">
                    <div>
                      <p className="mb-1 text-xs text-muted-foreground">
                        输入内容
                      </p>
                      <p>{item.input}</p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs text-muted-foreground">
                        预期行为
                      </p>
                      <p>{item.expected}</p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-lg border bg-card p-3">
                        <p className="mb-2 text-xs text-muted-foreground">
                          基准版本 · v11
                        </p>
                        <p className="text-sm leading-6">
                          {item.baselineOutput}
                        </p>
                      </div>
                      <div className="rounded-lg border bg-card p-3">
                        <p className="mb-2 text-xs text-muted-foreground">
                          新版本 · v12
                        </p>
                        <p
                          className={cn(
                            "text-sm leading-6",
                            result.outcome !== "pass" && "text-destructive"
                          )}
                        >
                          {result.output}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {["准确性", "规则遵守", "语气", "完整性"].map(
                        (criterion, i) => (
                          <div key={criterion}>
                            <div className="mb-2 flex justify-between text-xs text-muted-foreground">
                              <span>{criterion}</span>
                              <span>{result.scores[i]}/5</span>
                            </div>
                            <div className="h-1 rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-foreground/50"
                                style={{ width: `${result.scores[i] * 20}%` }}
                              />
                            </div>
                          </div>
                        )
                      )}
                    </div>
                    <p className="text-xs leading-5 text-muted-foreground">
                      {result.rationale}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {triaged[item.id] &&
                      !triaged[item.id].startsWith("保存失败") ? (
                        <>
                          <Badge variant="secondary">{triaged[item.id]}</Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={
                              !!onTriage || triaged[item.id] === "保存中…"
                            }
                            onClick={() =>
                              setTriaged((previous) => {
                                const next = { ...previous }
                                delete next[item.id]
                                return next
                              })
                            }
                          >
                            撤销
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => triage(item.id, "expected")}
                          >
                            标记为符合预期
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => triage(item.id, "issue")}
                          >
                            记录问题 <ArrowUpRight data-icon="inline-end" />
                          </Button>
                          {triaged[item.id] && (
                            <span className="text-xs text-destructive">
                              {triaged[item.id]}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )
          })}
        </div>
        {filtered.length > visible && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setVisible((v) => v + 12)}
          >
            再显示 {Math.min(12, filtered.length - visible)} 条{" "}
            <ChevronDown data-icon="inline-end" />
          </Button>
        )}
        <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Clock3 className="size-3" />
          {onRun ? "已连接评测接口" : "本地模拟评测 · 费用和回复均为示例"}
        </p>
      </CardContent>
    </Card>
  )
}
