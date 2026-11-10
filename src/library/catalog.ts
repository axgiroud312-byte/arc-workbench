export const blockCategories = {
  Coding: "编程对话",
  Elements: "对话组件",
  AI: "AI 组件",
  Agents: "智能体组件",
} as const

type PreviewConfig = { demo?: string; reference: string; useDemo?: boolean }

const codingPreviews: Partial<Record<string, PreviewConfig>> = {
  "ai-chat": { reference: "https://ui.shadcn.com/docs/ai-elements/base/chat" },
  "ai-composer": {
    reference: "https://ui.shadcn.com/docs/ai-elements/base/prompt-input",
  },
  "model-picker": {
    reference: "https://ui.shadcn.com/docs/ai-elements/base/model-selector",
  },
  "tool-call": {
    demo: "ToolCallDemo",
    reference: "https://ui.shadcn.com/docs/ai-elements/base/tool",
  },
  "subagent-call": {
    demo: "SubagentCallDemo",
    reference: "https://ui.shadcn.com/docs/ai-elements/base/subagent",
  },
  "reasoning-steps": {
    demo: "ReasoningStepsDemo",
    reference: "https://ui.shadcn.com/docs/ai-elements/base/chain-of-thought",
  },
  "coding-agent-panel": {
    reference: "https://github.com/deeplethe/solid-glass",
  },
}

const addedPreviews = [
  [
    "file-tree",
    "文件树",
    "FileTree",
    "FileTreeDemo",
    "Coding",
    "coding-agent",
    "ai-elements/base/file-tree",
    "展开目录，点击文件查看内容。",
  ],
  [
    "confirmation",
    "操作审批",
    "Confirmation",
    "ConfirmationDemo",
    "Coding",
    "coding-agent",
    "ai-elements/base/confirmation",
    "查看 Agent 请求，选择批准或拒绝。",
  ],
  [
    "terminal",
    "终端",
    "Terminal",
    "TerminalDemo",
    "Coding",
    "coding-agent",
    "ai-elements/base/terminal",
    "展开命令，查看和复制输出。",
  ],
  [
    "test-results",
    "测试结果",
    "TestResults",
    "TestResultsDemo",
    "Coding",
    "coding-agent",
    "ai-elements/base/test-results",
    "按测试套件查看通过项和失败详情。",
  ],
  [
    "coding-sidebar",
    "会话侧边栏",
    "CodingSidebar",
    "CodingSidebarDemo",
    "Coding",
    "coding-agent",
    "components/base/sidebar",
    "按待处理、执行中和普通对话分组，支持搜索和切换。",
  ],
  [
    "coding-settings",
    "工作区设置",
    "CodingSettings",
    "CodingSettingsDemo",
    "Coding",
    "coding-agent",
    "components/base/field",
    "按对话、Agent 和外观分类，管理模型、发送和审批偏好。",
  ],
  [
    "attachments",
    "附件",
    "Attachments",
    "AttachmentsDemo",
    "Elements",
    "chat-elements",
    "components/base/attachment",
    "添加或移除消息附件。",
  ],
  [
    "checkpoint",
    "对话检查点",
    "Checkpoint",
    "CheckpointDemo",
    "Elements",
    "chat-elements",
    "ai-elements/base/checkpoint",
    "恢复到指定对话位置，移除它之后的消息。",
  ],
  [
    "code-block",
    "代码块",
    "HighlightedCode",
    "CodeBlockDemo",
    "Elements",
    "chat-elements",
    "components/base/code-block",
    "查看有高亮和行号的代码并复制。",
  ],
  [
    "commit",
    "提交记录",
    "Commit",
    "CommitDemo",
    "Elements",
    "chat-elements",
    "components/base/trace#commit",
    "展开提交，打开单个文件的差异。",
  ],
  [
    "context",
    "上下文用量",
    "ContextUsage",
    "ContextDemo",
    "Elements",
    "chat-elements",
    "ai-elements/base/context",
    "查看对话和工具占用的上下文。",
  ],
  [
    "inline-citation",
    "内联引用",
    "InlineCitation",
    "InlineCitationDemo",
    "Elements",
    "chat-elements",
    "ai-elements/base/inline-citation",
    "在回答旁查看引用来源。",
  ],
  [
    "message",
    "对话消息",
    "MessageDemo",
    "MessageDemo",
    "Elements",
    "chat-elements",
    "ai-elements/base/message",
    "展示用户消息、Agent 回答、复制和反馈。",
  ],
  [
    "plan",
    "执行计划",
    "Plan",
    "PlanDemo",
    "Elements",
    "chat-elements",
    "ai-elements/base/plan",
    "展开计划并查看每一步的状态。",
  ],
  [
    "question",
    "问卷",
    "QuestionDemo",
    "QuestionDemo",
    "Elements",
    "chat-elements",
    "components/base/questionnaire",
    "回答 Agent 提出的多步问题。",
  ],
  [
    "queue",
    "待办队列",
    "Queue",
    "QueueDemo",
    "Elements",
    "chat-elements",
    "ai-elements/base/queue",
    "将事项从待处理移动到已完成。",
  ],
  [
    "reasoning",
    "推理摘要",
    "Reasoning",
    "ReasoningDemo",
    "Elements",
    "chat-elements",
    "ai-elements/base/reasoning",
    "重播一段摘要，查看生成和折叠状态。",
  ],
  [
    "shimmer",
    "等待动画",
    "Shimmer",
    "ShimmerDemo",
    "Elements",
    "chat-elements",
    "utils/shimmer",
    "切换正在读取与读取完成的文字状态。",
  ],
  [
    "sources",
    "参考来源",
    "Sources",
    "SourcesDemo",
    "Elements",
    "chat-elements",
    "ai-elements/base/sources",
    "展开 Agent 使用的参考链接。",
  ],
  [
    "stack-trace",
    "堆栈跟踪",
    "StackTrace",
    "StackTraceDemo",
    "Elements",
    "chat-elements",
    "ai-elements/base/stack-trace",
    "展开错误并复制完整堆栈。",
  ],
  [
    "suggestion",
    "建议提示词",
    "Suggestion",
    "SuggestionDemo",
    "Elements",
    "chat-elements",
    "ai-elements/base/suggestion",
    "点击建议，将它填入输入框。",
  ],
  [
    "task",
    "Agent 任务",
    "Task",
    "TaskDemo",
    "Elements",
    "chat-elements",
    "ai-elements/base/task",
    "观察 Agent 如何逐步汇总排查结果。",
  ],
] as const

type BlockEntry = readonly [
  id: string,
  name: string,
  exportName: string,
  category: keyof typeof blockCategories,
  group: string,
  description: string,
  config?: PreviewConfig,
]

const definitions: readonly BlockEntry[] = [
  [
    "tool-call",
    "工具调用",
    "ToolCall",
    "Coding",
    "coding-agent",
    "展开查看命令的输入参数、输出和失败原因。",
  ],
  [
    "subagent-call",
    "子 Agent 调用",
    "SubagentCall",
    "Coding",
    "coding-agent",
    "查看委派任务，以及子 Agent 自己的调用记录和结论。",
  ],
  [
    "reasoning-steps",
    "思考步骤",
    "ReasoningSteps",
    "Coding",
    "coding-agent",
    "逐步查看 Agent 的判断摘要和执行进度。",
  ],
  [
    "delegation-group",
    "子 Agent 委派",
    "DelegationGroup",
    "Coding",
    "coding-agent",
    "折叠或展开同一轮委派，点选子任务查看详情。",
    {
      demo: "DelegationGroupDemo",
      useDemo: true,
      reference: "https://www.assistant-ui.com/elements/subagent-list",
    },
  ],
  [
    "run-orchestration",
    "执行编排",
    "RunOrchestration",
    "Coding",
    "coding-agent",
    "查看并行排查、写入审批、验证和汇总的进度。",
    {
      demo: "RunOrchestrationDemo",
      useDemo: true,
      reference: "https://www.onorca.dev/docs/cli/orchestration",
    },
  ],
  [
    "multi-agent-orchestration",
    "多子 Agent 编排",
    "MultiAgentOrchestration",
    "Coding",
    "coding-agent",
    "切换并行、前置等待和单项失败，单独重试子任务并查看对应记录。",
    {
      reference: "https://www.assistant-ui.com/elements/subagent-list",
    },
  ],
  [
    "agent-interaction",
    "智能工具界面",
    "AgentInteraction",
    "Coding",
    "coding-agent",
    "选择验证范围，查看拟改差异并处理写入审批。",
    {
      demo: "AgentInteractionDemo",
      useDemo: true,
      reference: "https://www.assistant-ui.com/docs/tools/tool-ui",
    },
  ],
  [
    "coding-workspace",
    "执行工作区",
    "CodingWorkspace",
    "Coding",
    "coding-agent",
    "按轮次或子任务查看文件、变更、终端和测试。",
    {
      demo: "CodingWorkspaceDemo",
      useDemo: true,
      reference: "https://ui.shadcn.com/docs/components/base/tabs",
    },
  ],
  [
    "coding-agent-panel",
    "编程工作台",
    "CodingAgentPanel",
    "Coding",
    "coding-agent",
    "在对话中查看编排、委派和审批，右栏按轮次或子任务查看执行记录。",
  ],
  ...addedPreviews.map(
    ([
      id,
      name,
      exportName,
      demo,
      category,
      group,
      doc,
      description,
    ]): BlockEntry => [
      id,
      name,
      exportName,
      category,
      group,
      description,
      { demo, reference: "https://ui.shadcn.com/docs/" + doc, useDemo: true },
    ]
  ),
  [
    "ai-chat",
    "AI 对话",
    "AiChat",
    "AI",
    "ai-conversation",
    "包含滚动消息、模型选择、思考步骤、工具调用和子 Agent 的聊天示例。",
  ],
  [
    "ai-composer",
    "AI 输入框",
    "AiComposer",
    "AI",
    "ai-conversation",
    "把附件、模型选择和发送操作放进同一个输入框。",
  ],
  [
    "ai-answer",
    "AI 回答",
    "AiAnswer",
    "AI",
    "ai-conversation",
    "带引用来源、思考步骤和反馈操作的 AI 回答。",
  ],
  [
    "model-picker",
    "模型选择",
    "ModelPicker",
    "AI",
    "ai-conversation",
    "按能力和提供方选择模型，查看上下文与价格。",
  ],
  [
    "model-arena",
    "模型对比",
    "ModelArena",
    "AI",
    "ai-conversation",
    "同一个问题，对比两个匿名回答，投票后揭晓模型。",
  ],
  [
    "prompt-studio",
    "提示词工作台",
    "PromptStudio",
    "AI",
    "ai-conversation",
    "编辑提示词、填入变量，测试并管理不同版本。",
  ],
  [
    "document-extract",
    "文档提取",
    "DocumentExtract",
    "AI",
    "ai-conversation",
    "从示例文档提取字段，核对结果并导出结构化数据。",
  ],
  [
    "agent-memory",
    "智能体记忆",
    "AgentMemory",
    "AI",
    "ai-conversation",
    "查看、搜索和修改 Agent 记住的信息。",
  ],
  [
    "ai-side-panel",
    "AI 侧边助手",
    "AiSidePanel",
    "AI",
    "ai-conversation",
    "在文档旁展开助手，带着当前上下文继续对话。",
  ],
  [
    "ai-inline-edit",
    "AI 文内编辑",
    "AiInlineEdit",
    "AI",
    "ai-workflows",
    "选中文字后改写，就地对比并接受或撤销修改。",
  ],
  [
    "research-run",
    "研究任务",
    "ResearchRun",
    "AI",
    "ai-workflows",
    "跟随一次研究任务，查看步骤、来源与最终报告。",
  ],
  [
    "ai-insight-card",
    "AI 数据洞察",
    "AiInsightCard",
    "AI",
    "ai-workflows",
    "把关键变化、图表和解释放在一张紧凑的卡片里。",
  ],
  [
    "catch-up",
    "工作动态摘要",
    "CatchUp",
    "AI",
    "ai-workflows",
    "快速浏览离开期间的更新、决策和待办事项。",
  ],
  [
    "ai-feature-launch",
    "AI 功能介绍",
    "AiFeatureLaunch",
    "AI",
    "ai-workflows",
    "用一个可体验的演示介绍新功能，并收集反馈。",
  ],
  [
    "ai-search-bar",
    "AI 搜索框",
    "AiSearchBar",
    "AI",
    "ai-workflows",
    "在同一个搜索框里切换关键词搜索和自然语言提问。",
  ],
  [
    "ai-setup-wizard",
    "AI 设置向导",
    "AiSetupWizard",
    "AI",
    "ai-workflows",
    "逐步选择知识来源、助手角色和回复方式。",
  ],
  [
    "call-insights",
    "通话分析",
    "CallInsights",
    "AI",
    "ai-workflows",
    "浏览通话摘要、文字记录和可以跳转的关键时刻。",
  ],
  [
    "lead-scoring",
    "线索评分",
    "LeadScoring",
    "AI",
    "ai-workflows",
    "查看线索评分、评分依据与建议的下一步操作。",
  ],
  [
    "agent-run",
    "智能体执行",
    "AgentRun",
    "Agents",
    "agents",
    "跟随 Agent 的执行步骤，在写入前审阅和批准修改。",
  ],
  [
    "agent-tasks",
    "智能体任务",
    "AgentTasks",
    "Agents",
    "agents",
    "管理任务队列，查看进行中、待审批与已完成的工作。",
  ],
  [
    "agent-approvals",
    "智能体审批",
    "AgentApprovals",
    "Agents",
    "agents",
    "集中检查 Agent 的请求，修改参数并批准或拒绝。",
  ],
  [
    "agent-routines",
    "定时任务",
    "AgentRoutines",
    "Agents",
    "agents",
    "管理自动任务的时间、执行指令和启用状态。",
  ],
  [
    "agent-orchestrator",
    "多智能体协作",
    "AgentOrchestrator",
    "Agents",
    "agents",
    "同时运行多个 Agent，观察分工、进度与结果汇总。",
  ],
  [
    "mcp-servers",
    "MCP 服务",
    "McpServers",
    "Agents",
    "agents",
    "管理工具连接，检查服务器状态与可用的工具。",
  ],
  [
    "knowledge-base",
    "知识库",
    "KnowledgeBase",
    "Agents",
    "agents",
    "管理知识文档，查看索引状态并体验引用检索。",
  ],
  [
    "eval-suite",
    "评测套件",
    "EvalSuite",
    "Agents",
    "",
    "对比新旧版本的评测结果，逐项查看通过、退步和改善的案例。",
  ],
  [
    "agent-builder",
    "智能体配置",
    "AgentBuilder",
    "Agents",
    "agents",
    "配置角色、工具和行为，然后在测试对话中验证。",
  ],
  [
    "agent-gallery",
    "智能体模板",
    "AgentGallery",
    "Agents",
    "agents",
    "浏览不同用途的 Agent，查看配置并选择一个开始。",
  ],
] as const

export const registryRepository = "axgiroud312-byte/arc-workbench"
export const registryHome = "https://github.com/" + registryRepository
export const installRoot = "@/components/arc-workbench"
export const installStyles = '@import "' + installRoot + '/library/styles.css";'

const conversationIds = new Set([
  "ai-chat",
  "ai-composer",
  "ai-answer",
  "model-picker",
  "attachments",
  "message",
  "question",
  "suggestion",
])
const contextIds = new Set([
  "checkpoint",
  "code-block",
  "context",
  "inline-citation",
  "reasoning",
  "shimmer",
  "sources",
])

export const librarySections = {
  conversation: "对话与输入",
  context: "推理与上下文",
  execution: "编程与执行",
  workflows: "AI 工作流",
  agents: "Agent 管理",
} as const
type LibrarySection = keyof typeof librarySections

function librarySection(
  id: string,
  category: keyof typeof blockCategories
): LibrarySection {
  if (conversationIds.has(id)) return "conversation"
  if (contextIds.has(id)) return "context"
  if (category === "AI") return "workflows"
  if (category === "Agents") return "agents"
  return "execution"
}

export const blockCatalog = definitions.map(
  ([id, name, exportName, category, group, description, options]) => {
    const config = options ?? codingPreviews[id]
    const location = "components/blocks/" + (group ? group + "/" : "") + id
    const previewExport = config?.demo ?? exportName
    return {
      id,
      name,
      exportName,
      category,
      group,
      section: librarySection(id, category),
      description,
      location,
      path: "src/" + location + ".tsx",
      reference:
        config?.reference ?? "https://uiarc.dev/components/blocks/" + id,
      previewExport,
      usageExport: config?.useDemo ? previewExport : exportName,
    }
  }
)
export type CatalogEntry = (typeof blockCatalog)[number]

export const libraryKits = [
  {
    id: "foundation",
    title: "Base UI 基础包",
    description: "按钮、表单、菜单、侧栏、消息滚动、代码块和执行轨迹。",
    entry: null,
    preview: null,
  },
  {
    id: "chat-kit",
    title: "AI 对话套件",
    description: "对话、输入框、模型选择、附件、引用和推理摘要。",
    entry: "src/library/chat-kit.ts",
    preview: "ai-chat",
  },
  {
    id: "coding-kit",
    title: "编程工作台套件",
    description: "编程对话、子 Agent 编排、审批、文件审阅、命令、测试和设置。",
    entry: "src/library/coding-kit.ts",
    preview: "coding-agent-panel",
  },
  {
    id: "agent-kit",
    title: "Agent 管理套件",
    description: "运行、任务、审批、工具连接、知识库、配置和评测。",
    entry: "src/library/agent-kit.ts",
    preview: "agent-run",
  },
] as const

export function installCommand(id: string) {
  return "npx shadcn@latest add " + registryRepository + "/" + id
}

const themedEntries = new Set(["coding-agent-panel", "coding-settings"])

export function installationExample(entry: CatalogEntry) {
  const name = entry.usageExport
  const component =
    "import { " + name + ' } from "' + installRoot + "/" + entry.location + '"'
  if (themedEntries.has(entry.id)) {
    return [
      component,
      'import { ThemeProvider } from "' +
        installRoot +
        '/components/theme-provider"',
      "",
      "export default function Example() {",
      "  return (",
      '    <ThemeProvider storageKey="arc-workbench-theme">',
      "      <" + name + " />",
      "    </ThemeProvider>",
      "  )",
      "}",
    ].join("\n")
  }
  return [
    component,
    "",
    "export default function Example() {",
    "  return <" + name + " />",
    "}",
  ].join("\n")
}
