import { useCallback, useReducer, useState } from "react"
import { ChevronRight, GitBranch, PanelLeft, PanelRight } from "lucide-react"
import { Button } from "../../ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../ui/sheet"
import { ToggleGroup, ToggleGroupItem } from "../../ui/toggle-group"
import {
  AiChat,
  originalChatBranchId,
  type ChatBranch,
  type ChatSummary,
} from "../ai-conversation/ai-chat"
import { StatusBadge } from "../shared"
import {
  completedCodingActivity,
  codingDemoPrompt,
  codingDemoReply,
  codingDemoTitle,
  codingPreviewFrame,
  codingPreviewStates,
  imeOnlyCodingFrame,
  inspectedCodingActivity,
  type CodingPreviewState,
} from "./coding-demo"
import {
  CodingSettings,
  useCodingPreferences,
  type CodingPreferences,
} from "./coding-settings"
import {
  CodingSidebar,
  codingProject,
  type SessionSummary,
} from "./coding-sidebar"
import { CodingWorkspace } from "./coding-workspace"
import {
  multiAgentPrompt,
  multiAgentSelection,
  multiAgentTitle,
  multiAgentTurnId,
  useMultiAgentPreview,
  type MultiAgentScenario,
} from "./multi-agent-demo"
import { MultiAgentPreviewPicker } from "./multi-agent-orchestration"
import {
  getPendingRequest,
  getRunState,
  getWorkers,
  runStates,
  type RunSelection,
  type WorkspaceView,
} from "./run-record"

type Session = ChatSummary & { id: string }
type WorkbenchPreview =
  | { kind: "status"; state: CodingPreviewState }
  | { kind: "multi-agent"; state: MultiAgentScenario }

const orchestrationSessionId = "multi-agent-demo"

const investigation: Session["messages"] = [
  {
    id: "investigate",
    role: "user",
    content: "先排查中文输入法选字时为什么会误发送。",
  },
  {
    id: "investigation",
    role: "assistant",
    model: "sonnet",
    content:
      "已复现问题。组字期间按回车会直接提交，问题在输入框的键盘处理函数。",
    activity: inspectedCodingActivity,
  },
]
const exampleSession: Session = {
  id: "keyboard-demo",
  title: codingDemoTitle,
  model: "sonnet",
  running: false,
  messages: [
    ...investigation,
    { id: "fix", role: "user", content: codingDemoPrompt },
    {
      id: "fix-result",
      role: "assistant",
      model: "sonnet",
      content: codingDemoReply,
      activity: completedCodingActivity,
    },
  ],
}
const exampleBranches: ChatBranch[] = [
  {
    id: "ime-only",
    title: "仅验证输入法",
    messages: [
      ...investigation,
      { id: "ime-fix", role: "user", content: "修复后只验证中文输入法选字。" },
      {
        id: "ime-fix-result",
        role: "assistant",
        model: "sonnet",
        ...imeOnlyCodingFrame,
      },
    ],
  },
]
const exampleSessions: Session[] = [
  exampleSession,
  {
    id: "ime-diagnosis",
    title: "复现输入法选字问题",
    model: "gemini",
    running: false,
    messages: investigation.map((message) => ({
      ...message,
      model: message.role === "assistant" ? "gemini" : undefined,
    })),
  },
]

function initialSessions(state: CodingPreviewState | undefined): Session[] {
  if (!state) return exampleSessions
  const frame = codingPreviewFrame(state)
  return [
    {
      ...exampleSession,
      running: state === "running" || !!getPendingRequest(frame.activity),
      messages: exampleSession.messages.map((message) =>
        message.id === "fix-result" ? { ...message, ...frame } : message
      ),
    },
    exampleSessions[1],
  ]
}

type WorkbenchLayout = {
  screen: "conversation" | "settings"
  narrowPane: "conversation" | "inspector"
  inspectorOpen: boolean
  railOpen: boolean
}
type LayoutAction =
  | "open-settings"
  | "return"
  | "show-conversation"
  | "open-inspector"
  | "close-inspector"
  | "toggle-rail"

function layoutReducer(
  state: WorkbenchLayout,
  action: LayoutAction
): WorkbenchLayout {
  switch (action) {
    case "open-settings":
      return { ...state, screen: "settings" }
    case "return":
      return { ...state, screen: "conversation" }
    case "show-conversation":
      return { ...state, screen: "conversation", narrowPane: "conversation" }
    case "open-inspector":
      return { ...state, inspectorOpen: true, narrowPane: "inspector" }
    case "close-inspector":
      return { ...state, inspectorOpen: false, narrowPane: "conversation" }
    case "toggle-rail":
      return { ...state, railOpen: !state.railOpen }
  }
}

function sidebarSummary(session: Session): SessionSummary {
  const activity = session.messages.at(-1)?.activity
  const pending = getPendingRequest(activity)
  const status = getRunState(activity, undefined, session.running)
  const worker = getWorkers(activity).find((item) =>
    pending
      ? item.id === pending.workerId
      : status === "error" && item.status === "error"
  )
  return {
    id: session.id,
    title: session.title,
    model: session.model,
    status,
    detail: worker?.title,
  }
}

function conversationScope(sessionId: string, branchId = originalChatBranchId) {
  return sessionId + "/" + branchId
}

export function CodingAgentPanel() {
  const [preferences, setPreferences] = useCodingPreferences()
  const [preview, setPreview] = useState<{
    scene: WorkbenchPreview
    revision: number
  }>()
  const statusScene =
    preview?.scene.kind === "status" ? preview.scene.state : undefined
  const multiScene =
    preview?.scene.kind === "multi-agent" ? preview.scene.state : undefined

  function showPreview(scene: WorkbenchPreview) {
    setPreview((current) => ({ scene, revision: (current?.revision ?? 0) + 1 }))
  }

  return (
    <section
      className="coding-agent-shell w-full min-w-0"
      aria-label="编程 Agent 面板"
    >
      <header className="flex shrink-0 flex-wrap items-center gap-x-5 gap-y-2 border-b bg-sidebar px-3 py-2">
        <div className="coding-preview-toolbar-group flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            状态预览
          </span>
          <ToggleGroup
            aria-label="状态预览"
            size="sm"
            variant="outline"
            spacing={1}
            className="coding-preview-states min-w-0 flex-wrap"
            value={
              statusScene ? [statusScene] : preview ? [] : ["conversation"]
            }
            onValueChange={([value]) => {
              if (value === "conversation") {
                setPreview(undefined)
                return
              }
              const state = value
                ? codingPreviewStates.find((item) => item === value)
                : statusScene
              if (state) showPreview({ kind: "status", state })
            }}
          >
            <ToggleGroupItem value="conversation">正常对话</ToggleGroupItem>
            {codingPreviewStates.map((state) => (
              <ToggleGroupItem key={state} value={state}>
                {runStates[state].label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <div className="coding-preview-toolbar-group flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            多子 Agent 编排
          </span>
          <MultiAgentPreviewPicker
            value={multiScene}
            onPick={(state) => showPreview({ kind: "multi-agent", state })}
          />
        </div>
      </header>
      <div className="min-h-0 flex-1" hidden={!!preview}>
        <CodingWorkbench
          preferences={preferences}
          onPreferencesChange={setPreferences}
        />
      </div>
      {preview && (
        <div className="min-h-0 flex-1">
          <CodingWorkbench
            key={preview.revision}
            preview={preview.scene}
            preferences={preferences}
            onPreferencesChange={setPreferences}
          />
        </div>
      )}
    </section>
  )
}

function CodingWorkbench({
  preview,
  preferences,
  onPreferencesChange,
}: {
  preview?: WorkbenchPreview
  preferences: CodingPreferences
  onPreferencesChange: (preferences: CodingPreferences) => void
}) {
  const statusScene = preview?.kind === "status" ? preview.state : undefined
  const multiScene = preview?.kind === "multi-agent" ? preview.state : undefined
  const orchestration = useMultiAgentPreview(multiScene)
  const [layout, dispatch] = useReducer(layoutReducer, {
    screen: "conversation",
    narrowPane: "conversation",
    inspectorOpen: preview ? true : (preferences.inspectorOnLaunch ?? true),
    railOpen: true,
  })
  const [sessions, setSessions] = useState(() =>
    multiScene ? [exampleSessions[1]] : initialSessions(statusScene)
  )
  const previewPaused =
    statusScene === "running" ||
    statusScene === "question" ||
    statusScene === "approval"
  const [activeId, setActiveId] = useState(
    multiScene ? orchestrationSessionId : exampleSession.id
  )
  const [inspections, setInspections] = useState<Record<string, RunSelection>>(
    (): Record<string, RunSelection> => {
      const initial = multiScene && multiAgentSelection(multiScene)
      return initial && initial.workerId
        ? { [conversationScope(orchestrationSessionId)]: initial }
        : {}
    }
  )
  const [views, setViews] = useState<Record<string, WorkspaceView>>({})
  const [requestFocus, setRequestFocus] = useState({ sessionId: "", count: 0 })
  const [sheetOpen, setSheetOpen] = useState(false)

  const orchestrationSession: Session | undefined = orchestration && {
    id: orchestrationSessionId,
    title: multiAgentTitle,
    model: "sonnet",
    running: orchestration.activity.steps.some(
      (step) => step.status === "running"
    ),
    messages: [
      {
        id: multiAgentTurnId + "-prompt",
        role: "user",
        content: multiAgentPrompt,
      },
      {
        id: multiAgentTurnId,
        role: "assistant",
        model: "sonnet",
        activity: orchestration.activity,
        content: orchestration.content,
      },
    ],
  }
  const visibleSessions = orchestrationSession
    ? [orchestrationSession, ...sessions]
    : sessions
  const session =
    visibleSessions.find((item) => item.id === activeId) ?? exampleSession
  const scope = conversationScope(session.id, session.branchId)
  const latestActivity = session.messages.at(-1)?.activity
  const state = getRunState(latestActivity, undefined, session.running)
  const status = runStates[state]
  const turns = session.messages.flatMap((message, index) => {
    if (message.role !== "assistant") return []
    return [
      {
        id: message.id,
        label: session.messages[index - 1]?.content,
        activity: message.activity,
      },
    ]
  })
  const latest = turns.at(-1)
  const inspection = inspections[scope]
  const inspectedTurn = turns.find((item) => item.id === inspection?.turnId)
  const turn = inspectedTurn ?? latest
  const worker = getWorkers(turn?.activity).find(
    (item) => item.id === inspection?.workerId
  )
  const selection = turn ? { turnId: turn.id, workerId: worker?.id } : undefined
  const view = views[activeId] ?? "overview"

  const updateSession = useCallback((id: string, summary: ChatSummary) => {
    setSessions((current) =>
      current.map((item) => (item.id === id ? { ...item, ...summary } : item))
    )
  }, [])

  function openSession(id: string) {
    const target = visibleSessions.find((item) => item.id === id)
    if (getPendingRequest(target?.messages.at(-1)?.activity)) {
      setRequestFocus(({ count }) => ({ sessionId: id, count: count + 1 }))
    }
    setActiveId(id)
    setSheetOpen(false)
    dispatch("show-conversation")
  }

  function createSession() {
    const id = crypto.randomUUID()
    setSessions((current) => [
      {
        id,
        title: "新对话",
        model: preferences.defaultModel,
        running: false,
        messages: [],
      },
      ...current,
    ])
    openSession(id)
  }

  function inspect(next: RunSelection, nextView?: WorkspaceView) {
    setInspections((current) => ({ ...current, [scope]: next }))
    if (nextView) setView(nextView)
    dispatch("open-inspector")
  }

  function setView(next: WorkspaceView) {
    setViews((current) => ({ ...current, [activeId]: next }))
  }

  function followLatest() {
    setInspections((current) => {
      const next = { ...current }
      delete next[scope]
      return next
    })
  }

  const sidebarProps = {
    sessions: visibleSessions.map(sidebarSummary),
    activeId,
    onSelect: openSession,
    onNew: createSession,
    onSettings: () => {
      setSheetOpen(false)
      dispatch("open-settings")
    },
  }

  return (
    <div
      className="coding-agent-layout"
      data-screen={layout.screen}
      data-rail={layout.railOpen ? "open" : "closed"}
      data-inspector={layout.inspectorOpen ? "open" : "closed"}
      data-inspector-view={view === "overview" ? "overview" : "detail"}
      data-narrow-pane={layout.narrowPane}
    >
      <aside
        className="coding-agent-sidebar min-h-0 min-w-0"
        aria-label="会话侧边栏"
      >
        <CodingSidebar
          {...sidebarProps}
          onCollapse={() => dispatch("toggle-rail")}
        />
      </aside>
      <div className="coding-agent-chat flex min-h-0 min-w-0 flex-col">
        <header className="coding-agent-titlebar coding-rail-title flex min-w-0 shrink-0 items-center gap-2 px-3 sm:px-4">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="coding-agent-sidebar-trigger"
                  aria-label="打开会话侧边栏"
                />
              }
            >
              <PanelLeft />
            </SheetTrigger>
            <SheetContent
              side="left"
              className="gap-0 data-[side=left]:w-72 data-[side=left]:max-w-[calc(100%-2rem)]"
            >
              <SheetHeader className="sr-only">
                <SheetTitle>会话侧边栏</SheetTitle>
                <SheetDescription>切换对话或打开设置</SheetDescription>
              </SheetHeader>
              <div className="min-h-0 flex-1">
                <CodingSidebar {...sidebarProps} />
              </div>
            </SheetContent>
          </Sheet>
          {!layout.railOpen && (
            <Button
              variant="ghost"
              size="icon-sm"
              className="coding-agent-sidebar-reopen"
              aria-label="展开会话侧边栏"
              title="展开会话侧边栏"
              onClick={() => dispatch("toggle-rail")}
            >
              <PanelLeft />
            </Button>
          )}
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span className="coding-agent-project truncate font-mono text-xs text-muted-foreground">
              {codingProject}
            </span>
            <ChevronRight className="coding-agent-project size-3 shrink-0 text-muted-foreground" />
            <h2
              className="min-w-0 truncate text-sm font-medium"
              title={session.title}
            >
              {session.title}
            </h2>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {state !== "done" && state !== "idle" && (
              <span aria-live="polite">
                <StatusBadge status={status.tone}>{status.label}</StatusBadge>
              </span>
            )}
            <span
              className="coding-agent-branch items-center gap-1.5 font-mono text-xs text-muted-foreground"
              title="示例分支"
            >
              <GitBranch className="size-3.5" /> main
            </span>
            <Button
              variant={layout.inspectorOpen ? "secondary" : "ghost"}
              size="icon-sm"
              className="coding-agent-inspector-toggle"
              aria-label={layout.inspectorOpen ? "收起右栏" : "展开右栏"}
              title={layout.inspectorOpen ? "收起右栏" : "展开右栏"}
              aria-pressed={layout.inspectorOpen}
              onClick={() =>
                dispatch(
                  layout.inspectorOpen ? "close-inspector" : "open-inspector"
                )
              }
            >
              <PanelRight />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="coding-agent-inspector-narrow"
              aria-label="查看执行记录"
              title="查看执行记录"
              onClick={() => dispatch("open-inspector")}
            >
              <PanelRight />
            </Button>
          </div>
        </header>
        <div className="coding-agent-thread min-h-0 min-w-0 flex-1">
          {visibleSessions.map(({ id, title, model, messages }) => (
            <div key={id} className="h-full min-h-0" hidden={id !== activeId}>
              <AiChat
                className="h-full"
                workspace
                orchestrationTranscript={
                  id === orchestrationSessionId && orchestration
                    ? {
                        messages,
                        running: orchestrationSession?.running,
                        onRetryWorker: (workerId) => {
                          if (orchestration.retry(workerId))
                            inspect({ turnId: multiAgentTurnId, workerId })
                        },
                      }
                    : undefined
                }
                previewPaused={previewPaused && id === exampleSession.id}
                initialMessages={messages}
                initialBranchTitle={
                  id === exampleSession.id ? "完整验证" : undefined
                }
                initialBranches={
                  !preview && id === exampleSession.id
                    ? exampleBranches
                    : undefined
                }
                initialTitle={title}
                initialModel={model}
                sessionId={id}
                onSessionChange={
                  id === orchestrationSessionId ? undefined : updateSession
                }
                confirmEdits={preferences.confirmEdits}
                askScope={preferences.askScope}
                expandDelegations={
                  id === orchestrationSessionId || preferences.expandDelegations
                }
                selection={
                  id === activeId && layout.inspectorOpen
                    ? selection
                    : undefined
                }
                onInspect={inspect}
                requestFocus={
                  id === requestFocus.sessionId ? requestFocus.count : undefined
                }
                sendMode={preferences.sendMode}
              />
            </div>
          ))}
        </div>
      </div>
      <CodingWorkspace
        sessionId={scope}
        turns={turns}
        selection={selection}
        view={view}
        followingLatest={!inspectedTurn}
        onInspect={inspect}
        onViewChange={setView}
        onFollowLatest={followLatest}
        onJumpToRequest={() => {
          setRequestFocus(({ count }) => ({
            sessionId: activeId,
            count: count + 1,
          }))
          dispatch("show-conversation")
        }}
        onClose={() => dispatch("close-inspector")}
      />
      <div className="coding-agent-settings min-h-0 min-w-0">
        <CodingSettings
          preferences={preferences}
          onChange={onPreferencesChange}
          onBack={() => dispatch("return")}
        />
      </div>
    </div>
  )
}
