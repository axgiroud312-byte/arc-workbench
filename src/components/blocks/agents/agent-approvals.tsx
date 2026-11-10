import { useState } from "react"
import { Check, ChevronDown, Clock, Shield, Trash2, X } from "lucide-react"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Field, FieldGroup, FieldLabel } from "../../ui/field"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../ui/collapsible"
import { Separator } from "../../ui/separator"
import { BrandMark, StatusBadge } from "../shared"
import { AgentPanel, DemoNote, IntegrationMark } from "./common"

const riskLabels = { High: "高", Medium: "中", Low: "低" }
const toolLabels = {
  deploy: "部署",
  email: "邮件",
  database: "数据库",
  issues: "工单",
}
const argumentLabels: Record<string, string> = {
  Project: "项目",
  Commit: "提交",
  Target: "目标环境",
  Regions: "部署区域",
  To: "收件人",
  Subject: "主题",
  Amount: "金额",
  Table: "数据表",
  Operation: "操作",
  Rows: "行数",
  Issue: "工单",
  Action: "处理方式",
  Count: "数量",
}

type Request = {
  id: number
  agent: string
  title: string
  reason: string
  risk: "High" | "Medium" | "Low"
  tool: "deploy" | "email" | "database" | "issues"
  args: Record<string, string>
}
const requests: Request[] = [
  {
    id: 1,
    agent: "部署智能体",
    title: "执行 vercel deploy --prod",
    reason: "预览版本已通过全部 214 项检查，目前处于允许发布的时间段。",
    risk: "High",
    tool: "deploy",
    args: {
      Project: "northwind-web",
      Commit: "8f3c2a1 · 发布价格页 v3",
      Target: "production",
      Regions: "fra1, iad1",
    },
  },
  {
    id: 2,
    agent: "客服智能体",
    title: "向 Dana 发送退款说明邮件",
    reason: "已核实重复扣款，准备发送包含退款详情的确认邮件。",
    risk: "Medium",
    tool: "email",
    args: {
      To: "dana@example.com",
      Subject: "你的退款正在处理中",
      Amount: "$49.00",
    },
  },
  {
    id: 3,
    agent: "数据智能体",
    title: "将 1,284 个旧套餐迁移到团队版",
    reason: "所有受影响的工作区都已选择迁移到新套餐。",
    risk: "High",
    tool: "database",
    args: {
      Table: "subscriptions",
      Operation: "UPDATE plan = team",
      Rows: "1,284",
    },
  },
  {
    id: 4,
    agent: "部署智能体",
    title: "将 northwind-docs 部署到生产环境",
    reason: "发布已审核通过的文档更新。",
    risk: "Medium",
    tool: "deploy",
    args: { Project: "northwind-docs", Target: "production" },
  },
  {
    id: 5,
    agent: "工单分流智能体",
    title: "关闭 6 条与 WEB-398 重复的工单",
    reason: "这些反馈描述的是同一个结账问题。",
    risk: "Low",
    tool: "issues",
    args: { Issue: "WEB-398", Action: "关闭重复工单", Count: "6" },
  },
]

export function AgentApprovals() {
  const [pending, setPending] = useState(requests)
  const [selectedId, setSelectedId] = useState(1)
  const [resolved, setResolved] = useState<
    { title: string; approved: boolean }[]
  >([])
  const [rules, setRules] = useState<string[]>([])
  const current = pending.find((r) => r.id === selectedId) ?? pending[0]
  const decide = (approved: boolean, always?: "agent" | "workspace") => {
    if (!current) return
    const matches = (r: Request) =>
      r.id === current.id ||
      (always &&
        r.tool === current.tool &&
        (always === "workspace" || r.agent === current.agent))
    const done = pending.filter(matches)
    setResolved((items) => [
      ...done.map((r) => ({ title: r.title, approved })),
      ...items,
    ])
    setPending((items) => items.filter((r) => !matches(r)))
    if (always)
      setRules((items) => [
        ...items,
        `${toolLabels[current.tool]} · ${always === "workspace" ? "工作区中的所有智能体" : current.agent}`,
      ])
  }
  return (
    <AgentPanel
      title="操作审批"
      description={`${pending.length} 项待审批请求`}
      action={
        <Dialog>
          <DialogTrigger render={<Button size="sm" variant="outline" />}>
            <Shield data-icon="inline-start" />
            规则{rules.length > 0 && ` · ${rules.length}`}
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>审批规则</DialogTitle>
              <DialogDescription>
                这些权限仅对当前本地演示生效。
              </DialogDescription>
            </DialogHeader>
            {rules.length ? (
              rules.map((rule, i) => (
                <div
                  key={`${rule}-${i}`}
                  className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm"
                >
                  <span>{rule}</span>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label={`移除规则 ${rule}`}
                    onClick={() =>
                      setRules((items) =>
                        items.filter((_, index) => index !== i)
                      )
                    }
                  >
                    <Trash2 />
                  </Button>
                </div>
              ))
            ) : (
              <p className="py-5 text-sm text-muted-foreground">
                还没有规则，每次操作都需要你批准。
              </p>
            )}
          </DialogContent>
        </Dialog>
      }
      footer={<DemoNote />}
    >
      <div className="flex flex-col gap-5">
        {current ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-xs text-muted-foreground">
                <BrandMark brand="claude" />
                {current.agent}
                <span className="hidden sm:inline">· Claude Opus 5.5</span>
              </span>
              <StatusBadge
                status={
                  current.risk === "High"
                    ? "error"
                    : current.risk === "Medium"
                      ? "warning"
                      : "success"
                }
              >
                {riskLabels[current.risk]}风险
              </StatusBadge>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-muted/30">
                <IntegrationMark
                  name={
                    current.tool === "email"
                      ? "Gmail"
                      : current.tool === "deploy"
                        ? "Vercel"
                        : current.tool === "issues"
                          ? "Linear"
                          : "PostgreSQL"
                  }
                  className="size-5"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <h3 className="text-base font-medium">{current.title}</h3>
                <p className="text-sm leading-6 text-muted-foreground">
                  {current.reason}
                </p>
              </div>
            </div>
            <FieldGroup className="gap-3">
              {Object.entries(current.args).map(([key, value]) => (
                <Field key={key} orientation="horizontal">
                  <FieldLabel
                    htmlFor={`approval-${key}`}
                    className="w-20 shrink-0"
                  >
                    {argumentLabels[key] ?? key}
                  </FieldLabel>
                  <Input
                    id={`approval-${key}`}
                    value={value}
                    onChange={(e) =>
                      setPending((items) =>
                        items.map((r) =>
                          r.id === current.id
                            ? {
                                ...r,
                                args: { ...r.args, [key]: e.target.value },
                              }
                            : r
                        )
                      )
                    }
                  />
                </Field>
              ))}
            </FieldGroup>
            <div className="flex flex-wrap justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => decide(false)}>
                <X data-icon="inline-start" />
                拒绝
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={<Button size="sm" variant="outline" />}
                >
                  始终允许
                  <ChevronDown data-icon="inline-end" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => decide(true, "agent")}>
                      仅对这个智能体
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => decide(true, "workspace")}>
                      对工作区中的所有智能体
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button size="sm" onClick={() => decide(true)}>
                <Check data-icon="inline-start" />
                批准
              </Button>
            </div>
            <Separator />
            <div className="flex flex-col gap-1">
              {pending
                .filter((r) => r.id !== current.id)
                .map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    className="flex w-full items-center gap-3 rounded-lg px-2 py-3 text-left text-sm transition-colors hover:bg-muted"
                    onClick={() => setSelectedId(r.id)}
                  >
                    <Clock className="size-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate">{r.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {riskLabels[r.risk]}风险
                    </span>
                  </button>
                ))}
            </div>
          </>
        ) : (
          <div role="status" className="flex flex-col items-center gap-3 py-10">
            <Check className="size-7 text-success" />
            <h3 className="text-base font-medium">已全部处理</h3>
            <p className="text-sm text-muted-foreground">所有请求都已处理。</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setPending(requests)
                setSelectedId(1)
                setResolved([])
              }}
            >
              重置演示队列
            </Button>
          </div>
        )}
        {resolved.length > 0 && (
          <Collapsible>
            <CollapsibleTrigger className="flex items-center gap-2 text-xs text-muted-foreground">
              <ChevronDown className="size-3.5" />
              已处理 · {resolved.length}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-3 flex flex-col gap-3">
                {resolved.map((r, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    {r.approved ? (
                      <Check className="size-3.5 text-success" />
                    ) : (
                      <X className="size-3.5 text-destructive" />
                    )}
                    <span className="min-w-0 flex-1 truncate text-muted-foreground">
                      {r.title}
                    </span>
                    <span>{r.approved ? "已批准" : "已拒绝"}</span>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    </AgentPanel>
  )
}
