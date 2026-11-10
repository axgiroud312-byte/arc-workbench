import { useState } from "react"
import arcLogo from "../../../assets/arc.svg"
import {
  ChevronRight,
  CircleAlert,
  CircleStop,
  Filter,
  FolderGit2,
  Loader2,
  MessageCircleQuestion,
  MessageSquare,
  PanelLeftClose,
  Search,
  Settings2,
  ShieldQuestion,
  SquarePen,
  type LucideIcon,
} from "lucide-react"
import { Button } from "../../ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../../ui/input-group"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "../../ui/sidebar"
import { getDemoModel } from "../ai-conversation/model-picker"
import { BrandMark } from "../shared"
import { runStates, type RunState } from "./run-record"

export type SessionSummary = {
  id: string
  title: string
  model?: string
  status?: RunState
  detail?: string
}

export const codingProject = "chat-workbench"
const filters = {
  all: "全部会话",
  attention: "待你处理",
  running: "执行中",
} as const
type FilterMode = keyof typeof filters
const needsAttention = (status?: RunState) =>
  status === "approval" || status === "question" || status === "error"
const statusIndicators: Partial<
  Record<RunState, { icon: LucideIcon; className: string }>
> = {
  running: {
    icon: Loader2,
    className: "text-muted-foreground motion-safe:animate-spin",
  },
  question: { icon: MessageCircleQuestion, className: "text-warning" },
  approval: { icon: ShieldQuestion, className: "text-warning" },
  error: { icon: CircleAlert, className: "text-destructive" },
  stopped: { icon: CircleStop, className: "text-muted-foreground" },
}

export function CodingSidebar({
  sessions,
  activeId,
  onSelect,
  onNew,
  onSettings,
  onCollapse,
  settingsOpen = false,
}: {
  sessions: SessionSummary[]
  activeId: string
  onSelect: (id: string) => void
  onNew: () => void
  onSettings: () => void
  onCollapse?: () => void
  settingsOpen?: boolean
}) {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<FilterMode>("all")
  const [projectOpen, setProjectOpen] = useState(true)
  const query = search.trim().toLowerCase()
  const attention = sessions.filter(({ status }) =>
    needsAttention(status)
  ).length
  const visible = sessions.filter(({ title, status, detail }) => {
    const matchesQuery = [
      title,
      status && runStates[status].label,
      detail,
    ].some((value) => value?.toLowerCase().includes(query))
    if (filter === "attention") return matchesQuery && needsAttention(status)
    if (filter === "running") return matchesQuery && status === "running"
    return matchesQuery
  })

  function newSession() {
    setSearch("")
    setFilter("all")
    setProjectOpen(true)
    onNew()
  }

  return (
    <SidebarProvider className="h-full min-h-0">
      <Sidebar
        collapsible="none"
        className="coding-session-rail w-full min-w-0"
      >
        <SidebarHeader className="gap-2.5 px-3 pt-0">
          <div className="coding-rail-title flex items-center gap-2 px-1">
            <img src={arcLogo} alt="" className="size-5" />
            <span className="flex-1 font-medium">Arc 工作台</span>
            {onCollapse && (
              <Button
                variant="ghost"
                size="icon-sm"
                className="coding-agent-sidebar-collapse"
                title="收起会话侧边栏"
                aria-label="收起会话侧边栏"
                onClick={onCollapse}
              >
                <PanelLeftClose />
              </Button>
            )}
          </div>
          <Button
            size="sm"
            variant="secondary"
            className="w-full justify-start"
            onClick={newSession}
          >
            <SquarePen data-icon="inline-start" />
            新建对话
          </Button>
          <div className="flex gap-1.5">
            <InputGroup className="h-8 min-w-0 flex-1">
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              <InputGroupInput
                aria-label="搜索会话"
                placeholder="搜索会话"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value)
                  setProjectOpen(true)
                }}
              />
            </InputGroup>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant={filter === "all" ? "ghost" : "secondary"}
                    size="icon-sm"
                    className="relative"
                  />
                }
              >
                <Filter />
                <span className="sr-only">筛选会话</span>
                {attention > 0 && (
                  <span
                    className="coding-attention-dot"
                    aria-label={attention + " 条待处理"}
                  />
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuRadioGroup
                  value={filter}
                  onValueChange={(value) => {
                    if (
                      value === "all" ||
                      value === "attention" ||
                      value === "running"
                    ) {
                      setFilter(value)
                      setProjectOpen(true)
                    }
                  }}
                >
                  <DropdownMenuRadioItem value="all" closeOnClick>
                    {filters.all}
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="attention" closeOnClick>
                    {filters.attention}
                    {attention > 0 ? " · " + attention : ""}
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="running" closeOnClick>
                    {filters.running}
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup className="px-3 pt-2">
            <SidebarGroupLabel className="px-1.5">
              项目
              {filter !== "all" && (
                <span className="ml-auto">{filters[filter]}</span>
              )}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <Collapsible open={projectOpen} onOpenChange={setProjectOpen}>
                <CollapsibleTrigger
                  render={<SidebarMenuButton className="group/project" />}
                >
                  <ChevronRight className="group-aria-expanded/project:rotate-90" />
                  <FolderGit2 />
                  <span>{codingProject}</span>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenu className="coding-session-list ml-3 w-auto border-l pl-2">
                    {visible.map((session) => {
                      const active = session.id === activeId && !settingsOpen
                      const state = session.status ?? "idle"
                      const indicator = statusIndicators[state]
                      const Status = indicator?.icon
                      const detail = Status
                        ? [runStates[state].label, session.detail]
                            .filter(Boolean)
                            .join(" · ")
                        : ""
                      return (
                        <SidebarMenuItem key={session.id}>
                          <SidebarMenuButton
                            className={detail ? "h-11" : "h-9"}
                            isActive={active}
                            aria-current={active ? "page" : undefined}
                            title={[session.title, detail]
                              .filter(Boolean)
                              .join(" · ")}
                            onClick={() => onSelect(session.id)}
                          >
                            {session.model ? (
                              <BrandMark
                                brand={getDemoModel(session.model).brand}
                              />
                            ) : (
                              <MessageSquare />
                            )}
                            <span className="flex min-w-0 flex-1 flex-col">
                              <span className="truncate">{session.title}</span>
                              {detail && (
                                <span className="truncate text-xs font-normal text-muted-foreground">
                                  {detail}
                                </span>
                              )}
                            </span>
                            {Status && (
                              <Status
                                className={indicator.className}
                                aria-hidden="true"
                              />
                            )}
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )
                    })}
                  </SidebarMenu>
                  {!visible.length && (
                    <p className="px-4 py-2.5 text-xs text-muted-foreground">
                      {query
                        ? "没有匹配的会话"
                        : filter === "attention"
                          ? "没有待处理的会话"
                          : filter === "running"
                            ? "没有正在执行的会话"
                            : "还没有会话"}
                    </p>
                  )}
                </CollapsibleContent>
              </Collapsible>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="px-3 pt-2 pb-3">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton isActive={settingsOpen} onClick={onSettings}>
                <Settings2 />
                <span>设置</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  )
}

const sample: SessionSummary[] = [
  { id: "input", title: "修复回车误发送", model: "sonnet", status: "done" },
  { id: "tests", title: "检查登录页测试", model: "codex", status: "running" },
  {
    id: "patch",
    title: "更新输入框",
    model: "gemini",
    status: "approval",
    detail: "补回归测试",
  },
]

export function CodingSidebarDemo() {
  const [sessions, setSessions] = useState(sample)
  const [activeId, setActiveId] = useState(sample[0].id)
  const [settingsOpen, setSettingsOpen] = useState(false)
  return (
    <div className="grid min-h-96 w-full max-w-2xl overflow-hidden rounded-lg border bg-background sm:grid-cols-[15rem_minmax(0,1fr)]">
      <CodingSidebar
        sessions={sessions}
        activeId={activeId}
        onSelect={(id) => {
          setActiveId(id)
          setSettingsOpen(false)
        }}
        onNew={() => {
          const session = {
            id: crypto.randomUUID(),
            title: "新对话 " + (sessions.length - sample.length + 1),
          }
          setSessions([session, ...sessions])
          setActiveId(session.id)
          setSettingsOpen(false)
        }}
        onSettings={() => setSettingsOpen(true)}
        settingsOpen={settingsOpen}
      />
      <div className="border-l p-5 text-sm font-medium" aria-live="polite">
        {settingsOpen
          ? "工作区设置"
          : sessions.find((session) => session.id === activeId)?.title}
      </div>
    </div>
  )
}
