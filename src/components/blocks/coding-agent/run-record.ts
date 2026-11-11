import type { AgentActivity } from "./coding-demo"
import type { ApprovalRequest } from "./confirmation"
import type { FileDiff } from "./diff-preview"
import type { SubagentCallData } from "./subagent-call"
import type { TestRun } from "./test-results"
import type { ToolCallData } from "./tool-call"
import type { WebPreviewPage } from "./web-preview"

export type WorkspaceView =
  | "overview"
  | "files"
  | "changes"
  | "terminal"
  | "tests"
  | "web"
  | "artifacts"
  | "workflow"

export type RunSelection = {
  turnId: string
  workerId?: string
}

export type RunFile = {
  file: FileDiff
  status: "read" | "proposed" | "changed"
}

export type RunQuestion = {
  kind: "question"
  id: string
  workerId: string
  title: string
  options: { id: string; label: string }[]
  status: "pending" | "answered" | "cancelled"
  answer?: string
}

export type RunApproval = ApprovalRequest & {
  kind: "approval"
  id: string
  workerId: string
}

export type RunRequest = RunQuestion | RunApproval

export type RunArtifact = {
  id: string
  title: string
  filename: string
  source: string
  summary?: string
  items?: readonly { label: string; value: string }[]
}

export type RunOutputs = {
  pages?: readonly WebPreviewPage[]
  artifacts?: readonly RunArtifact[]
}

export type RunEvidence = RunOutputs & {
  files: RunFile[]
  commands: ToolCallData[]
  testRuns: TestRun[]
}

export function getWorkers(activity: AgentActivity | undefined) {
  return (activity?.actions ?? []).filter(
    (action) => action.kind === "subagent"
  )
}

export function getUnfinishedDependencies(
  worker: SubagentCallData,
  workers: SubagentCallData[]
) {
  return (worker.dependsOn ?? []).flatMap((id) => {
    const dependency = workers.find((item) => item.id === id)
    return dependency?.status === "done" ? [] : [dependency?.title ?? id]
  })
}

const filePriority: Record<RunFile["status"], number> = {
  read: 0,
  proposed: 1,
  changed: 2,
}

export function getRunEvidence(
  activity: AgentActivity | undefined,
  worker?: SubagentCallData
) {
  const workers = worker ? [worker] : getWorkers(activity)
  const files = new Map<string, RunFile>()
  for (const entry of workers.flatMap((item) => item.files ?? [])) {
    const previous = files.get(entry.file.path)
    if (
      !previous ||
      filePriority[entry.status] >= filePriority[previous.status]
    ) {
      files.set(entry.file.path, entry)
    }
  }
  const tools = worker
    ? (worker.tools ?? [])
    : (activity?.actions ?? []).flatMap((action) =>
        action.kind === "tool" ? [action] : (action.tools ?? [])
      )
  const outputs = worker
    ? [worker.outputs]
    : [activity?.outputs, ...workers.map((item) => item.outputs)]
  const pages = outputs.flatMap((output) => output?.pages ?? [])
  const artifacts = outputs.flatMap((output) => output?.artifacts ?? [])
  return {
    files: [...files.values()],
    commands: tools.filter((tool) => tool.name === "run_command"),
    testRuns: workers.flatMap((item) => item.testRuns ?? []),
    pages: [...new Map(pages.map((page) => [page.id, page])).values()],
    artifacts: [
      ...new Map(artifacts.map((artifact) => [artifact.id, artifact])).values(),
    ],
  }
}

export function getPendingRequest(
  activity: AgentActivity | undefined,
  workerId?: string
) {
  return activity?.requests?.find(
    (request) =>
      request.status === "pending" &&
      (!workerId || request.workerId === workerId)
  )
}

export const runStates = {
  idle: { label: "待开始", tone: "neutral" },
  running: { label: "执行中", tone: "running" },
  question: { label: "待回答", tone: "warning" },
  approval: { label: "待审批", tone: "warning" },
  done: { label: "已完成", tone: "success" },
  denied: { label: "已拒绝写入", tone: "neutral" },
  stopped: { label: "已停止", tone: "neutral" },
  error: { label: "执行失败", tone: "error" },
} as const

export type RunState = keyof typeof runStates

export function getRunState(
  activity: AgentActivity | undefined,
  worker?: SubagentCallData,
  starting = false
): RunState {
  const pending = getPendingRequest(activity, worker?.id)
  if (pending) return pending.kind
  if (!activity) return starting ? "running" : "idle"
  if (!worker && activity.endState) return activity.endState
  const statuses = worker
    ? [worker.status]
    : activity.steps.map((step) => step.status)
  const requests = worker
    ? activity.requests?.filter((request) => request.workerId === worker.id)
    : activity.requests
  if (statuses.includes("error")) return "error"
  if (statuses.includes("stopped")) return "stopped"
  if (requests?.some((request) => request.status === "denied")) return "denied"
  if (statuses.length && statuses.every((status) => status === "done"))
    return "done"
  return statuses.includes("running") ? "running" : "idle"
}
