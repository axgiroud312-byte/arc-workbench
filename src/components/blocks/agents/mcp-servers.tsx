import { useState } from "react"
import { ChevronDown, Link, Plus, Search, Shield, Trash2 } from "lucide-react"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../../ui/input-group"
import { Switch } from "../../ui/switch"
import { Field, FieldGroup, FieldLabel } from "../../ui/field"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { Badge } from "../../ui/badge"
import { Progress } from "../../ui/progress"
import { toast } from "../../ui/toast"
import { StatusBadge } from "../shared"
import { AgentPanel, DemoNote, IntegrationMark, useTimers } from "./common"

type Server = {
  id: string
  name: string
  state: "connected" | "signin" | "error"
  enabled: boolean
  permission: string
  local?: boolean
  tools: { name: string; enabled: boolean; tokens: number; write?: boolean }[]
}
const makeServer = (
  id: string,
  name: string,
  names: string[],
  state: Server["state"] = "connected",
  local = false
): Server => ({
  id,
  name,
  state,
  enabled: true,
  permission: "ask",
  local,
  tools: names.map((name, i) => ({
    name,
    enabled: i !== 3,
    tokens: 210 + i * 55,
    write: i % 3 === 2,
  })),
})
const initial = [
  makeServer("github", "GitHub", [
    "搜索仓库",
    "读取文件",
    "创建合并请求",
    "删除分支",
    "列出工单",
  ]),
  makeServer("linear", "Linear", ["搜索工单", "读取工单", "创建工单"]),
  makeServer(
    "notion",
    "Notion",
    ["搜索页面", "读取页面", "更新页面"],
    "signin"
  ),
  makeServer("slack", "Slack", ["搜索消息", "读取会话", "发送消息"]),
  makeServer(
    "sentry",
    "Sentry",
    ["列出错误", "读取事件", "标记问题已解决"],
    "error"
  ),
  makeServer("stripe", "Stripe", ["列出客户", "读取扣款记录", "创建退款"]),
  makeServer(
    "postgres",
    "PostgreSQL",
    ["查询数据库", "读取数据库结构", "执行数据库迁移"],
    "connected",
    true
  ),
  makeServer("figma", "Figma", ["读取设计", "导出资源"], "connected", true),
]
const directory = [
  { id: "google-drive", name: "Google Drive" },
  { id: "brave-search", name: "Brave Search" },
  { id: "filesystem", name: "文件系统" },
  { id: "google-calendar", name: "Google Calendar" },
]

export function McpServers() {
  const [servers, setServers] = useState(initial)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [search, setSearch] = useState("")
  const [url, setUrl] = useState("")
  const [connecting, setConnecting] = useState<string | null>(null)
  const later = useTimers()
  const active = servers.filter((s) => s.state === "connected" && s.enabled)
  const tools = active.flatMap((s) => s.tools.filter((t) => t.enabled))
  const tokens = tools.reduce((sum, t) => sum + t.tokens, 0)
  const update = (id: string, patch: Partial<Server>) =>
    setServers((items) =>
      items.map((s) => (s.id === id ? { ...s, ...patch } : s))
    )
  const connect = (server: Server) => {
    setConnecting(server.id)
    later(() => {
      setServers((items) =>
        items.some((s) => s.id === server.id)
          ? items.map((s) =>
              s.id === server.id ? { ...s, state: "connected" } : s
            )
          : [{ ...server, state: "connected" }, ...items]
      )
      setConnecting(null)
      setAdding(false)
    }, 1100)
  }
  const customValid = (() => {
    try {
      return ["http:", "https:"].includes(new URL(url).protocol)
    } catch {
      return false
    }
  })()
  return (
    <AgentPanel
      title="MCP 服务器"
      description="管理智能体可使用的工具。"
      action={
        <Button variant="outline" size="sm" onClick={() => setAdding(true)}>
          <Plus data-icon="inline-start" />
          添加服务器
        </Button>
      }
      footer={<DemoNote>连接和授权均为本地演示</DemoNote>}
    >
      <div className="flex flex-col gap-5">
        <div>
          <div className="mb-2 flex items-center justify-between gap-3 text-xs">
            <span>
              <strong className="font-medium">{tools.length} 个工具</strong>{" "}
              <span className="text-muted-foreground">
                · {(tokens / 1000).toFixed(1)} 千词元上下文
              </span>
            </span>
            <span className="text-muted-foreground">8 千词元上限</span>
          </div>
          <Progress value={Math.min(tokens / 80, 100)} className="h-1.5" />
        </div>
        <div className="flex flex-col gap-1">
          {servers.map((server) => {
            const enabledTools = server.tools.filter((t) => t.enabled)
            return (
              <Collapsible
                key={server.id}
                open={expanded === server.id}
                className="rounded-xl border border-transparent p-3 data-open:border-border data-open:bg-muted/20"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted/30">
                    <IntegrationMark name={server.id} className="size-4" />
                  </div>
                  <button
                    type="button"
                    aria-expanded={expanded === server.id}
                    className="flex min-w-0 flex-1 flex-col gap-1 text-left"
                    onClick={() =>
                      setExpanded(expanded === server.id ? null : server.id)
                    }
                  >
                    <span className="flex items-center gap-2 text-sm font-medium">
                      {server.name}
                      <ChevronDown className="size-3 text-muted-foreground" />
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {server.state === "connected"
                        ? server.enabled
                          ? "已连接"
                          : "已暂停"
                        : server.state === "signin"
                          ? "需要登录"
                          : "连接失败"}{" "}
                      · {server.local ? "本地" : "远程"}
                    </span>
                  </button>
                  {server.state !== "connected" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={connecting === server.id}
                      onClick={() => connect(server)}
                    >
                      {connecting === server.id
                        ? "正在连接…"
                        : server.state === "signin"
                          ? "模拟登录"
                          : "重试"}
                    </Button>
                  ) : (
                    <>
                      <span className="hidden text-right text-xs text-muted-foreground sm:block">
                        {enabledTools.length} / {server.tools.length} 个工具
                        <br />
                        {server.enabled
                          ? enabledTools
                              .reduce((sum, t) => sum + t.tokens, 0)
                              .toLocaleString()
                          : 0}{" "}
                        词元
                      </span>
                      <Switch
                        aria-label={`启用 ${server.name}`}
                        checked={server.enabled}
                        onCheckedChange={(enabled) =>
                          update(server.id, { enabled })
                        }
                      />
                    </>
                  )}
                </div>
                <CollapsibleContent>
                  <div className="mt-4 flex flex-col gap-4 sm:pl-12">
                    <div className="flex flex-col gap-3">
                      {server.tools.map((tool, i) => (
                        <div
                          key={tool.name}
                          className="flex items-center gap-3"
                        >
                          <span className="min-w-0 flex-1 text-xs">
                            {tool.name}
                          </span>
                          <Badge variant="outline">
                            {tool.write ? "写入" : "读取"}
                          </Badge>
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {tool.tokens}
                          </span>
                          <Switch
                            aria-label={`${server.name}: ${tool.name}`}
                            checked={tool.enabled}
                            onCheckedChange={(enabled) =>
                              update(server.id, {
                                tools: server.tools.map((t, n) =>
                                  n === i ? { ...t, enabled } : t
                                ),
                              })
                            }
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Shield className="size-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        工具调用权限
                      </span>
                      <Select
                        items={{ ask: "每次询问", reads: "始终允许读取" }}
                        value={server.permission}
                        onValueChange={(permission) => {
                          if (permission) update(server.id, { permission })
                        }}
                      >
                        <SelectTrigger size="sm" className="ml-auto w-auto">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="ask">每次询问</SelectItem>
                            <SelectItem value="reads">始终允许读取</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="truncate font-mono text-[11px] text-muted-foreground">
                        {server.local
                          ? `stdio://${server.id}`
                          : `https://mcp.${server.id}.example`}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setServers((items) =>
                            items.filter((s) => s.id !== server.id)
                          )
                          const toastId = toast.add({
                            title: `已移除 ${server.name}`,
                            actionProps: {
                              children: "撤销",
                              onClick: () => {
                                setServers((items) => [...items, server])
                                toast.close(toastId)
                              },
                            },
                          })
                        }}
                      >
                        <Trash2 data-icon="inline-start" />
                        移除
                      </Button>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )
          })}
        </div>
      </div>
      <Dialog open={adding} onOpenChange={setAdding}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加 MCP 服务器</DialogTitle>
            <DialogDescription>
              选择应用或输入自定义地址。本演示不会连接实际服务器。
            </DialogDescription>
          </DialogHeader>
          <InputGroup>
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索服务器…"
              aria-label="搜索服务器目录"
            />
          </InputGroup>
          <div className="flex flex-col gap-2">
            {directory
              .filter((server) =>
                server.name.toLowerCase().includes(search.toLowerCase())
              )
              .map(({ id, name }) => (
                <button
                  key={name}
                  disabled={connecting !== null}
                  type="button"
                  className="flex items-center gap-3 rounded-lg border p-3 text-left text-sm hover:bg-muted"
                  onClick={() =>
                    connect(
                      makeServer(id, name, ["搜索内容", "读取内容", "创建内容"])
                    )
                  }
                >
                  <IntegrationMark name={id} className="size-4" />
                  <span className="flex-1">{name}</span>
                  <StatusBadge status={connecting ? "running" : "neutral"}>
                    {connecting === id ? "正在发现工具" : "连接"}
                  </StatusBadge>
                </button>
              ))}
          </div>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="mcp-url">自定义服务器地址</FieldLabel>
              <Input
                id="mcp-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/mcp"
              />
            </Field>
          </FieldGroup>
          <Button
            disabled={!customValid || connecting !== null}
            onClick={() =>
              connect(
                makeServer(`custom-${Date.now()}`, new URL(url).hostname, [
                  "搜索",
                  "读取资源",
                ])
              )
            }
          >
            <Link data-icon="inline-start" />
            连接演示服务器
          </Button>
        </DialogContent>
      </Dialog>
    </AgentPanel>
  )
}
