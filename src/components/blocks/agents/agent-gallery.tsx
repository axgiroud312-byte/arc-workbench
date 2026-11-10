import { useState } from "react"
import {
  Bot,
  CalendarDays,
  Check,
  ChevronRight,
  Download,
  GitFork,
  Hash,
  Headphones,
  Mail,
  Play,
  Search,
  Shield,
  Star,
  TrendingUp,
  Zap,
} from "lucide-react"
import { Button } from "../../ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../../ui/input-group"
import { ToggleGroup, ToggleGroupItem } from "../../ui/toggle-group"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog"
import { Field, FieldGroup, FieldLabel } from "../../ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select"
import { Switch } from "../../ui/switch"
import { BrandMark, StatusBadge } from "../shared"
import { AgentPanel, DemoNote, IntegrationMark, useTimers } from "./common"
const teamLabels: Record<string, string> = {
  Sales: "销售",
  Support: "客服",
  Engineering: "研发",
  Marketing: "营销",
  Ops: "运营",
}
const workspaceLabels: Record<string, string> = {
  "Personal workspace": "个人工作区",
  "Design team": "设计团队",
  Engineering: "研发团队",
}

type Template = {
  name: string
  team: string
  description: string
  apps: string[]
  icon: typeof Bot
  model: "claude" | "openai" | "gemini"
  rating: string
  installs: string
}
const templates: Template[] = [
  {
    name: "销售线索筛选",
    team: "Sales",
    description: "评估演示申请，将高意向客户分配给合适的销售。",
    apps: ["HubSpot", "Slack", "Gmail"],
    icon: TrendingUp,
    model: "claude",
    rating: "4.9",
    installs: "1.82 万",
  },
  {
    name: "会前准备",
    team: "Sales",
    description: "在客户通话前，为负责人准备简要资料。",
    apps: ["Google Calendar", "HubSpot", "Notion"],
    icon: CalendarDays,
    model: "openai",
    rating: "4.8",
    installs: "1.17 万",
  },
  {
    name: "跟进邮件助手",
    team: "Sales",
    description: "通话结束后，起草包含结论和后续安排的邮件。",
    apps: ["Gmail", "HubSpot"],
    icon: Mail,
    model: "claude",
    rating: "4.7",
    installs: "9.4 千",
  },
  {
    name: "续费监测",
    team: "Sales",
    description: "续费前，找出使用量下降的客户。",
    apps: ["Stripe", "HubSpot", "Slack"],
    icon: Shield,
    model: "gemini",
    rating: "4.6",
    installs: "5.1 千",
  },
  {
    name: "收件箱分流",
    team: "Support",
    description: "分类新会话，将紧急工单交给团队。",
    apps: ["Gmail", "Linear"],
    icon: Mail,
    model: "claude",
    rating: "4.9",
    installs: "1.48 万",
  },
  {
    name: "退款助手",
    team: "Support",
    description: "核对退款政策，准备待审核的退款申请。",
    apps: ["Stripe", "Gmail"],
    icon: Headphones,
    model: "openai",
    rating: "4.8",
    installs: "8.3 千",
  },
  {
    name: "帮助文档助手",
    team: "Support",
    description: "将已解决的工单整理成清晰的帮助文章。",
    apps: ["Notion", "Slack"],
    icon: Bot,
    model: "claude",
    rating: "4.7",
    installs: "6.1 千",
  },
  {
    name: "客户情绪分析",
    team: "Support",
    description: "从近期会话中找出客户反复遇到的问题。",
    apps: ["Gmail", "Slack"],
    icon: TrendingUp,
    model: "gemini",
    rating: "4.6",
    installs: "4.4 千",
  },
  {
    name: "代码审核助手",
    team: "Engineering",
    description: "检查代码修改，找出功能退化并提出具体修复建议。",
    apps: ["GitHub", "Linear"],
    icon: GitFork,
    model: "claude",
    rating: "4.9",
    installs: "2.21 万",
  },
  {
    name: "故障响应助手",
    team: "Engineering",
    description: "归类新错误，并整理故障时间线。",
    apps: ["Sentry", "Slack"],
    icon: Zap,
    model: "openai",
    rating: "4.8",
    installs: "1.28 万",
  },
  {
    name: "版本说明助手",
    team: "Engineering",
    description: "将已合并的代码整理成易读的版本说明。",
    apps: ["GitHub", "Notion"],
    icon: GitFork,
    model: "claude",
    rating: "4.8",
    installs: "9.2 千",
  },
  {
    name: "依赖更新监测",
    team: "Engineering",
    description: "跟踪重要依赖更新，并起草升级任务。",
    apps: ["GitHub", "Linear"],
    icon: Shield,
    model: "gemini",
    rating: "4.7",
    installs: "7.1 千",
  },
  {
    name: "内容改写助手",
    team: "Marketing",
    description: "将长文章改写成适合不同发布渠道的草稿。",
    apps: ["Notion", "Slack"],
    icon: Bot,
    model: "claude",
    rating: "4.8",
    installs: "1.04 万",
  },
  {
    name: "营销活动分析",
    team: "Marketing",
    description: "分析营销结果，找出值得继续尝试的方案。",
    apps: ["数据分析", "Notion"],
    icon: TrendingUp,
    model: "openai",
    rating: "4.7",
    installs: "8.2 千",
  },
  {
    name: "品牌监测",
    team: "Marketing",
    description: "收集品牌相关讨论，并整理每日摘要。",
    apps: ["网页搜索", "Slack"],
    icon: Search,
    model: "gemini",
    rating: "4.6",
    installs: "5.6 千",
  },
  {
    name: "通讯编辑助手",
    team: "Marketing",
    description: "筛选重要动态，整理下一期通讯草稿。",
    apps: ["Notion", "Gmail"],
    icon: Mail,
    model: "claude",
    rating: "4.8",
    installs: "7.3 千",
  },
  {
    name: "每日简报",
    team: "Ops",
    description: "将值得关注的动态汇总为早间简报。",
    apps: ["Google Calendar", "Slack", "Notion"],
    icon: CalendarDays,
    model: "claude",
    rating: "4.9",
    installs: "1.62 万",
  },
  {
    name: "发票检查助手",
    team: "Ops",
    description: "检查收到的发票，标记金额不一致的项目。",
    apps: ["Gmail", "Stripe"],
    icon: Shield,
    model: "openai",
    rating: "4.8",
    installs: "8.5 千",
  },
  {
    name: "入职引导助手",
    team: "Ops",
    description: "帮助新同事按计划完成第一周任务。",
    apps: ["Notion", "Slack"],
    icon: Bot,
    model: "gemini",
    rating: "4.7",
    installs: "6.8 千",
  },
  {
    name: "每周汇总",
    team: "Ops",
    description: "汇总团队进展和下周重点。",
    apps: ["Linear", "Slack"],
    icon: Hash,
    model: "claude",
    rating: "4.8",
    installs: "9.9 千",
  },
]

export function AgentGallery() {
  const [team, setTeam] = useState("Sales")
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Template | null>(null)
  const [view, setView] = useState<"preview" | "install">("preview")
  const [workspace, setWorkspace] = useState("Personal workspace")
  const [permissions, setPermissions] = useState<string[]>([])
  const [installed, setInstalled] = useState<string[]>([])
  const [installing, setInstalling] = useState(false)
  const [previewing, setPreviewing] = useState(false)
  const [previewDone, setPreviewDone] = useState(false)
  const later = useTimers()
  const filtered = templates.filter(
    (t) =>
      t.team === team &&
      `${t.name} ${t.description}`.toLowerCase().includes(search.toLowerCase())
  )
  const open = (template: Template, nextView: "preview" | "install") => {
    setSelected(template)
    setView(nextView)
    setPermissions(template.apps)
    setPreviewDone(false)
  }
  return (
    <AgentPanel
      title="智能体模板"
      description="选用适配团队现有工具的智能体模板。"
      className="max-w-[840px]"
      footer={<DemoNote>模板、评分和安装量均为演示数据 · 仅本地安装</DemoNote>}
    >
      <div className="flex flex-col gap-5">
        <InputGroup>
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            aria-label="搜索智能体模板"
            placeholder="搜索智能体…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </InputGroup>
        <div className="max-w-full overflow-x-auto">
          <ToggleGroup
            value={[team]}
            onValueChange={([value]) => {
              if (value) setTeam(value)
            }}
            className="justify-start"
            size="sm"
            variant="outline"
          >
            {["Sales", "Support", "Engineering", "Marketing", "Ops"].map(
              (t) => (
                <ToggleGroupItem key={t} value={t}>
                  {teamLabels[t]}
                </ToggleGroupItem>
              )
            )}
          </ToggleGroup>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {filtered.map((template) => (
            <article
              className="flex flex-col gap-4 rounded-xl border p-5"
              key={template.name}
            >
              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-xl bg-muted">
                  <template.icon className="size-5" />
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <BrandMark brand={template.model} />
                  {template.model === "claude"
                    ? "Claude"
                    : template.model === "openai"
                      ? "GPT"
                      : "Gemini"}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium">{template.name}</h3>
                <p className="mt-2 min-h-12 text-sm leading-6 text-muted-foreground">
                  {template.description}
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5 text-[11px] text-muted-foreground">
                {template.apps.map((app) => (
                  <span key={app} className="inline-flex items-center gap-1.5">
                    <IntegrationMark name={app} className="size-3.5" />
                    {app}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="size-3" />
                    {template.rating}
                  </span>
                  <span className="flex items-center gap-1">
                    <Download className="size-3" />
                    {template.installs}
                  </span>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => open(template, "preview")}
                  >
                    预览
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={installed.includes(template.name)}
                    onClick={() => open(template, "install")}
                  >
                    {installed.includes(template.name) ? (
                      <>
                        <Check data-icon="inline-start" />
                        已安装
                      </>
                    ) : (
                      "安装"
                    )}
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            未找到匹配的{teamLabels[team]}智能体，请切换分类或修改搜索词。
          </p>
        )}
      </div>
      <Dialog
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selected?.name}</DialogTitle>
            <DialogDescription>{selected?.description}</DialogDescription>
          </DialogHeader>
          {selected &&
            (view === "preview" ? (
              <div className="flex flex-col gap-5">
                <div className="rounded-xl border bg-muted/30 p-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <BrandMark brand={selected.model} />
                    运行示例
                  </div>
                  <p className="mt-3 text-sm leading-6">
                    {previewDone
                      ? `已查看 ${selected.apps[0]} 的最新动态，找出三项需要关注的内容，并整理为简短草稿。没有发送任何消息。`
                      : `${selected.name}会从 ${selected.apps.join("、")} 读取相关信息，并准备结果供你审核。`}
                  </p>
                </div>
                <div className="flex justify-between gap-2">
                  <Button
                    variant="outline"
                    disabled={previewing}
                    onClick={() => {
                      setPreviewing(true)
                      setPreviewDone(false)
                      later(() => {
                        setPreviewing(false)
                        setPreviewDone(true)
                      }, 1200)
                    }}
                  >
                    <Play data-icon="inline-start" />
                    {previewing ? "示例运行中…" : "运行示例"}
                  </Button>
                  <Button onClick={() => setView("install")}>
                    使用这个模板
                    <ChevronRight data-icon="inline-end" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="gallery-workspace">工作区</FieldLabel>
                    <Select
                      items={workspaceLabels}
                      value={workspace}
                      onValueChange={(value) => {
                        if (value) setWorkspace(value)
                      }}
                    >
                      <SelectTrigger id="gallery-workspace" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {[
                            "Personal workspace",
                            "Design team",
                            "Engineering",
                          ].map((w) => (
                            <SelectItem value={w} key={w}>
                              {workspaceLabels[w]}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel>应用访问权限</FieldLabel>
                    <div className="flex flex-col gap-4">
                      {selected.apps.map((app) => (
                        <div
                          className="flex items-center justify-between"
                          key={app}
                        >
                          <label
                            className="inline-flex items-center gap-2 text-sm"
                            htmlFor={`grant-${app}`}
                          >
                            <IntegrationMark name={app} className="size-4" />
                            {app}
                          </label>
                          <Switch
                            id={`grant-${app}`}
                            checked={permissions.includes(app)}
                            onCheckedChange={(checked) =>
                              setPermissions((items) =>
                                checked
                                  ? [...items, app]
                                  : items.filter((x) => x !== app)
                              )
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </Field>
                </FieldGroup>
                {installed.includes(selected.name) ? (
                  <div role="status">
                    <StatusBadge status="success">
                      已安装到{workspaceLabels[workspace]}
                    </StatusBadge>
                    <p className="mt-2 text-xs text-muted-foreground">
                      已保存到当前预览，没有授予外部应用权限。
                    </p>
                  </div>
                ) : (
                  <Button
                    disabled={installing || permissions.length === 0}
                    onClick={() => {
                      setInstalling(true)
                      later(() => {
                        setInstalled((items) => [...items, selected.name])
                        setInstalling(false)
                      }, 1100)
                    }}
                  >
                    <Download data-icon="inline-start" />
                    {installing ? "安装中…" : "安装演示智能体"}
                  </Button>
                )}
              </div>
            ))}
        </DialogContent>
      </Dialog>
    </AgentPanel>
  )
}
