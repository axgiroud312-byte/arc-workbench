import { useState } from "react"
import {
  ArrowLeft,
  ChevronRight,
  FileCode2,
  FileDiff as FileDiffIcon,
  Files,
  FlaskConical,
  ListTree,
  PanelRightClose,
  SquareTerminal,
  type LucideIcon,
} from "lucide-react"
import { Button } from "../../ui/button"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../../ui/empty"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "../../ui/toggle-group"
import { Trace } from "../../ui/trace"
import { BrandMark, StatusBadge } from "../shared"
import { activityLabels } from "./activity-line"
import { CodeSample } from "./code-sample"
import {
  completedCodingActivity,
  inspectedCodingActivity,
  type AgentActivity,
} from "./coding-demo"
import { DiffPreview } from "./diff-preview"
import { FileTree, type FileNode } from "./file-tree"
import {
  getPendingRequest,
  getRunEvidence,
  getRunState,
  getUnfinishedDependencies,
  getWorkers,
  runStates,
  type RunFile,
  type RunSelection,
  type WorkspaceView,
} from "./run-record"
import { Terminal } from "./terminal"
import { TestResults } from "./test-results"
import { ToolCall } from "./tool-call"

type Turn = { id: string; label?: string; activity?: AgentActivity }
const detailTabs = [
  { id: "files", label: "文件", title: "文件浏览", icon: Files },
  { id: "changes", label: "变更", title: "代码审阅", icon: FileDiffIcon },
  { id: "terminal", label: "终端", title: "命令记录", icon: SquareTerminal },
  { id: "tests", label: "测试", title: "测试结果", icon: FlaskConical },
] as const

export function CodingWorkspace({
  sessionId = "preview",
  turns,
  selection,
  view,
  followingLatest,
  onInspect,
  onViewChange,
  onFollowLatest,
  onJumpToRequest,
  onClose,
}: {
  sessionId?: string
  turns: Turn[]
  selection?: RunSelection
  view: WorkspaceView
  followingLatest: boolean
  onInspect: (selection: RunSelection) => void
  onViewChange: (view: WorkspaceView) => void
  onFollowLatest: () => void
  onJumpToRequest?: () => void
  onClose?: () => void
}) {
  const [paths, setPaths] = useState<Record<string, string>>({})
  const scopeKey = [sessionId, selection?.turnId, selection?.workerId].join("/")
  const path = paths[scopeKey]
  const setPath = (next: string) =>
    setPaths((current) => ({ ...current, [scopeKey]: next }))
  const turnIndex = turns.findIndex((item) => item.id === selection?.turnId)
  const activity = turns[turnIndex]?.activity
  const workers = getWorkers(activity)
  const worker = workers.find((item) => item.id === selection?.workerId)
  const waitingFor =
    worker?.status === "pending"
      ? getUnfinishedDependencies(worker, workers)
      : []
  const pending = getPendingRequest(activity, worker?.id)
  const { files, commands, testRuns } = getRunEvidence(activity, worker)
  const changes = files.filter((entry) => entry.status !== "read")
  const selectedFile =
    files.find((entry) => entry.file.path === path) ?? files[0]
  const selectedDiff =
    changes.find((entry) => entry.file.path === path) ?? changes[0]
  const state = waitingFor.length
    ? { label: "等待前置任务", tone: "neutral" as const }
    : runStates[getRunState(activity, worker)]
  const detail = detailTabs.find((tab) => tab.id === view)
  const toolCalls =
    worker?.tools?.filter((tool) => tool.name !== "run_command") ?? []
  const lastTests = testRuns.at(-1)
  const cases = lastTests?.suites.flatMap((suite) => suite.tests) ?? []
  const failed = cases.filter((test) => test.failure).length
  const testLabel = failed
    ? failed + " 项失败"
    : cases.length
      ? cases.length + " 项通过"
      : lastTests
        ? activityLabels[lastTests.status]
        : undefined
  const items = turns.map((turn, index) => ({
    value: turn.id,
    label:
      "第 " +
      (index + 1) +
      " 轮" +
      (turn.label ? " · " + turn.label.slice(0, 28) : ""),
  }))

  return (
    <aside
      className="coding-agent-workspace flex min-h-0 min-w-0 flex-col"
      aria-label="执行工作区"
      data-view={detail ? "detail" : "overview"}
    >
      <header className="coding-rail-title flex min-w-0 shrink-0 items-center gap-2 px-3">
        {detail ? (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="返回执行概览"
            title="返回执行概览"
            onClick={() => onViewChange("overview")}
          >
            <ArrowLeft />
          </Button>
        ) : (
          <ListTree className="ml-1 size-4 text-muted-foreground" />
        )}
        <h3 className="min-w-0 flex-1 truncate text-sm font-medium">
          {detail?.title ?? "执行概览"}
        </h3>
        {pending && onJumpToRequest && (
          <Button size="xs" variant="ghost" onClick={onJumpToRequest}>
            {pending.kind === "approval" ? "回到审批" : "回到问题"}
          </Button>
        )}
        {onClose && (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="收起执行记录"
            title="收起执行记录"
            onClick={onClose}
          >
            <PanelRightClose />
          </Button>
        )}
      </header>
      {selection && (
        <div className="coding-inspector-scope flex min-w-0 shrink-0 flex-col gap-1.5 px-3 py-2">
          <div className="flex min-w-0 items-center gap-1.5">
            <Select
              items={items}
              value={selection.turnId}
              onValueChange={(value) => value && onInspect({ turnId: value })}
            >
              <SelectTrigger
                size="sm"
                aria-label="查看轮次"
                title={items[turnIndex]?.label}
              >
                <SelectValue>
                  {turnIndex >= 0 ? "第 " + (turnIndex + 1) + " 轮" : "轮次"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent
                align="start"
                alignItemWithTrigger={false}
                className="min-w-52"
              >
                <SelectGroup>
                  {items.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <span className="ml-auto">
              {followingLatest ? (
                <span className="px-1 text-xs text-muted-foreground">
                  跟随最新
                </span>
              ) : (
                <Button variant="ghost" size="xs" onClick={onFollowLatest}>
                  回到最新
                </Button>
              )}
            </span>
          </div>
          {worker && (
            <div
              className="flex min-w-0 items-center gap-1.5"
              aria-label="当前子任务"
            >
              <Button
                variant="ghost"
                size="xs"
                onClick={() => onInspect({ turnId: selection.turnId })}
              >
                本轮全部
              </Button>
              <ChevronRight className="size-3 shrink-0 text-muted-foreground" />
              {worker.model?.brand && <BrandMark brand={worker.model.brand} />}
              <span
                className="min-w-0 truncate text-xs font-medium"
                title={worker.title}
              >
                {worker.title}
              </span>
            </div>
          )}
          {waitingFor.length > 0 && (
            <p className="px-1 text-xs leading-5 text-muted-foreground">
              等待「{waitingFor.join("、")}」完成后开始。
            </p>
          )}
        </div>
      )}
      {!detail ? (
        <div className="coding-inspector-overview min-h-0 min-w-0 flex-1 overflow-y-auto">
          {activity ? (
            <>
              <div className="flex flex-col gap-2 px-4 pt-3 pb-2">
                <StatusBadge status={state.tone}>{state.label}</StatusBadge>
                {worker && (
                  <p className="text-sm leading-6 text-muted-foreground">
                    {worker.result ?? worker.task}
                  </p>
                )}
              </div>
              <section className="coding-inspector-group" aria-label="变更文件">
                <InspectorLink
                  icon={FileDiffIcon}
                  label="变更"
                  value={changes.length ? changes.length + " 个文件" : "无"}
                  onClick={() => onViewChange("changes")}
                />
                {changes.map((entry) => (
                  <ChangeRow
                    key={entry.file.path}
                    entry={entry}
                    onSelect={() => {
                      setPath(entry.file.path)
                      onViewChange("changes")
                    }}
                  />
                ))}
              </section>
              <section className="coding-inspector-group" aria-label="执行记录">
                <InspectorLink
                  icon={Files}
                  label="文件"
                  value={files.length + " 个"}
                  onClick={() => onViewChange("files")}
                />
                <InspectorLink
                  icon={SquareTerminal}
                  label="终端"
                  value={commands.length + " 条"}
                  onClick={() => onViewChange("terminal")}
                />
                <InspectorLink
                  icon={FlaskConical}
                  label="测试"
                  value={testLabel ?? "暂无"}
                  failed={failed > 0}
                  onClick={() => onViewChange("tests")}
                />
              </section>
              {selection && !worker && workers.length > 0 && (
                <section
                  className="coding-inspector-group"
                  aria-label="子 Agent"
                >
                  <h4 className="coding-inspector-group-title">子 Agent</h4>
                  {workers.map((item) => (
                    <Button
                      key={item.id}
                      variant="ghost"
                      size="sm"
                      className="w-full min-w-0 justify-start"
                      onClick={() =>
                        onInspect({
                          turnId: selection.turnId,
                          workerId: item.id,
                        })
                      }
                    >
                      {item.model?.brand ? (
                        <BrandMark brand={item.model.brand} />
                      ) : (
                        <ListTree data-icon="inline-start" />
                      )}
                      <span className="min-w-0 flex-1 truncate text-left">
                        {item.title}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {item.status === "pending" &&
                        getUnfinishedDependencies(item, workers).length
                          ? "等待前置"
                          : activityLabels[item.status]}
                      </span>
                      <ChevronRight data-icon="inline-end" />
                    </Button>
                  ))}
                </section>
              )}
              {toolCalls.length > 0 && (
                <section
                  className="coding-inspector-group"
                  aria-label="子 Agent 工具调用"
                >
                  <h4 className="coding-inspector-group-title">工具调用</h4>
                  <Trace className="px-2">
                    {toolCalls.map((tool) => (
                      <ToolCall key={tool.id} call={tool} />
                    ))}
                  </Trace>
                </section>
              )}
            </>
          ) : (
            <WorkspaceEmpty
              icon={ListTree}
              title={selection ? "等待执行记录" : "还没有执行记录"}
            />
          )}
        </div>
      ) : (
        <Tabs
          value={view}
          onValueChange={(value) => {
            const next = detailTabs.find((tab) => tab.id === value)
            if (next) onViewChange(next.id)
          }}
          className="min-h-0 min-w-0 flex-1 gap-0"
        >
          <TabsList
            variant="line"
            aria-label="工作区视图"
            className="coding-detail-tabs w-full shrink-0 px-2"
          >
            {detailTabs.map(({ id, label, icon: Icon }) => (
              <TabsTrigger key={id} value={id}>
                <Icon data-icon="inline-start" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent
            keepMounted
            value="files"
            className="min-h-0 min-w-0 overflow-hidden"
          >
            {selectedFile ? (
              <div className="coding-editor-split">
                <div className="coding-editor-list">
                  <FileTree
                    key={scopeKey}
                    nodes={fileNodes(files)}
                    selectedPath={selectedFile.file.path}
                    onSelect={setPath}
                  />
                </div>
                <div className="coding-editor">
                  <CodeSample
                    title={selectedFile.file.path}
                    value={selectedFile.file.lines
                      .filter(
                        (line) =>
                          line.variant !==
                          (selectedFile.status === "changed"
                            ? "removed"
                            : "added")
                      )
                      .map((line) => line.text)
                      .join("\n")}
                    lineNumbers
                  />
                </div>
              </div>
            ) : (
              <WorkspaceEmpty icon={FileCode2} title="暂无文件记录" />
            )}
          </TabsContent>
          <TabsContent
            keepMounted
            value="changes"
            className="min-h-0 min-w-0 overflow-hidden"
          >
            {selectedDiff ? (
              <div className="coding-editor-split">
                <div className="coding-editor-list" aria-label="变更文件">
                  {changes.map((entry) => (
                    <ChangeRow
                      key={entry.file.path}
                      entry={entry}
                      selected={selectedDiff.file.path === entry.file.path}
                      onSelect={() => setPath(entry.file.path)}
                    />
                  ))}
                </div>
                <div className="coding-editor">
                  {selectedDiff.status === "proposed" && (
                    <p className="coding-proposed-note">拟改 · 待审批</p>
                  )}
                  <DiffPreview file={selectedDiff.file} />
                </div>
              </div>
            ) : (
              <WorkspaceEmpty icon={FileDiffIcon} title="暂无变更" />
            )}
          </TabsContent>
          <TabsContent
            keepMounted
            value="terminal"
            className="min-h-0 min-w-0 overflow-y-auto px-4 py-4"
          >
            {commands.length ? (
              <Terminal key={scopeKey} commands={commands} />
            ) : (
              <WorkspaceEmpty icon={SquareTerminal} title="暂无命令" />
            )}
          </TabsContent>
          <TabsContent
            keepMounted
            value="tests"
            className="min-h-0 min-w-0 overflow-y-auto px-4 py-4"
          >
            {testRuns.length ? (
              <TestResults key={scopeKey} runs={testRuns} />
            ) : (
              <WorkspaceEmpty icon={FlaskConical} title="暂无测试结果" />
            )}
          </TabsContent>
        </Tabs>
      )}
    </aside>
  )
}

function InspectorLink({
  icon: Icon,
  label,
  value,
  failed,
  onClick,
}: {
  icon: LucideIcon
  label: string
  value: string
  failed?: boolean
  onClick: () => void
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="w-full justify-start"
      onClick={onClick}
    >
      <Icon data-icon="inline-start" />
      <span className="flex-1 text-left">{label}</span>
      <span
        className={
          failed ? "text-xs text-destructive" : "text-xs text-muted-foreground"
        }
      >
        {value}
      </span>
      <ChevronRight data-icon="inline-end" />
    </Button>
  )
}

function ChangeRow({
  entry,
  selected,
  onSelect,
}: {
  entry: RunFile
  selected?: boolean
  onSelect: () => void
}) {
  const { file, status } = entry
  const added = file.lines.filter((line) => line.variant === "added").length
  const removed = file.lines.filter((line) => line.variant === "removed").length
  return (
    <Button
      variant={selected ? "secondary" : "ghost"}
      size="sm"
      className="w-full min-w-0 justify-start"
      title={file.path}
      aria-pressed={selected}
      onClick={onSelect}
    >
      <FileCode2 data-icon="inline-start" />
      <span className="min-w-0 flex-1 truncate text-left font-mono text-xs">
        {file.path.split("/").at(-1)}
      </span>
      {status === "proposed" && (
        <span className="text-xs text-warning">拟改</span>
      )}
      <span className="font-mono text-xs text-success">+{added}</span>
      <span className="font-mono text-xs text-destructive">−{removed}</span>
    </Button>
  )
}

function fileNodes(files: RunFile[]): FileNode[] {
  const root: FileNode[] = []
  for (const { file, status } of files) {
    const segments = file.path.split("/")
    let children = root
    for (let index = 1; index < segments.length; index++) {
      const path = segments.slice(0, index).join("/")
      let folder = children.find((node) => node.path === path)
      if (!folder) {
        folder = { path, children: [] }
        children.push(folder)
      }
      if ("children" in folder) children = folder.children
    }
    children.push({ path: file.path, modified: status === "changed" })
  }
  return root
}

function WorkspaceEmpty({
  icon: Icon,
  title,
}: {
  icon: LucideIcon
  title: string
}) {
  return (
    <Empty className="px-2 py-10">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
      </EmptyHeader>
    </Empty>
  )
}

const previewTurns: Turn[] = [
  { id: "check", label: "排查回车误发送", activity: inspectedCodingActivity },
  { id: "fix", label: "修复并验证回车行为", activity: completedCodingActivity },
]

export function CodingWorkspaceDemo() {
  const [selection, setSelection] = useState<RunSelection>()
  const [view, setView] = useState<WorkspaceView>("overview")
  const latest = previewTurns[1]
  const current = selection ?? { turnId: latest.id }
  const workers = getWorkers(
    previewTurns.find((turn) => turn.id === current.turnId)?.activity
  )

  return (
    <div className="flex w-full max-w-2xl min-w-0 flex-col gap-3">
      <ToggleGroup
        value={[current.workerId ?? "all"]}
        onValueChange={([workerId]) =>
          workerId &&
          setSelection({
            turnId: current.turnId,
            workerId: workerId === "all" ? undefined : workerId,
          })
        }
        size="sm"
        variant="outline"
        className="w-full flex-wrap"
        aria-label="查看任务"
      >
        <ToggleGroupItem value="all">本轮全部</ToggleGroupItem>
        {workers.map((worker) => (
          <ToggleGroupItem key={worker.id} value={worker.id}>
            {worker.title}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <div className="grid h-[35rem] overflow-hidden rounded-lg border">
        <CodingWorkspace
          turns={previewTurns}
          selection={current}
          view={view}
          followingLatest={!selection}
          onInspect={setSelection}
          onViewChange={setView}
          onFollowLatest={() => setSelection(undefined)}
        />
      </div>
    </div>
  )
}
