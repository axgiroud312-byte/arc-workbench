import type { ActivityStatus } from "./activity-line"
import type { FileDiff } from "./diff-preview"
import type { ReasoningStep } from "./reasoning-steps"
import type {
  RunApproval,
  RunFile,
  RunQuestion,
  RunRequest,
} from "./run-record"
import type { SubagentCallData } from "./subagent-call"
import type { TestRun } from "./test-results"
import type { ToolCallData } from "./tool-call"

type ToolAction = ToolCallData & { kind: "tool" }
type SubagentAction = SubagentCallData & { kind: "subagent" }

export type AgentActivity = {
  steps: ReasoningStep[]
  actions: (ToolAction | SubagentAction)[]
  requests?: RunRequest[]
  endState?: "stopped" | "error"
}

export const codingDemoTitle = "修复回车误发送"
export const codingDemoPrompt =
  "中文输入法选字时，按回车会直接发出消息。修一下，再检查普通回车和 Shift + Enter。"

export const demoFiles: FileDiff[] = [
  {
    path: "src/components/chat-input.tsx",
    lines: [
      {
        variant: "default",
        text: "function onKeyDown(event: KeyboardEvent) {",
      },
      {
        variant: "removed",
        text: '  if (event.key === "Enter" && !event.shiftKey) {',
      },
      { variant: "removed", text: "    event.preventDefault()" },
      { variant: "removed", text: "    handleSubmit()" },
      { variant: "removed", text: "  }" },
      {
        variant: "added",
        text: '  if (event.key !== "Enter" || event.shiftKey) return',
      },
      {
        variant: "added",
        text: "  if (event.nativeEvent.isComposing || event.keyCode === 229) return",
      },
      { variant: "added", text: "" },
      { variant: "added", text: "  event.preventDefault()" },
      { variant: "added", text: "  handleSubmit()" },
      { variant: "default", text: "}" },
    ],
  },
  {
    path: "src/components/chat-input.test.tsx",
    lines: [
      { variant: "default", text: 'describe("ChatInput", () => {' },
      {
        variant: "added",
        text: '  it("ignores Enter during composition", () => {',
      },
      {
        variant: "added",
        text: "    const { input, submit } = renderChatInput()",
      },
      {
        variant: "added",
        text: '    fireEvent.keyDown(input, { key: "Enter", isComposing: true })',
      },
      { variant: "added", text: "    expect(submit).not.toHaveBeenCalled()" },
      { variant: "added", text: "  })" },
      { variant: "default", text: "})" },
    ],
  },
]

const search: ToolAction = {
  kind: "tool",
  id: "search",
  name: "run_command",
  title: "查找回车提交入口",
  status: "done",
  input: 'rg -n "onKeyDown|handleSubmit" src',
  output: "src/components/chat-input.tsx:28: function onKeyDown(event) {",
  duration: "0.3 秒",
}

const readInput: ToolCallData = {
  id: "read-input",
  name: "read_file",
  title: "读取键盘事件处理函数",
  status: "done",
  input: demoFiles[0].path,
  output:
    'if (event.key === "Enter" && !event.shiftKey) {\n  event.preventDefault()\n  handleSubmit()\n}',
}

const readTests: ToolCallData = {
  id: "read-tests",
  name: "run_command",
  title: "查看现有回归测试",
  status: "done",
  input: 'rg -n "it\\(" src/components/chat-input.test.tsx',
  output: "覆盖了普通回车和 Shift + Enter，缺少输入法组字场景。",
}

const baselineFailure = "预期提交 0 次，实际提交 1 次。"
const regressionTests = [
  { title: "输入法选字时回车不发送" },
  { title: "普通回车发送" },
  { title: "Shift + Enter 保留换行" },
]

const reproduce: ToolCallData = {
  id: "reproduce",
  name: "run_command",
  title: "复现输入法选字时误提交",
  status: "error",
  input: 'npm test -- chat-input -t "输入法选字"',
  error: baselineFailure + "\n退出码 1",
}

const testFile = demoFiles[1].path.split("/").at(-1)!
const baselineRun: TestRun = {
  id: reproduce.id,
  title: "改动前 · 复现问题",
  status: "error",
  suites: [
    {
      file: testFile,
      tests: [{ ...regressionTests[0], failure: baselineFailure }],
    },
  ],
}

const diagnose: SubagentAction = {
  kind: "subagent",
  id: "diagnose",
  title: "定位回车逻辑",
  task: "复现输入法选字时的误发送，定位提交入口。",
  status: "done",
  model: { name: "Gemini", brand: "gemini" },
  tools: [readInput, reproduce],
  files: [{ file: demoFiles[0], status: "read" }],
  testRuns: [baselineRun],
  result: "组字期间也进入了发送逻辑，需要在提交前检查输入法状态。",
  duration: "1.2 秒",
}

const tests: SubagentAction = {
  kind: "subagent",
  id: "tests",
  title: "补回归测试",
  task: "检查回归覆盖，等定位结果后拟定改动并验证。",
  status: "running",
  model: { name: "Codex", brand: "codex" },
  tools: [readTests],
  files: [{ file: demoFiles[1], status: "read" }],
}

const patch: ToolCallData = {
  id: "apply-patch",
  name: "apply_patch",
  title: "应用示例改动",
  status: "done",
  input: demoFiles.map((file) => file.path).join("\n"),
  output: "已应用两处示例改动。",
  duration: "0.4 秒",
}

const coverageQuestion: RunQuestion = {
  kind: "question",
  id: "coverage",
  workerId: tests.id,
  title: "这次验证哪些回车行为？",
  options: [
    { id: "all", label: "选字、发送和换行" },
    { id: "ime", label: "只验证输入法选字" },
  ],
  status: "pending",
}

const writeRequest: RunApproval = {
  kind: "approval",
  id: "write",
  workerId: tests.id,
  title: "允许应用示例改动？",
  detail: "chat-input.tsx、chat-input.test.tsx",
  status: "pending",
}

function stageSteps(
  inspect: ActivityStatus,
  verify: ActivityStatus,
  summarize: ActivityStatus = "pending",
  detail = "定位结果出来后，应用改动并运行回归测试。"
): ReasoningStep[] {
  return [
    {
      id: "inspect",
      title: "并行排查",
      status: inspect,
      detail: "定位回车逻辑和检查测试覆盖同时开始。",
    },
    { id: "verify", title: "应用改动并验证", status: verify, detail },
    {
      id: "summarize",
      title: "汇总结果",
      status: summarize,
      detail: "主 Agent 收集两项任务的结果。",
    },
  ]
}

function runningTool<T extends ToolCallData>(tool: T): T {
  return {
    ...tool,
    status: "running",
    output: undefined,
    error: undefined,
    duration: undefined,
  }
}

function runFiles(status: RunFile["status"]): RunFile[] {
  return demoFiles.map((file) => ({ file, status }))
}

function verification(imeOnly: boolean, failure?: string) {
  const selected = imeOnly ? regressionTests.slice(0, 1) : regressionTests
  const cases = selected.map((test, index) => ({
    ...test,
    failure: index === 0 ? failure : undefined,
  }))
  const output = cases
    .map((test) =>
      test.failure ? "✗ " + test.title + "\n" + test.failure : "✓ " + test.title
    )
    .join("\n")
  const result = failure
    ? output + "\n\n1 项失败 · 退出码 1"
    : output + "\n\n" + cases.length + " 项通过 · 退出码 0"
  const command: ToolCallData = {
    id: "regression",
    name: "run_command",
    title: "运行回归测试",
    status: failure ? "error" : "done",
    input: imeOnly
      ? 'npm test -- chat-input -t "输入法选字"'
      : "npm test -- chat-input",
    output: failure ? undefined : result,
    error: failure ? result : undefined,
    duration: "0.8 秒",
  }
  const run: TestRun = {
    id: command.id,
    title: "改动后 · 回归测试",
    status: failure ? "error" : "done",
    suites: [{ file: testFile, tests: cases }],
  }
  return { command, run }
}

function finishedWorker(imeOnly: boolean, failure?: string): SubagentAction {
  const { command, run } = verification(imeOnly, failure)
  return {
    ...tests,
    status: failure ? "error" : "done",
    duration: "1.8 秒",
    result:
      failure ??
      (imeOnly ? "输入法选字测试通过。" : "选字、发送和换行三项测试通过。"),
    files: runFiles("changed"),
    tools: [readTests, patch, command],
    testRuns: [run],
  }
}

export const inspectedCodingActivity: AgentActivity = {
  steps: [
    {
      id: "inspect",
      title: "定位并复现误发送",
      status: "done",
      detail: "输入法组字期间按回车会触发消息提交。",
    },
  ],
  actions: [search, diagnose],
}
export const completedCodingActivity: AgentActivity = {
  steps: stageSteps("done", "done", "done"),
  actions: [search, diagnose, finishedWorker(false)],
  requests: [
    { ...coverageQuestion, status: "answered", answer: "all" },
    { ...writeRequest, status: "approved" },
  ],
}
export const codingDemoReply =
  "已应用两处示例改动。组字时按回车会先确认选字，普通回车仍可发送，Shift + Enter 保留换行。\n\n三项回归测试通过。"

const inspectingActivity: AgentActivity = {
  steps: stageSteps("running", "pending"),
  actions: [
    runningTool(search),
    {
      ...diagnose,
      status: "running",
      duration: undefined,
      result: undefined,
      tools: [runningTool(readInput)],
      files: [],
      testRuns: [],
    },
    { ...tests, tools: [runningTool(readTests)], files: [] },
  ],
}

const awaitingCoverageActivity: AgentActivity = {
  steps: stageSteps("done", "waiting", "pending", "等待选择回归测试范围。"),
  actions: [
    search,
    diagnose,
    { ...tests, status: "waiting", note: "待选择测试范围" },
  ],
  requests: [coverageQuestion],
}

function awaitingWriteActivity(requests: RunRequest[]): AgentActivity {
  return {
    steps: stageSteps(
      "done",
      "waiting",
      "pending",
      "拟改差异已生成，等待写入审批。"
    ),
    actions: [
      search,
      diagnose,
      {
        ...tests,
        status: "waiting",
        files: [...(tests.files ?? []), ...runFiles("proposed")],
        note: "待审批",
      },
    ],
    requests: [...requests, writeRequest],
  }
}

function deniedWriteFrame(requests: RunRequest[]) {
  const activity: AgentActivity = {
    steps: stageSteps(
      "done",
      "blocked",
      "done",
      "写入审批被拒绝，保留排查记录。"
    ),
    actions: [
      search,
      diagnose,
      { ...tests, status: "blocked", note: "写入被拒绝" },
    ],
    requests,
  }
  return {
    activity,
    content: "已拒绝这次写入。保留了文件排查、命令输出和改动前的测试结果。",
  }
}

function verifyingActivity(
  imeOnly: boolean,
  requests: RunRequest[]
): AgentActivity {
  const { command, run } = verification(imeOnly)
  return {
    steps: stageSteps("done", "running"),
    actions: [
      search,
      diagnose,
      {
        ...tests,
        files: runFiles("changed"),
        tools: [readTests, patch, runningTool(command)],
        testRuns: [{ ...run, status: "running", suites: [] }],
      },
    ],
    requests,
  }
}

function verificationReply(imeOnly: boolean) {
  return imeOnly
    ? "已应用两处示例改动。输入法选字测试通过。本轮验证范围为输入法选字。"
    : codingDemoReply
}

export const codingPreviewStates = [
  "running",
  "question",
  "approval",
  "error",
  "stopped",
] as const
export type CodingPreviewState = (typeof codingPreviewStates)[number]

const allCoverage: RunQuestion = {
  ...coverageQuestion,
  status: "answered",
  answer: "all",
}
const approvedWrite: RunApproval = { ...writeRequest, status: "approved" }
const failedRegression =
  "旧版 WebView 组字期间按回车，预期提交 0 次，实际提交 1 次。"

export function codingPreviewFrame(state: CodingPreviewState): {
  activity: AgentActivity
  content: string
} {
  switch (state) {
    case "running":
      return { activity: inspectingActivity, content: "" }
    case "question":
      return { activity: awaitingCoverageActivity, content: "" }
    case "approval":
      return { activity: awaitingWriteActivity([allCoverage]), content: "" }
    case "error":
      return {
        activity: {
          steps: stageSteps("done", "error", "done", failedRegression),
          actions: [search, diagnose, finishedWorker(false, failedRegression)],
          requests: [allCoverage, approvedWrite],
          endState: "error",
        },
        content:
          "示例改动已应用。回归测试有一项失败，可以在右栏查看失败详情和命令输出。",
      }
    case "stopped":
      return {
        activity: stopActivity(
          verifyingActivity(false, [allCoverage, approvedWrite])
        ),
        content: "已停止回归测试。已应用的示例改动和排查记录仍可查看。",
      }
  }
}

export function respondToCodingPreview(
  activity: AgentActivity,
  requestId: string,
  value: string
) {
  const requests = activity.requests ?? []
  const pending = requests.find(
    (request) => request.id === requestId && request.status === "pending"
  )
  if (!pending) return
  if (pending.kind === "question") {
    if (!pending.options.some((option) => option.id === value)) return
    return {
      activity: awaitingWriteActivity([
        { ...pending, status: "answered", answer: value },
      ]),
      content: "",
    }
  }
  if (value !== "approve" && value !== "deny") return
  const resolved = requests.map((request): RunRequest =>
    request === pending
      ? { ...pending, status: value === "approve" ? "approved" : "denied" }
      : request
  )
  if (value === "deny") return deniedWriteFrame(resolved)
  const imeOnly = resolved.some(
    (request) => request.kind === "question" && request.answer === "ime"
  )
  return {
    activity: {
      steps: stageSteps("done", "done", "done"),
      actions: [search, diagnose, finishedWorker(imeOnly)],
      requests: resolved,
    },
    content: verificationReply(imeOnly),
  }
}

function pause(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve) => {
    if (signal.aborted) {
      resolve()
      return
    }
    const finish = () => {
      clearTimeout(timer)
      signal.removeEventListener("abort", finish)
      resolve()
    }
    const timer = setTimeout(finish, ms)
    signal.addEventListener("abort", finish, { once: true })
  })
}

type CodingDemoOptions = {
  askScope?: boolean
  confirmEdits?: boolean
  onRequest: (request: RunRequest) => Promise<string | undefined>
}

export async function* streamCodingDemo(
  prompt: string,
  signal: AbortSignal,
  { askScope, confirmEdits, onRequest }: CodingDemoOptions
) {
  if (signal.aborted) return
  yield { activity: inspectingActivity, content: "" }
  await pause(760, signal)
  if (signal.aborted) return

  let requests: RunRequest[] = []
  let imeOnly = false
  if (askScope) {
    const decision = onRequest(coverageQuestion)
    yield { activity: awaitingCoverageActivity, content: "" }
    const answer = await decision
    if (signal.aborted) return
    imeOnly = answer === "ime"
    requests = [{ ...coverageQuestion, status: "answered", answer }]
  }

  if (confirmEdits) {
    const decision = onRequest(writeRequest)
    yield { activity: awaitingWriteActivity(requests), content: "" }
    const approved = (await decision) === "approve"
    if (signal.aborted) return
    requests = [
      ...requests,
      { ...writeRequest, status: approved ? "approved" : "denied" },
    ]
    if (!approved) {
      yield deniedWriteFrame(requests)
      return
    }
  }

  yield { activity: verifyingActivity(imeOnly, requests), content: "" }
  await pause(640, signal)
  if (signal.aborted) return
  const actions = [search, diagnose, finishedWorker(imeOnly)]
  yield {
    activity: {
      steps: stageSteps("done", "done", "running"),
      actions,
      requests,
    },
    content: "",
  }
  await pause(320, signal)
  if (signal.aborted) return

  const activity = {
    steps: stageSteps("done", "done", "done"),
    actions,
    requests,
  }
  const result = verificationReply(imeOnly)
  const answer = /输入法|回车|快捷键|enter|ime/i.test(prompt)
    ? result
    : "这轮预览使用输入法修复示例。\n\n" + result
  const characters = Array.from(answer)
  for (let index = 0; index < characters.length; index += 5) {
    if (signal.aborted) return
    yield { activity, content: characters.slice(0, index + 5).join("") }
    await pause(27, signal)
  }
}

export function stopActivity(
  activity: AgentActivity | undefined,
  endState: "stopped" | "error" = "stopped"
): AgentActivity {
  if (!activity) return { steps: [], actions: [], endState }
  const stop = (status: ActivityStatus) =>
    status === "running" || status === "waiting" ? "stopped" : status
  return {
    ...activity,
    endState,
    requests: activity.requests?.map((request) =>
      request.status === "pending"
        ? { ...request, status: "cancelled" }
        : request
    ),
    steps: activity.steps.map((step) => ({
      ...step,
      status: stop(step.status),
    })),
    actions: activity.actions.map((action) => {
      if (action.kind === "tool")
        return { ...action, status: stop(action.status) }
      return {
        ...action,
        status: stop(action.status),
        note: action.status === "waiting" ? undefined : action.note,
        files: action.files?.filter((file) => file.status !== "proposed"),
        tools: action.tools?.map((tool) => ({
          ...tool,
          status: stop(tool.status),
        })),
        testRuns: action.testRuns?.map((run) => ({
          ...run,
          status: stop(run.status),
        })),
      }
    }),
  }
}
