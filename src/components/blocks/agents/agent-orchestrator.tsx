import { useState } from "react"
import {
  ArrowDown,
  Check,
  ChevronDown,
  FileText,
  Play,
  Square,
  Workflow,
} from "lucide-react"
import { Button } from "../../ui/button"
import { ToggleGroup, ToggleGroupItem } from "../../ui/toggle-group"
import { Progress } from "../../ui/progress"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../ui/collapsible"
import { BrandMark, StatusBadge } from "../shared"
import { AgentPanel, DemoNote, useSimulation } from "./common"

const lanes = [
  {
    name: "价格调研员",
    brand: "claude" as const,
    model: "Sonnet 5.5",
    task: "比较竞品价格",
    result: "已查看 4 个价格页面，团队套餐中位价为每席位 24 美元。",
    tokens: 1248,
  },
  {
    name: "产品分析师",
    brand: "claude" as const,
    model: "Haiku 5.5",
    task: "对照各套餐功能",
    result: "多数产品将单点登录和审计日志放在企业套餐中。",
    tokens: 864,
  },
  {
    name: "市场调研员",
    brand: "gemini" as const,
    model: "Gemini Flash",
    task: "查找客户顾虑",
    result: "使用上限和不透明的超额费用，会让客户犹豫。",
    tokens: 1120,
  },
  {
    name: "体验评审员",
    brand: "openai" as const,
    model: "GPT-6 Luna",
    task: "检查套餐升级流程",
    result: "将套餐缩减为 3 档，并增加费用计算器。",
    tokens: 980,
  },
]
export function AgentOrchestrator() {
  const [concurrency, setConcurrency] = useState("4")
  const sim = useSimulation(4 + Math.ceil(4 / Number(concurrency)) * 5, 450)
  const laneProgress = (index: number) =>
    Math.min(
      100,
      Math.max(
        0,
        (sim.step - 2 - Math.floor(index / Number(concurrency)) * 5) * 20
      )
    )
  return (
    <AgentPanel
      title="将我们的价格方案与四个竞品比较"
      description="一个主智能体，四个分工明确的执行智能体。"
      className="max-w-[900px]"
      action={
        <Button size="sm" onClick={sim.running ? sim.stop : sim.start}>
          {sim.running ? (
            <Square data-icon="inline-start" />
          ) : (
            <Play data-icon="inline-start" />
          )}
          {sim.running ? "停止" : sim.step ? "重新运行" : "运行"}
        </Button>
      }
      footer={
        <>
          <DemoNote />
          <span className="text-xs text-muted-foreground">
            {sim.done
              ? "已汇总 4 份结果 · 4,212 词元 · 0.024 美元"
              : "不会调用外部工具"}
          </span>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">同时执行数量</span>
          <ToggleGroup
            value={[concurrency]}
            onValueChange={([value]) => {
              if (value) {
                setConcurrency(value)
                sim.reset()
              }
            }}
            disabled={sim.running}
            size="sm"
            variant="outline"
          >
            {["1", "2", "3", "4"].map((value) => (
              <ToggleGroupItem
                key={value}
                value={value}
                aria-label={`同时运行 ${value} 个智能体`}
              >
                {value}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <div className="rounded-xl border bg-muted/25 p-4">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <BrandMark brand="claude" />
            <span className="font-medium">Claude Opus 5.5</span>
            <span className="text-xs text-muted-foreground">主智能体</span>
            <span className="ml-auto">
              <StatusBadge
                status={
                  sim.done ? "success" : sim.running ? "running" : "neutral"
                }
              >
                {sim.done
                  ? "已完成"
                  : sim.running
                    ? sim.step < 2
                      ? "制定计划"
                      : "分配和汇总任务"
                    : "待开始"}
              </StatusBadge>
            </span>
          </div>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {sim.step > 1
              ? "调研价格、比较功能、查找客户顾虑，再检查升级体验。最后汇总为三条建议。"
              : "先制定计划，再分配给 4 个执行智能体。"}
          </p>
        </div>
        <div className="flex justify-center text-muted-foreground">
          <ArrowDown className="size-4" />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {lanes.map((lane, i) => {
            const progress = laneProgress(i)
            const done = progress >= 100
            return (
              <Collapsible
                key={lane.name}
                className="min-w-0 rounded-xl border p-4"
              >
                <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 text-left">
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    <BrandMark brand={lane.brand} />
                    {lane.model}
                  </span>
                  <ChevronDown className="size-3.5 text-muted-foreground" />
                </CollapsibleTrigger>
                <h3 className="mt-4 text-sm font-medium">
                  {sim.step > 1 ? lane.name : "尚未分配"}
                </h3>
                <p className="mt-2 min-h-10 text-xs leading-5 text-muted-foreground">
                  {done
                    ? lane.result
                    : progress > 0
                      ? lane.task
                      : "等待任务计划"}
                </p>
                <div className="mt-4 flex items-center justify-between text-xs">
                  <StatusBadge
                    status={
                      done
                        ? "success"
                        : progress > 0 && sim.running
                          ? "running"
                          : "neutral"
                    }
                  >
                    {done
                      ? "已完成"
                      : progress > 0 && sim.running
                        ? "执行中"
                        : "排队中"}
                  </StatusBadge>
                  <span className="text-muted-foreground tabular-nums">
                    {Math.round(
                      (lane.tokens * progress) / 100
                    ).toLocaleString()}{" "}
                    词元
                  </span>
                </div>
                <Progress value={progress} className="mt-3 h-1" />
                <CollapsibleContent>
                  <div className="mt-4 flex flex-col gap-2 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
                    {[
                      "已收到主智能体分配的任务",
                      "已搜索公开资料",
                      "已阅读并比较结果",
                      "已返回简要报告",
                    ].map((text, j) => (
                      <div key={text} className="flex items-center gap-2">
                        {progress > j * 25 ? (
                          <Check className="size-3 text-success" />
                        ) : (
                          <FileText className="size-3" />
                        )}
                        {text}
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )
          })}
        </div>
        <div className="flex justify-center text-muted-foreground">
          <ArrowDown className="size-4" />
        </div>
        <div className="rounded-xl border p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Workflow className="size-4" />
            汇总结果
          </div>
          {sim.done ? (
            <ol className="mt-3 flex list-decimal flex-col gap-2 pl-5 text-sm leading-6 text-muted-foreground">
              <li>提供三档清晰的套餐，直接显示每席位价格。</li>
              <li>在结账前说明使用上限和超额费用。</li>
              <li>在账单页提供直接升级套餐的入口。</li>
            </ol>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              主智能体会在这里汇总四份结果。
            </p>
          )}
        </div>
      </div>
    </AgentPanel>
  )
}
