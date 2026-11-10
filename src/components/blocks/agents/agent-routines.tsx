import { useRef, useState } from "react"
import {
  CalendarClock,
  Check,
  ChevronDown,
  Clock3,
  Play,
  Plus,
  Square,
} from "lucide-react"
import { Button } from "../../ui/button"
import { Switch } from "../../ui/switch"
import { Input } from "../../ui/input"
import { Textarea } from "../../ui/textarea"
import { Field, FieldGroup, FieldLabel } from "../../ui/field"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog"
import { Collapsible, CollapsibleContent } from "../../ui/collapsible"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select"
import { Progress } from "../../ui/progress"
import { BrandMark, StatusBadge, type BrandName } from "../shared"
import { AgentPanel, DemoNote, IntegrationMark, useTimers } from "./common"
import { cn } from "../../../lib/utils"
const frequencyLabels: Record<string, string> = {
  Weekdays: "每个工作日",
  Fridays: "每周五",
  "Every day": "每天",
}

type Routine = {
  id: number
  name: string
  frequency: string
  time: string
  channel: string
  enabled: boolean
  instruction: string
  running: boolean
  last: string
  sources: string[]
  model: BrandName
}
const initial: Routine[] = [
  {
    id: 1,
    name: "每日工单分流",
    frequency: "Weekdays",
    time: "09:00",
    channel: "triage",
    enabled: true,
    instruction: "读取新工单，按对客户的影响排序，并发布最紧急的三项。",
    running: false,
    last: "昨天 9:00",
    sources: ["Linear", "Sentry"],
    model: "claude",
  },
  {
    id: 2,
    name: "已合并代码周报",
    frequency: "Fridays",
    time: "16:00",
    channel: "engineering",
    enabled: true,
    instruction: "汇总已合并的代码，并简要说明对用户的影响。",
    running: false,
    last: "周五 16:00",
    sources: ["GitHub"],
    model: "claude",
  },
  {
    id: 3,
    name: "故障监测",
    frequency: "Every day",
    time: "12:00",
    channel: "incidents",
    enabled: true,
    instruction: "检查新出现的错误，标记影响超过十位客户的问题。",
    running: false,
    last: "今天 6:00",
    sources: ["Sentry", "GitHub"],
    model: "openai",
  },
  {
    id: 4,
    name: "会前准备",
    frequency: "Weekdays",
    time: "08:30",
    channel: "direct-message",
    enabled: false,
    instruction: "在日历中的每场会议前，准备一份简短的客户资料。",
    running: false,
    last: "周四 8:30",
    sources: ["Google Calendar", "Notion"],
    model: "gemini",
  },
]
export function AgentRoutines() {
  const [routines, setRoutines] = useState(initial)
  const [openId, setOpenId] = useState<number | null>(null)
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState("")
  const later = useTimers()
  const runTimers = useRef(new Map<number, ReturnType<typeof setTimeout>>())
  const update = (id: number, patch: Partial<Routine>) =>
    setRoutines((items) =>
      items.map((r) => (r.id === id ? { ...r, ...patch } : r))
    )
  const run = (routine: Routine) => {
    if (routine.running) {
      clearTimeout(runTimers.current.get(routine.id))
      update(routine.id, { running: false, last: "已停止" })
      return
    }
    update(routine.id, { running: true })
    runTimers.current.set(
      routine.id,
      later(() => update(routine.id, { running: false, last: "刚刚" }), 2200)
    )
  }
  return (
    <AgentPanel
      title="定时任务"
      description={`${routines.filter((r) => r.enabled).length} / ${routines.length} 个任务已启用`}
      action={
        <Dialog open={creating} onOpenChange={setCreating}>
          <DialogTrigger render={<Button variant="outline" size="sm" />}>
            <Plus data-icon="inline-start" />
            新建任务
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新建定时任务</DialogTitle>
              <DialogDescription>
                在演示中添加一个重复执行的智能体任务。
              </DialogDescription>
            </DialogHeader>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="routine-name">任务名称</FieldLabel>
                <Input
                  id="routine-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="每周客户反馈汇总"
                  autoFocus
                />
              </Field>
            </FieldGroup>
            <Button
              disabled={!name.trim()}
              onClick={() => {
                const id = Date.now()
                setRoutines((items) => [
                  ...items,
                  {
                    ...initial[0],
                    id,
                    name: name.trim(),
                    instruction: "汇总最新动态，并发布简短报告。",
                    channel: "updates",
                    last: "尚未运行",
                  },
                ])
                setCreating(false)
                setOpenId(id)
                setName("")
              }}
            >
              创建任务
            </Button>
          </DialogContent>
        </Dialog>
      }
      footer={<DemoNote>演示日程 · 仅在当前预览中运行</DemoNote>}
    >
      <div className="flex flex-col gap-1">
        {routines.map((routine, i) => (
          <Collapsible
            key={routine.id}
            open={openId === routine.id}
            className="rounded-xl border border-transparent p-3 data-open:border-border data-open:bg-muted/25"
          >
            <div className="flex items-start gap-3">
              <CalendarClock className="mt-1 size-4 shrink-0 text-muted-foreground" />
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenId(openId === routine.id ? null : routine.id)
                    }
                    aria-expanded={openId === routine.id}
                    className="flex min-w-0 items-center gap-2 text-left text-sm font-medium"
                  >
                    <span className="truncate">{routine.name}</span>
                    <ChevronDown className="size-3 shrink-0 text-muted-foreground" />
                  </button>
                  <Switch
                    checked={routine.enabled}
                    onCheckedChange={(enabled) =>
                      update(routine.id, { enabled })
                    }
                    aria-label={`启用${routine.name}`}
                  />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span>
                    {frequencyLabels[routine.frequency]} {routine.time} ·{" "}
                    {routine.enabled ? "已安排" : "已暂停"}
                  </span>
                  <span className="hidden sm:inline">{routine.last}</span>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {routine.sources.map((source) => (
                      <IntegrationMark
                        key={source}
                        name={source}
                        className="size-3.5"
                      />
                    ))}
                    <IntegrationMark name="Slack" className="size-3.5" />
                    {routine.channel === "direct-message"
                      ? "私信"
                      : `#${routine.channel}`}
                    <BrandMark brand={routine.model} />
                  </div>
                  <div
                    className="ml-auto flex gap-1"
                    aria-label="最近 14 次演示运行"
                  >
                    {Array.from({ length: 14 }, (_, n) => (
                      <div
                        key={n}
                        title={n === i + 3 ? "运行失败" : "运行成功"}
                        className={cn(
                          "h-4 w-1 rounded-sm",
                          n === i + 3 ? "bg-destructive/60" : "bg-success/40"
                        )}
                      />
                    ))}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => run(routine)}
                  >
                    {routine.running ? (
                      <Square data-icon="inline-start" />
                    ) : (
                      <Play data-icon="inline-start" />
                    )}
                    {routine.running ? "停止" : "立即运行"}
                  </Button>
                </div>
                {routine.running && <Progress value={50} className="h-1" />}
              </div>
            </div>
            <CollapsibleContent>
              <div className="mt-5 flex flex-col gap-4 sm:pl-7">
                <div className="rounded-lg bg-muted p-3">
                  <div className="mb-2 flex items-center gap-2 text-xs font-medium">
                    <Check className="size-3.5 text-success" />
                    最近一次演示报告
                  </div>
                  <p className="text-xs leading-6 text-muted-foreground">
                    已检查 9 项动态，其中 2 项需要关注，其余 7
                    项进展正常。已起草摘要，发送目标：
                    {routine.channel === "direct-message"
                      ? "私信"
                      : `#${routine.channel}`}
                    .
                  </p>
                </div>
                <FieldGroup className="gap-3">
                  <Field>
                    <FieldLabel htmlFor={`instruction-${routine.id}`}>
                      任务说明
                    </FieldLabel>
                    <Textarea
                      id={`instruction-${routine.id}`}
                      value={routine.instruction}
                      onChange={(e) =>
                        update(routine.id, { instruction: e.target.value })
                      }
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field>
                      <FieldLabel htmlFor={`frequency-${routine.id}`}>
                        重复周期
                      </FieldLabel>
                      <Select
                        items={frequencyLabels}
                        value={routine.frequency}
                        onValueChange={(frequency) => {
                          if (frequency) update(routine.id, { frequency })
                        }}
                      >
                        <SelectTrigger id={`frequency-${routine.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {["Weekdays", "Every day", "Fridays"].map((f) => (
                              <SelectItem value={f} key={f}>
                                {frequencyLabels[f]}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field>
                      <FieldLabel htmlFor={`time-${routine.id}`}>
                        时间
                      </FieldLabel>
                      <Input
                        id={`time-${routine.id}`}
                        type="time"
                        value={routine.time}
                        onChange={(e) =>
                          update(routine.id, { time: e.target.value })
                        }
                      />
                    </Field>
                  </div>
                </FieldGroup>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock3 className="size-3.5" />
                  修改会立即应用到当前预览。
                  <StatusBadge status={routine.enabled ? "success" : "neutral"}>
                    {routine.enabled ? "已启用" : "已暂停"}
                  </StatusBadge>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </AgentPanel>
  )
}
