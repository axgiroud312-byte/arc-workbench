import { useState } from "react"
import { Brain, Check, ChevronDown, Cpu, SlidersHorizontal } from "lucide-react"
import { Button } from "../../ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../ui/card"
import { Badge } from "../../ui/badge"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
} from "../../ui/dropdown-menu"
import { BrandMark } from "../shared"

export const demoModels = [
  {
    id: "sonnet",
    name: "Claude Sonnet 5.5",
    brand: "claude" as const,
    note: "兼顾速度和复杂任务处理能力。",
    context: "200K",
    input: "$3.00",
    output: "$15.00",
    label: "推荐",
  },
  {
    id: "opus",
    name: "Claude Opus 5.5",
    brand: "claude" as const,
    note: "适合需要深入分析的复杂任务。",
    context: "200K",
    input: "$5.00",
    output: "$25.00",
    label: "复杂任务",
  },
  {
    id: "sol",
    name: "GPT-6.1 Sol",
    brand: "openai" as const,
    note: "适合日常问答与快速处理任务。",
    context: "256K",
    input: "$2.00",
    output: "$10.00",
    label: "快速",
  },
  {
    id: "gemini",
    name: "Gemini 4 Argon",
    brand: "gemini" as const,
    note: "适合阅读长文档与处理大量上下文。",
    context: "1M",
    input: "$1.25",
    output: "$5.00",
    label: "长上下文",
  },
  {
    id: "codex",
    name: "Codex",
    brand: "codex" as const,
    note: "用于体验编程助手的交互。",
    context: "演示项",
    input: "—",
    output: "—",
    label: "编程助手",
  },
]

export function getDemoModel(id?: string) {
  return demoModels.find((item) => item.id === id) ?? demoModels[0]
}

const effortOptions = [
  { value: "Low", label: "较少" },
  { value: "Medium", label: "适中" },
  { value: "High", label: "深入" },
]

export function ModelMenu({
  value,
  onChange,
  effort,
  onEffortChange,
}: {
  value: string
  onChange: (id: string) => void
  effort?: string
  onEffortChange?: (value: string) => void
}) {
  const model = getDemoModel(value)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="sm" />}>
        <BrandMark brand={model.brand} />
        {model.name}
        <ChevronDown data-icon="inline-end" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        <DropdownMenuGroup>
          <DropdownMenuLabel>选择模型</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
            {demoModels.map((item) => (
              <DropdownMenuRadioItem
                key={item.id}
                value={item.id}
                closeOnClick={!onEffortChange}
              >
                <div className="flex gap-3 py-1">
                  <BrandMark brand={item.brand} />
                  <div className="flex flex-col gap-1">
                    <span>{item.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {item.note}
                    </span>
                  </div>
                </div>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
        {onEffortChange && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel>思考程度</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={effort}
                onValueChange={onEffortChange}
              >
                {effortOptions.map((item) => (
                  <DropdownMenuRadioItem key={item.value} value={item.value}>
                    {item.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function ModelPicker({
  onChange,
}: { onChange?: (id: string, effort: string) => void } = {}) {
  const [modelId, setModelId] = useState("sonnet")
  const [effort, setEffort] = useState("Medium")
  const model = demoModels.find((item) => item.id === modelId)!
  return (
    <Card className="mx-auto w-full max-w-xl">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Cpu className="size-4 text-muted-foreground" />
          <CardTitle>选择模型</CardTitle>
        </div>
        <CardDescription>按任务选择模型和思考程度。</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-7">
        <div className="flex flex-wrap items-center gap-2">
          <ModelMenu
            value={modelId}
            effort={effort}
            onChange={(id) => {
              setModelId(id)
              onChange?.(id, effort)
            }}
            onEffortChange={(value) => {
              setEffort(value)
              onChange?.(modelId, value)
            }}
          />
          <Badge variant="outline">
            <Brain data-icon="inline-start" />
            {effortOptions.find((item) => item.value === effort)?.label}
          </Badge>
        </div>
        <div className="flex items-start gap-4">
          <div className="flex size-11 items-center justify-center rounded-xl border">
            <BrandMark brand={model.brand} />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-medium">{model.name}</h3>
              <Badge variant="secondary">{model.label}</Badge>
              {model.brand === "gemini" && (
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <BrandMark brand="google" className="size-3.5" />
                  Google
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{model.note}</p>
          </div>
        </div>
        <dl className="grid grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <dt className="text-xs text-muted-foreground">上下文长度</dt>
            <dd className="font-medium tabular-nums">{model.context}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-xs text-muted-foreground">输入 / 百万词元</dt>
            <dd className="font-medium tabular-nums">{model.input}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-xs text-muted-foreground">输出 / 百万词元</dt>
            <dd className="font-medium tabular-nums">{model.output}</dd>
          </div>
        </dl>
        <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Check className="size-3.5" />
            选择将用于下一条消息
          </span>
          <SlidersHorizontal className="size-3.5" />
        </div>
        <p className="text-xs text-muted-foreground">
          模型信息和价格均为演示数据，不代表实际可用模型或报价。
        </p>
      </CardContent>
    </Card>
  )
}
