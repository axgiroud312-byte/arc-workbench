import { useState } from "react"
import {
  Bot,
  Check,
  ChevronRight,
  CircleAlert,
  Loader2,
  RotateCcw,
  ShieldQuestion,
  type LucideIcon,
} from "lucide-react"
import { Button } from "../../ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../ui/collapsible"
import { ToggleGroup, ToggleGroupItem } from "../../ui/toggle-group"
import { Trace } from "../../ui/trace"
import { BrandMark } from "../shared"
import { activityLabels, type ActivityStatus } from "./activity-line"
import { PreviewCard } from "./preview-card"
import { getUnfinishedDependencies } from "./run-record"
import { SubagentCall, type SubagentCallData } from "./subagent-call"

const statusIcons: Partial<Record<ActivityStatus, LucideIcon>> = {
  running: Loader2,
  waiting: ShieldQuestion,
  error: CircleAlert,
  done: Check,
}

export function DelegationGroup({
  workers,
  selectedId,
  onInspect,
  onRetry,
  defaultOpen = true,
}: {
  workers: SubagentCallData[]
  selectedId?: string
  onInspect: (id: string) => void
  onRetry?: (id: string) => void
  defaultOpen?: boolean
}) {
  const completed = workers.filter((worker) => worker.status === "done").length
  const waiting = workers.filter((worker) => worker.status === "waiting").length
  const running = workers.filter((worker) => worker.status === "running").length
  const failed = workers.filter((worker) => worker.status === "error").length
  const interrupted = workers.filter(
    (worker) => worker.status === "stopped" || worker.status === "blocked"
  ).length
  const summary = waiting
    ? waiting + " 项待你处理"
    : running
      ? running + " 项执行中"
      : failed
        ? failed + " 项失败"
        : interrupted
          ? interrupted + " 项中止"
          : completed + " 项完成"

  return (
    <Collapsible defaultOpen={defaultOpen} className="border-y py-0.5">
      <CollapsibleTrigger
        render={
          <Button
            size="sm"
            variant="ghost"
            className="group min-h-9 w-full justify-start gap-2 px-1.5"
          />
        }
      >
        <span className="flex items-center pl-1.5" aria-hidden="true">
          {workers.slice(0, 3).map((worker) => (
            <span
              key={worker.id}
              className="-ml-1.5 inline-flex size-6 items-center justify-center rounded-full bg-muted ring-2 ring-background"
            >
              {worker.model?.brand ? (
                <BrandMark brand={worker.model.brand} className="size-3.5" />
              ) : (
                <Bot className="size-3.5" />
              )}
            </span>
          ))}
        </span>
        <span className="min-w-0 flex-1 truncate text-left">
          {workers.length} 个子 Agent
        </span>
        <span className="text-xs font-normal text-muted-foreground">
          {summary}
        </span>
        <ChevronRight
          data-icon="inline-end"
          className="transition-transform group-aria-expanded:rotate-90"
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div
          className="flex flex-col gap-0.5 pb-1.5 pl-3"
          aria-label="子 Agent 任务"
        >
          {workers.map((worker) => {
            const Icon = statusIcons[worker.status]
            const dependencies = getUnfinishedDependencies(worker, workers)
            const waitingForDependency =
              worker.status === "pending" && dependencies.length > 0
            const detail = waitingForDependency
              ? "前置 · " + dependencies.join("、")
              : (worker.note ?? worker.duration)
            return (
              <div
                key={worker.id}
                className="flex min-w-0 items-center gap-1.5"
              >
                <Button
                  variant={worker.id === selectedId ? "secondary" : "ghost"}
                  className="h-auto min-h-9 min-w-0 flex-1 justify-start gap-2 px-2 whitespace-normal"
                  aria-pressed={worker.id === selectedId}
                  onClick={() => onInspect(worker.id)}
                >
                  {worker.model?.brand ? (
                    <BrandMark
                      brand={worker.model.brand}
                      className="size-4 shrink-0"
                    />
                  ) : (
                    <Bot data-icon="inline-start" />
                  )}
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
                    <span className="truncate">{worker.title}</span>
                    <span className="truncate text-xs font-normal text-muted-foreground">
                      {[worker.model?.name, detail].filter(Boolean).join(" · ")}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1.5 text-xs font-normal text-muted-foreground">
                    {Icon && (
                      <Icon
                        className={
                          worker.status === "running"
                            ? "motion-safe:animate-spin"
                            : worker.status === "waiting"
                              ? "text-warning"
                              : worker.status === "error"
                                ? "text-destructive"
                                : "text-success"
                        }
                      />
                    )}
                    {waitingForDependency
                      ? "等待前置"
                      : activityLabels[worker.status]}
                  </span>
                </Button>
                {onRetry &&
                  worker.status === "error" &&
                  !dependencies.length && (
                    <Button
                      variant="outline"
                      size="xs"
                      className="shrink-0"
                      aria-label={"重试 " + worker.title}
                      onClick={() => onRetry(worker.id)}
                    >
                      <RotateCcw data-icon="inline-start" />
                      重试
                    </Button>
                  )}
              </div>
            )
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

const sampleWorkers: SubagentCallData[] = [
  {
    id: "diagnose",
    title: "定位回车逻辑",
    task: "找出输入法选字时为什么会误发送。",
    model: { name: "Gemini", brand: "gemini" },
    status: "done",
    duration: "1.2 秒",
    result: "键盘事件处理函数在组字期间也会提交消息。",
  },
  {
    id: "tests",
    title: "补回归测试",
    task: "给中文输入、普通回车和换行添加回归测试。",
    model: { name: "Codex", brand: "codex" },
    status: "waiting",
    note: "等待文件写入审批",
  },
]

export function DelegationGroupDemo() {
  const [selectedId, setSelectedId] = useState(sampleWorkers[0].id)
  const [stage, setStage] = useState("waiting")
  const workers = sampleWorkers.map((worker, index): SubagentCallData => ({
    ...worker,
    status:
      stage === "running"
        ? "running"
        : stage === "done"
          ? "done"
          : stage === "stopped" && index === 1
            ? "stopped"
            : worker.status,
    note: stage === "waiting" ? worker.note : undefined,
    result: stage === "running" ? undefined : worker.result,
    duration: stage === "running" ? undefined : worker.duration,
  }))
  const selected = workers.find((worker) => worker.id === selectedId)

  return (
    <PreviewCard title="子 Agent 委派">
      <ToggleGroup
        value={[stage]}
        onValueChange={([value]) => value && setStage(value)}
        size="sm"
        variant="outline"
        className="flex-wrap"
        aria-label="委派状态"
      >
        <ToggleGroupItem value="running">并行执行</ToggleGroupItem>
        <ToggleGroupItem value="waiting">等待审批</ToggleGroupItem>
        <ToggleGroupItem value="done">完成</ToggleGroupItem>
        <ToggleGroupItem value="stopped">中止</ToggleGroupItem>
      </ToggleGroup>
      <DelegationGroup
        workers={workers}
        selectedId={selectedId}
        onInspect={setSelectedId}
      />
      {selected && (
        <Trace>
          <SubagentCall key={selected.id} call={selected} defaultOpen />
        </Trace>
      )}
    </PreviewCard>
  )
}
