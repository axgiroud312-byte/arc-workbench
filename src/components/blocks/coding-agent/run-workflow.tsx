import {
  WorkflowGraph,
  type WorkflowNode,
  type WorkflowStage,
} from "../agents/workflow-graph"
import type { AgentActivity } from "./coding-demo"
import {
  getPendingRequest,
  getRunState,
  getUnfinishedDependencies,
  getWorkers,
  runStates,
  type RunSelection,
  type RunState,
} from "./run-record"

const rootId = "main-agent"
const workerNodeId = (workerId: string) => "worker/" + workerId

const nodeStatuses = {
  idle: "waiting",
  running: "running",
  question: "waiting",
  approval: "waiting",
  done: "done",
  denied: "waiting",
  stopped: "waiting",
  error: "failed",
} satisfies Record<RunState, WorkflowNode["status"]>

function workflowStages(
  activity: AgentActivity,
  workers: ReturnType<typeof getWorkers>
): WorkflowStage[] {
  const state = getRunState(activity)
  const steps = [...activity.steps].reverse()
  const currentStep =
    steps.find(
      (step) =>
        step.status === "running" ||
        step.status === "waiting" ||
        step.status === "error" ||
        step.status === "stopped"
    ) ??
    steps.find((step) => step.status === "done") ??
    activity.steps[0]
  const stages: WorkflowStage[] = [
    {
      id: rootId,
      title: "本轮执行",
      nodes: [
        {
          id: rootId,
          title: "主 Agent",
          status: nodeStatuses[state],
          statusLabel: runStates[state].label,
          detail:
            getPendingRequest(activity)?.title ??
            currentStep?.detail ??
            "查看本轮汇总与执行记录。",
        },
      ],
    },
  ]

  const ids = new Set(workers.map((worker) => worker.id))
  const placed = new Set<string>()
  let remaining = workers
  while (remaining.length) {
    const ready = remaining.filter(
      (worker) =>
        worker.dependsOn?.every((id) => !ids.has(id) || placed.has(id)) ?? true
    )
    const group = ready.length ? ready : remaining
    stages.push({
      id: "tasks-" + stages.length,
      title: stages.length === 1 ? "子任务" : "依赖任务",
      nodes: group.map((worker) => {
        const status = getRunState(activity, worker)
        const waitingFor =
          worker.status === "pending"
            ? getUnfinishedDependencies(worker, workers)
            : []
        return {
          id: workerNodeId(worker.id),
          title: worker.title,
          status: nodeStatuses[status],
          statusLabel: waitingFor.length ? "等待前置" : runStates[status].label,
          dependsOn: worker.dependsOn?.map((id) =>
            ids.has(id) ? workerNodeId(id) : id
          ),
          detail: waitingFor.length
            ? "等待「" + waitingFor.join("、") + "」完成后开始。"
            : (getPendingRequest(activity, worker.id)?.title ??
              worker.result ??
              worker.note ??
              worker.task),
        }
      }),
    })
    for (const worker of group) placed.add(worker.id)
    remaining = remaining.filter((worker) => !placed.has(worker.id))
  }
  return stages
}

export function RunWorkflow({
  activity,
  selection,
  onInspect,
}: {
  activity: AgentActivity
  selection: RunSelection
  onInspect: (selection: RunSelection) => void
}) {
  const workers = getWorkers(activity)
  return (
    <WorkflowGraph
      stages={workflowStages(activity, workers)}
      value={selection.workerId ? workerNodeId(selection.workerId) : rootId}
      onValueChange={(id) =>
        onInspect({
          turnId: selection.turnId,
          workerId: workers.find((worker) => workerNodeId(worker.id) === id)
            ?.id,
        })
      }
    />
  )
}
