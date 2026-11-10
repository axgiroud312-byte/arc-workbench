import { useState } from "react"
import { ToggleGroup, ToggleGroupItem } from "../../ui/toggle-group"
import { Trace } from "../../ui/trace"
import { Plan, type PlanStep } from "../chat-elements/plan"
import { PreviewCard } from "./preview-card"

export function RunOrchestration({
  steps,
  defaultOpen = false,
}: {
  steps: PlanStep[]
  defaultOpen?: boolean
}) {
  return (
    <Trace aria-label="编排步骤">
      <Plan title="编排流程" steps={steps} defaultOpen={defaultOpen} />
    </Trace>
  )
}

const stages = ["并行排查", "等待批准", "验证与汇总", "已完成", "拒绝写入"]
const stepsForStage = (stage: number): PlanStep[] => [
  {
    id: "prepare",
    title: "定位问题并准备测试",
    detail: "定位输入逻辑和读取测试文件并行进行。",
    status: stage === 0 ? "running" : "done",
  },
  {
    id: "verify",
    title: "应用改动并验证",
    detail:
      stage === 1
        ? "补回归测试的子 Agent 正在等写入审批。"
        : stage === 4
          ? "写入被拒绝，保留已完成的排查记录。"
          : "依赖排查结果，应用改动后运行回归测试。",
    status: (["pending", "waiting", "running", "done", "blocked"] as const)[
      stage
    ],
  },
  {
    id: "summarize",
    title: "汇总结果",
    detail: "主 Agent 收齐测试结果后整理结论。",
    status: stage >= 3 ? "done" : "pending",
  },
]

export function RunOrchestrationDemo() {
  const [stage, setStage] = useState(0)
  return (
    <PreviewCard title="执行编排">
      <ToggleGroup
        value={[String(stage)]}
        onValueChange={([value]) => value && setStage(Number(value))}
        size="sm"
        variant="outline"
        className="w-full flex-wrap"
        aria-label="演示阶段"
      >
        {stages.map((label, index) => (
          <ToggleGroupItem key={label} value={String(index)}>
            {label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <RunOrchestration steps={stepsForStage(stage)} defaultOpen />
    </PreviewCard>
  )
}
