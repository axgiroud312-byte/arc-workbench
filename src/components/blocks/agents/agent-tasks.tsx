import { useEffect, useState } from "react"
import {
  Archive,
  Check,
  ChevronDown,
  Circle,
  GitBranch,
  GitPullRequest,
  Loader2,
  Plus,
  RotateCcw,
  Square,
} from "lucide-react"
import { Button } from "../../ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupTextarea,
} from "../../ui/input-group"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select"
import { Tabs, TabsList, TabsTrigger } from "../../ui/tabs"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../ui/collapsible"
import { toast } from "../../ui/toast"
import { BrandMark, StatusBadge } from "../shared"
import { AgentPanel, DemoNote } from "./common"
const taskStatusLabels = {
  running: "运行中",
  ready: "等待审核",
  merged: "已合并",
  failed: "失败",
  cancelled: "已取消",
}

type Task = {
  id: number
  title: string
  state: "running" | "ready" | "merged" | "failed" | "cancelled"
  progress: number
  pr?: number
  repo?: string
  model?: string
}
const initial: Task[] = [
  {
    id: 1,
    title: "修复持续集成中偶发失败的结账测试",
    state: "running",
    progress: 2,
  },
  {
    id: 2,
    title: "为公开 API 添加请求限流",
    state: "ready",
    progress: 5,
  },
  {
    id: 3,
    title: "升级 Zod 到 v4 并修复类型定义",
    state: "ready",
    progress: 5,
    pr: 479,
  },
  {
    id: 4,
    title: "为失败的 Webhook 投递添加退避重试",
    state: "failed",
    progress: 3,
  },
  {
    id: 5,
    title: "移除已弃用的 invoices v1 接口",
    state: "merged",
    progress: 5,
    pr: 476,
  },
]
const logs = [
  "已克隆仓库的 main 分支",
  "已安装依赖",
  "已读取相关源文件",
  "已完成修改和测试",
  "已运行检查，等待审核",
]
export function AgentTasks() {
  const [tasks, setTasks] = useState(initial)
  const [prompt, setPrompt] = useState("")
  const [filter, setFilter] = useState("all")
  const [repo, setRepo] = useState("arc-ui/web")
  const [model, setModel] = useState("Opus 5.5")
  useEffect(() => {
    if (!tasks.some((t) => t.state === "running")) return
    const timer = setInterval(
      () =>
        setTasks((items) =>
          items.map((t) =>
            t.state !== "running"
              ? t
              : {
                  ...t,
                  progress: t.progress + 1,
                  state: t.progress >= 4 ? "ready" : "running",
                }
          )
        ),
      1600
    )
    return () => clearInterval(timer)
  }, [tasks])
  const update = (id: number, patch: Partial<Task>) =>
    setTasks((items) =>
      items.map((t) => (t.id === id ? { ...t, ...patch } : t))
    )
  const start = () => {
    if (!prompt.trim()) return
    setTasks((items) => [
      {
        id: Date.now(),
        title: prompt.trim(),
        state: "running",
        progress: 0,
        repo,
        model,
      },
      ...items,
    ])
    setPrompt("")
    setFilter("all")
  }
  return (
    <AgentPanel
      title="后台智能体任务"
      description="提交任务，完成后回来审核修改。"
      footer={<DemoNote />}
    >
      <div className="flex flex-col gap-5">
        <InputGroup>
          <InputGroupTextarea
            aria-label="描述任务"
            placeholder="描述要完成的任务…"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === "Enter") start()
            }}
          />
          <InputGroupAddon align="block-end" className="flex-wrap">
            <Select
              value={repo}
              onValueChange={(value) => {
                if (value) setRepo(value)
              }}
            >
              <SelectTrigger size="sm" className="w-auto">
                <BrandMark brand="github" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {["arc-ui/web", "arc-ui/api", "arc-ui/billing"].map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <GitBranch className="size-3" />
              main
            </span>
            <Select
              value={model}
              onValueChange={(value) => {
                if (value) setModel(value)
              }}
            >
              <SelectTrigger size="sm" className="w-auto">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {["Opus 5.5", "Sonnet 5.5", "GPT-6.1 Sol"].map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Button
              className="ml-auto"
              size="sm"
              disabled={!prompt.trim()}
              onClick={start}
            >
              <Plus data-icon="inline-start" />
              开始
            </Button>
          </InputGroupAddon>
        </InputGroup>
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList className="max-w-full overflow-x-auto">
            {[
              ["all", "全部"],
              ["running", "运行中"],
              ["ready", "待审核"],
              ["merged", "已合并"],
            ].map(([value, title]) => (
              <TabsTrigger key={value} value={value}>
                {title}
                <span className="ml-1 text-xs text-muted-foreground">
                  {
                    tasks.filter((t) => value === "all" || t.state === value)
                      .length
                  }
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="flex flex-col gap-3">
          {tasks
            .filter((t) => filter === "all" || t.state === filter)
            .map((task) => (
              <Collapsible key={task.id} className="rounded-xl border p-4">
                <div className="flex flex-col gap-3">
                  <CollapsibleTrigger className="flex w-full items-start justify-between gap-3 text-left">
                    <span className="text-sm font-medium">{task.title}</span>
                    <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                  </CollapsibleTrigger>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <BrandMark brand="github" className="size-3.5" />
                    {task.repo ?? "arc-ui/web"}
                    <GitBranch className="ml-1 size-3.5" />
                    <span>agent/task-{task.id > 5 ? "new" : task.id}</span>
                    <BrandMark
                      brand={
                        (task.model ?? "Opus 5.5").startsWith("GPT")
                          ? "openai"
                          : "claude"
                      }
                    />
                    {task.model ?? "Opus 5.5"}
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge
                        status={
                          task.state === "running"
                            ? "running"
                            : task.state === "failed"
                              ? "error"
                              : task.state === "cancelled"
                                ? "neutral"
                                : "success"
                        }
                      >
                        {task.state === "ready"
                          ? "等待审核"
                          : taskStatusLabels[task.state]}
                      </StatusBadge>
                      {task.state === "running" && (
                        <span className="text-xs text-muted-foreground">
                          {logs[Math.min(task.progress, 4)]}
                        </span>
                      )}
                      {task.state === "ready" && (
                        <span className="text-xs text-muted-foreground">
                          <span className="text-success">+125</span>{" "}
                          <span className="text-destructive">−18</span> · 7
                          个文件
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {task.state === "running" ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            update(task.id, { state: "cancelled" })
                          }
                        >
                          <Square data-icon="inline-start" />
                          取消
                        </Button>
                      ) : task.state === "failed" ||
                        task.state === "cancelled" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            update(task.id, { state: "running", progress: 0 })
                          }
                        >
                          <RotateCcw data-icon="inline-start" />
                          重试
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            task.pr
                              ? update(task.id, { state: "merged" })
                              : update(task.id, { pr: 480 + task.id })
                          }
                          disabled={task.state === "merged"}
                        >
                          <GitPullRequest data-icon="inline-start" />
                          {task.pr
                            ? task.state === "merged"
                              ? `合并请求 #${task.pr} 已合并`
                              : `合并演示请求 #${task.pr}`
                            : "创建演示合并请求"}
                        </Button>
                      )}
                      {task.state !== "running" && (
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          aria-label={`归档任务：${task.title}`}
                          onClick={() => {
                            setTasks((items) =>
                              items.filter((t) => t.id !== task.id)
                            )
                            const toastId = toast.add({
                              title: "任务已归档",
                              actionProps: {
                                children: "撤销",
                                onClick: () => {
                                  setTasks((items) => [...items, task])
                                  toast.close(toastId)
                                },
                              },
                            })
                          }}
                        >
                          <Archive />
                        </Button>
                      )}
                    </div>
                  </div>
                  <CollapsibleContent>
                    <ol className="flex flex-col gap-3 rounded-lg bg-muted/50 p-3 text-xs">
                      {logs.map((log, i) => (
                        <li
                          key={log}
                          className="flex items-center gap-2 text-muted-foreground"
                        >
                          {i < task.progress ? (
                            <Check className="size-3.5 text-success" />
                          ) : i === task.progress &&
                            task.state === "running" ? (
                            <Loader2 className="size-3.5 motion-safe:animate-spin" />
                          ) : (
                            <Circle className="size-3.5" />
                          )}
                          {log}
                        </li>
                      ))}
                    </ol>
                    {task.state === "failed" && (
                      <p className="mt-3 text-xs text-destructive">
                        sender.test.ts：重试在 5000 毫秒后超时。
                      </p>
                    )}
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ))}
        </div>
        {tasks.filter((t) => filter === "all" || t.state === filter).length ===
          0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            这个分类下还没有任务。
          </p>
        )}
      </div>
    </AgentPanel>
  )
}
