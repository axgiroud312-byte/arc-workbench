"use client"

import { useState } from "react"
import {
  ArrowRightIcon,
  CircleCheckIcon,
  CircleDashedIcon,
  CircleXIcon,
  LoaderCircleIcon,
} from "lucide-react"

import { Badge } from "../../ui/badge"
import { Button } from "../../ui/button"

const statuses = {
  done: {
    label: "已完成",
    Icon: CircleCheckIcon,
    color: "text-emerald-600 dark:text-emerald-400",
  },
  running: {
    label: "执行中",
    Icon: LoaderCircleIcon,
    color:
      "animate-spin text-sky-600 motion-reduce:animate-none dark:text-sky-400",
  },
  waiting: {
    label: "等待前置",
    Icon: CircleDashedIcon,
    color: "text-muted-foreground",
  },
  failed: { label: "失败", Icon: CircleXIcon, color: "text-destructive" },
} as const

export type WorkflowNode = {
  id: string
  title: string
  status: keyof typeof statuses
  statusLabel?: string
  dependsOn?: readonly string[]
  detail: string
}

export type WorkflowStage = {
  id: string
  title: string
  nodes: readonly WorkflowNode[]
}

export function WorkflowGraph({
  stages,
  value,
  onValueChange,
}: {
  stages: readonly WorkflowStage[]
  value: string
  onValueChange: (id: string) => void
}) {
  const nodes = stages.flatMap((stage) => stage.nodes)
  const active = nodes.find((node) => node.id === value) ?? nodes[0]
  if (!active) return null
  const dependencies =
    active.dependsOn?.map(
      (id) => nodes.find((node) => node.id === id) ?? { id, title: id }
    ) ?? []

  return (
    <section
      aria-label="Agent 流程图"
      className="@container/workflow min-w-0 overflow-hidden rounded-xl border bg-card"
    >
      <ol className="flex flex-col gap-3 bg-muted/25 p-3 @min-[32rem]/workflow:flex-row @min-[32rem]/workflow:p-4">
        {stages.map((stage, index) => (
          <li
            key={stage.id}
            className="flex min-w-0 flex-1 flex-col gap-2 @min-[32rem]/workflow:flex-row @min-[32rem]/workflow:gap-3"
          >
            {index > 0 && (
              <ArrowRightIcon
                aria-hidden="true"
                className="ml-3 size-4 shrink-0 rotate-90 text-muted-foreground @min-[32rem]/workflow:mt-10 @min-[32rem]/workflow:ml-0 @min-[32rem]/workflow:rotate-0"
              />
            )}
            <div className="grid min-w-0 flex-1 content-start gap-2">
              <h3 className="text-xs font-medium text-muted-foreground">
                {stage.title}
              </h3>
              {stage.nodes.map((node) => {
                const { label, Icon, color } = statuses[node.status]
                return (
                  <Button
                    key={node.id}
                    variant="outline"
                    aria-pressed={active.id === node.id}
                    title={node.title}
                    onClick={() => onValueChange(node.id)}
                    className="h-auto w-full justify-start gap-2.5 p-2.5 text-start aria-pressed:border-primary aria-pressed:bg-accent aria-pressed:ring-1 aria-pressed:ring-ring/60"
                  >
                    <Icon className={"size-4 " + color} aria-hidden="true" />
                    <span className="grid min-w-0 gap-1">
                      <span className="truncate text-sm">{node.title}</span>
                      <span className="text-xs font-normal text-muted-foreground">
                        {node.statusLabel ?? label}
                      </span>
                    </span>
                  </Button>
                )
              })}
            </div>
          </li>
        ))}
      </ol>
      <div className="grid gap-2 border-t p-4" aria-live="polite">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-medium">{active.title}</h3>
          <Badge
            variant={active.status === "failed" ? "destructive" : "secondary"}
          >
            {active.statusLabel ?? statuses[active.status].label}
          </Badge>
        </div>
        <p className="text-sm leading-6 text-muted-foreground">
          {active.detail}
        </p>
        {dependencies.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <span>依赖</span>
            {dependencies.map(({ id, title }) => (
              <Button
                key={id}
                size="xs"
                variant="outline"
                disabled={!nodes.some((node) => node.id === id)}
                onClick={() => onValueChange(id)}
              >
                {title}
              </Button>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

const stages: WorkflowStage[] = [
  {
    id: "prepare",
    title: "准备",
    nodes: [
      {
        id: "read",
        title: "读取项目",
        status: "done",
        detail: "已读取入口文件和测试配置，找到 12 个组件。",
      },
    ],
  },
  {
    id: "parallel",
    title: "并行检查",
    nodes: [
      {
        id: "review",
        title: "审查代码",
        status: "running",
        dependsOn: ["read"],
        detail: "正在检查对话列表和附件输入的改动。",
      },
      {
        id: "tests",
        title: "运行测试",
        status: "failed",
        dependsOn: ["read"],
        detail: "表单重试测试失败，等待保存按钮重新启用时超时。",
      },
    ],
  },
  {
    id: "merge",
    title: "汇总",
    nodes: [
      {
        id: "report",
        title: "生成报告",
        status: "waiting",
        dependsOn: ["review", "tests"],
        detail: "等待代码审查和测试成功后汇总结果。",
      },
    ],
  },
]

export function WorkflowGraphDemo() {
  const [selected, setSelected] = useState("report")
  return (
    <WorkflowGraph
      stages={stages}
      value={selected}
      onValueChange={setSelected}
    />
  )
}
