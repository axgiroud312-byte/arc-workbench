import { useEffect, useRef, useState } from "react"
import { demoFiles, type AgentActivity } from "./coding-demo"
import { getUnfinishedDependencies, type RunSelection } from "./run-record"
import type { SubagentCallData } from "./subagent-call"
import type { TestRun } from "./test-results"
import type { ToolCallData } from "./tool-call"

export const multiAgentScenarios = [
  { id: "parallel", label: "并行执行" },
  { id: "dependency", label: "等待前置任务" },
  { id: "worker-error", label: "单个子 Agent 失败" },
] as const

export type MultiAgentScenario = (typeof multiAgentScenarios)[number]["id"]
export const multiAgentTitle = "检查回车交互"
export const multiAgentPrompt =
  "定位回车处理逻辑，核对快捷键说明。定位完成后，跑一下回归测试。"
export const multiAgentTurnId = "keyboard-orchestration"

type Worker = SubagentCallData & { kind: "subagent" }
type AttemptStatus = "running" | "error" | "done"

const logic: Worker = {
  kind: "subagent",
  id: "logic",
  title: "定位回车逻辑",
  task: "定位输入框提交逻辑，为回归测试提供入口。",
  model: { name: "Gemini", brand: "gemini" },
  status: "done",
  files: [{ file: demoFiles[0], status: "read" }],
  tools: [
    {
      id: "find-handler",
      name: "run_command",
      title: "定位提交函数",
      status: "done",
      input: 'rg -n "onKeyDown|handleSubmit" src/components/chat-input.tsx',
      output: "28: function onKeyDown(event)\n42: handleSubmit()",
    },
  ],
  result: "已找到回车提交函数，并把入口交给回归测试任务。",
  duration: "1.2 秒",
}

const shortcuts: Worker = {
  kind: "subagent",
  id: "shortcuts",
  title: "核对快捷键说明",
  task: "独立检查说明文档中的发送和换行规则。",
  model: { name: "Claude", brand: "claude" },
  status: "done",
  files: [
    {
      status: "read",
      file: {
        path: "docs/keyboard-shortcuts.md",
        lines: [
          { variant: "default", text: "# 消息输入快捷键" },
          { variant: "default", text: "- Enter：发送消息。" },
          { variant: "default", text: "- Shift + Enter：换行。" },
        ],
      },
    },
  ],
  tools: [
    {
      id: "read-shortcuts",
      name: "run_command",
      title: "核对文档中的回车规则",
      status: "done",
      input: 'rg -n "Enter" docs/keyboard-shortcuts.md',
      output: "2: Enter：发送消息。\n3: Shift + Enter：换行。",
    },
  ],
  result: "文档中两项快捷键说明已核对。",
  duration: "0.9 秒",
}

const regression: Worker = {
  kind: "subagent",
  id: "regression",
  title: "运行回归测试",
  task: "根据定位结果验证组字、发送和换行。",
  model: { name: "Codex", brand: "codex" },
  status: "pending",
  dependsOn: [logic.id],
}

const timeout = "测试运行器启动超时，未执行用例。"
const cases = [
  { title: "输入法选字时回车不发送" },
  { title: "普通回车发送" },
  { title: "Shift + Enter 保留换行" },
]

function running(worker: Worker): Worker {
  return {
    ...worker,
    status: "running",
    result: undefined,
    duration: undefined,
    tools: worker.tools?.map((tool) => ({
      ...tool,
      status: "running",
      output: undefined,
    })),
  }
}

function withAttempt(
  worker: Worker,
  number: number,
  status: AttemptStatus
): Worker {
  const id = "regression-" + number
  const title = "第 " + number + " 次 · 回归测试"
  const command: ToolCallData = {
    id,
    title,
    name: "run_command",
    input: "npm test -- chat-input",
    status,
    error: status === "error" ? timeout + "\n退出码 1" : undefined,
    output: status === "done" ? "3 项通过 · 退出码 0" : undefined,
  }
  const testRun: TestRun = {
    id,
    title,
    status,
    suites:
      status === "running"
        ? []
        : [
            {
              file: "chat-input.test.tsx",
              tests:
                status === "error"
                  ? [{ title: "启动测试环境", failure: timeout }]
                  : cases,
            },
          ],
  }
  return {
    ...worker,
    status,
    note: status === "running" ? "第 " + number + " 次尝试" : undefined,
    result:
      status === "error"
        ? timeout
        : status === "done"
          ? "三项回归测试已通过。"
          : undefined,
    files: [{ file: demoFiles[1], status: "read" }],
    tools: [...(worker.tools ?? []).filter((item) => item.id !== id), command],
    testRuns: [
      ...(worker.testRuns ?? []).filter((item) => item.id !== id),
      testRun,
    ],
  }
}

function scenarioWorkers(scenario: MultiAgentScenario): Worker[] {
  if (scenario === "worker-error")
    return [logic, shortcuts, withAttempt(regression, 1, "error")]
  return [
    running(logic),
    scenario === "parallel" ? running(shortcuts) : shortcuts,
    regression,
  ]
}

export function multiAgentSelection(
  scenario: MultiAgentScenario
): RunSelection {
  return {
    turnId: multiAgentTurnId,
    workerId: scenario === "parallel" ? undefined : regression.id,
  }
}

function previewActivity(workers: Worker[]): AgentActivity {
  return {
    steps: workers.map((worker) => {
      const dependencies = getUnfinishedDependencies(worker, workers)
      return {
        id: worker.id,
        title: worker.title,
        status: worker.status,
        detail: dependencies.length
          ? "等待「" + dependencies.join("、") + "」完成后开始。"
          : (worker.result ?? worker.task),
      }
    }),
    actions: workers,
  }
}

function summary(scenario: MultiAgentScenario, workers: Worker[]) {
  if (scenario === "parallel")
    return "定位回车逻辑和核对快捷键说明正在并行执行。"
  if (scenario === "dependency")
    return "说明已核对。回归测试在等待「定位回车逻辑」完成。"
  const worker = workers.find((item) => item.id === regression.id)
  if (worker?.status === "running") return "正在单独重试回归测试。"
  if (worker?.status === "done") return "回归测试重试通过，三项检查均已完成。"
  return "定位和文档核对已完成。回归测试启动超时，可以单独重试这一项。"
}

export function useMultiAgentPreview(scenario?: MultiAgentScenario) {
  const [workers, setWorkers] = useState(() =>
    scenario ? scenarioWorkers(scenario) : undefined
  )
  const retryTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  )

  useEffect(() => () => clearTimeout(retryTimer.current), [])

  function retry(workerId: string) {
    if (!workers || retryTimer.current !== undefined) return false
    const worker = workers.find((item) => item.id === workerId)
    if (
      worker?.status !== "error" ||
      getUnfinishedDependencies(worker, workers).length
    )
      return false
    const attempt = (worker.testRuns?.length ?? 0) + 1
    setWorkers((current) =>
      current?.map((item) =>
        item.id === workerId ? withAttempt(item, attempt, "running") : item
      )
    )
    retryTimer.current = setTimeout(() => {
      retryTimer.current = undefined
      setWorkers((current) =>
        current?.map((item) =>
          item.id === workerId ? withAttempt(item, attempt, "done") : item
        )
      )
    }, 850)
    return true
  }

  if (!scenario || !workers) return
  return {
    activity: previewActivity(workers),
    content: summary(scenario, workers),
    retry,
  }
}
