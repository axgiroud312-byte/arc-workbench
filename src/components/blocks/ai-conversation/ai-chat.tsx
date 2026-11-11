import { useEffect, useRef, useState, type Ref } from "react"
import {
  ArrowDown,
  ChevronDown,
  FileCode2,
  GitBranch,
  PanelRight,
  Pencil,
  Plus,
  RotateCcw,
} from "lucide-react"
import { Button } from "../../ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../../ui/card"
import { Message, MessageContent, MessageFooter } from "../../ui/message"
import { Bubble, BubbleContent } from "../../ui/bubble"
import {
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerButton,
} from "../../ui/message-scroller"
import { Trace } from "../../ui/trace"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
} from "../../ui/dropdown-menu"
import { BrandMark } from "../shared"
import { Attachments } from "../chat-elements/attachments"
import { MessageBranchPicker } from "../chat-elements/message-branches"
import {
  MessageFeedback,
  type MessageFeedbackValue,
} from "../chat-elements/message-feedback"
import {
  ComposerInput,
  type ComposerSubmission,
  type SendMode,
} from "./composer-input"
import { CopyAction, FeedbackActions } from "./demo-helpers"
import { getDemoModel } from "./model-picker"
import { cn } from "../../../lib/utils"
import { ReasoningSteps } from "../coding-agent/reasoning-steps"
import { ToolCall } from "../coding-agent/tool-call"
import { SubagentCall } from "../coding-agent/subagent-call"
import {
  AgentInteraction,
  RunEvidenceActions,
} from "../coding-agent/agent-interaction"
import { DelegationGroup } from "../coding-agent/delegation-group"
import { RunOrchestration } from "../coding-agent/run-orchestration"
import {
  getPendingRequest,
  getRunEvidence,
  getWorkers,
  type RunRequest,
  type RunSelection,
  type WorkspaceView,
} from "../coding-agent/run-record"
import {
  codingDemoPrompt,
  codingDemoReply,
  codingDemoTitle,
  completedCodingActivity,
  respondToCodingPreview,
  stopActivity,
  streamCodingDemo,
  type AgentActivity,
} from "../coding-agent/coding-demo"

export type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
  model?: string
  version?: number
  attachments?: string[]
  activity?: AgentActivity
}

export type ChatSummary = {
  title: string
  model: string
  messages: ChatMessage[]
  running: boolean
  branchId?: string
}

export type ChatBranch = {
  id: string
  title: string
  messages: ChatMessage[]
}

type ChatBranchState = ChatBranch & {
  running?: boolean
  draft?: { text: string; editId?: string }
}

type OrchestrationTranscript = {
  messages: ChatMessage[]
  running?: boolean
  onRetryWorker: (workerId: string) => void
}

export const originalChatBranchId = "original"

type ActiveReply = {
  id: string
  controller: AbortController
  decision?: { id: string; settle: (value?: string) => void }
}

const initialMessages: ChatMessage[] = [
  {
    id: "first-question",
    role: "user",
    content: codingDemoPrompt,
  },
  {
    id: "first-answer",
    role: "assistant",
    content: codingDemoReply,
    model: "sonnet",
    version: 1,
    activity: completedCodingActivity,
  },
]

export function AiChat({
  initialMessages: supplied,
  initialBranches,
  initialBranchTitle = "原始分支",
  initialTitle = codingDemoTitle,
  initialModel = "sonnet",
  sessionId,
  workspace = false,
  orchestrationTranscript,
  previewPaused = false,
  confirmEdits = false,
  askScope = false,
  expandDelegations = true,
  selection,
  requestFocus,
  onInspect,
  sendMode,
  onSend,
  onActivityChange,
  onSessionChange,
  className,
}: {
  initialMessages?: ChatMessage[]
  initialBranches?: readonly ChatBranch[]
  initialBranchTitle?: string
  initialTitle?: string
  initialModel?: string
  sessionId?: string
  workspace?: boolean
  orchestrationTranscript?: OrchestrationTranscript
  previewPaused?: boolean
  confirmEdits?: boolean
  askScope?: boolean
  expandDelegations?: boolean
  selection?: RunSelection
  requestFocus?: number
  onInspect?: (selection: RunSelection, view?: WorkspaceView) => void
  sendMode?: SendMode
  onSend?: (submission: ComposerSubmission) => void
  onActivityChange?: (activity: AgentActivity | undefined) => void
  onSessionChange?: (id: string, summary: ChatSummary) => void
  className?: string
} = {}) {
  const [branches, setBranches] = useState<ChatBranchState[]>(() => [
    {
      id: originalChatBranchId,
      title: initialBranchTitle,
      messages: supplied ?? initialMessages,
      running: previewPaused,
    },
    ...(initialBranches ?? []),
  ])
  const [branchId, setBranchId] = useState(originalChatBranchId)
  const branchIndex = Math.max(
    0,
    branches.findIndex((branch) => branch.id === branchId)
  )
  const branch = branches[branchIndex]
  const messages = orchestrationTranscript?.messages ?? branch.messages
  const prompt = branch.draft?.text ?? ""
  const editing = branch.draft?.editId
  const running = orchestrationTranscript?.running ?? !!branch.running
  const [feedback, setFeedback] = useState<
    Record<string, MessageFeedbackValue | undefined>
  >({})
  const [model, setModel] = useState(initialModel)
  const [title, setTitle] = useState(initialTitle)
  const activeReplies = useRef(new Map<string, ActiveReply>())
  const pendingCard = useRef<HTMLDivElement>(null)
  const latestActivity = messages.at(-1)?.activity
  const pendingRequest = getPendingRequest(latestActivity)
  const turns = messages.filter((message) => message.role === "assistant")

  useEffect(() => {
    onActivityChange?.(latestActivity)
  }, [latestActivity, onActivityChange])

  useEffect(() => {
    if (sessionId)
      onSessionChange?.(sessionId, {
        title,
        model,
        messages,
        running,
        branchId,
      })
  }, [sessionId, title, model, messages, running, branchId, onSessionChange])

  function focusPending() {
    pendingCard.current?.scrollIntoView({ block: "nearest" })
    pendingCard.current?.focus({ preventScroll: true })
  }
  useEffect(() => {
    if (requestFocus) focusPending()
  }, [requestFocus])

  useEffect(() => {
    const replies = activeReplies.current
    return () => {
      for (const reply of replies.values()) reply.controller.abort()
      replies.clear()
    }
  }, [])

  function updateBranch(
    id: string,
    update: (current: ChatBranchState) => ChatBranchState
  ) {
    setBranches((current) =>
      current.map((item) => (item.id === id ? update(item) : item))
    )
  }

  function setPrompt(text: string) {
    updateBranch(branchId, (current) => ({
      ...current,
      draft: { ...current.draft, text },
    }))
  }

  function forkBranch(title: string, messages: ChatMessage[]) {
    const id = crypto.randomUUID()
    setBranches((current) => [...current, { id, title, messages }])
    setBranchId(id)
    return id
  }

  const stopReply = () => {
    const reply = activeReplies.current.get(branchId)
    activeReplies.current.delete(branchId)
    reply?.controller.abort()
    const id =
      reply?.id ?? (previewPaused && running ? turns.at(-1)?.id : undefined)
    if (!id) return
    updateBranch(branchId, (current) => ({
      ...current,
      running: false,
      messages: current.messages.map((message) =>
        message.id === id
          ? {
              ...message,
              activity: stopActivity(message.activity),
              content: message.content || "已停止本次演示。",
            }
          : message
      ),
    }))
  }

  const applyReplyFrame = (
    targetBranchId: string,
    id: string,
    frame: Pick<ChatMessage, "activity" | "content">
  ) => {
    updateBranch(targetBranchId, (current) => ({
      ...current,
      messages: current.messages.map((message) =>
        message.id === id ? { ...message, ...frame } : message
      ),
    }))
  }

  const respondToRequest = (
    message: ChatMessage,
    requestId: string,
    value: string
  ) => {
    const reply = activeReplies.current.get(branchId)
    if (reply) {
      if (reply.id === message.id && reply.decision?.id === requestId)
        reply.decision.settle(value)
      return
    }
    if (
      !previewPaused ||
      !running ||
      message !== turns.at(-1) ||
      !message.activity
    )
      return
    const frame = respondToCodingPreview(message.activity, requestId, value)
    if (!frame) return
    applyReplyFrame(branchId, message.id, frame)
    updateBranch(branchId, (current) => ({
      ...current,
      running: !!getPendingRequest(frame.activity),
    }))
  }

  const startReply = async (
    targetBranchId: string,
    id: string,
    question: string
  ) => {
    const controller = new AbortController()
    const reply: ActiveReply = { id, controller }
    activeReplies.current.set(targetBranchId, reply)
    updateBranch(targetBranchId, (current) => ({ ...current, running: true }))
    const isCurrentReply = () =>
      activeReplies.current.get(targetBranchId) === reply
    const waitForRequest = (request: RunRequest) =>
      new Promise<string | undefined>((resolve) => {
        if (controller.signal.aborted) {
          resolve(undefined)
          return
        }
        function finish(value?: string) {
          controller.signal.removeEventListener("abort", cancel)
          reply.decision = undefined
          resolve(value)
        }
        const cancel = () => finish()
        reply.decision = { id: request.id, settle: finish }
        controller.signal.addEventListener("abort", cancel, { once: true })
      })

    try {
      for await (const frame of streamCodingDemo(question, controller.signal, {
        askScope,
        confirmEdits,
        onRequest: waitForRequest,
      })) {
        if (!isCurrentReply()) return
        applyReplyFrame(targetBranchId, id, frame)
      }
    } catch {
      if (isCurrentReply()) {
        updateBranch(targetBranchId, (current) => ({
          ...current,
          messages: current.messages.map((message) =>
            message.id === id
              ? {
                  ...message,
                  activity: stopActivity(message.activity, "error"),
                  content: "演示中断了，可以重新生成回答。",
                }
              : message
          ),
        }))
      }
    } finally {
      if (isCurrentReply()) {
        activeReplies.current.delete(targetBranchId)
        updateBranch(targetBranchId, (current) => ({
          ...current,
          running: false,
        }))
      }
    }
  }

  const send = (submission: ComposerSubmission) => {
    if (running || activeReplies.current.has(branchId)) return
    const editIndex = editing
      ? messages.findIndex((item) => item.id === editing)
      : -1
    const fork = workspace && editIndex >= 0
    const base =
      editIndex >= 0 && (fork || !onInspect)
        ? messages.slice(0, editIndex)
        : messages
    const id = crypto.randomUUID()
    const replyId = `${id}-answer`
    const next: ChatMessage[] = [
      ...base,
      {
        id,
        role: "user",
        content: submission.text,
        attachments:
          fork && !submission.files.length
            ? messages[editIndex].attachments
            : submission.files.map((file) => file.name),
      },
      {
        id: replyId,
        role: "assistant",
        content: "",
        model: submission.model,
        version: 1,
      },
    ]
    const targetBranchId = fork
      ? forkBranch("编辑消息 · " + submission.text.slice(0, 26), next)
      : branchId
    updateBranch(branchId, (current) => ({
      ...current,
      messages: fork ? current.messages : next,
      draft: undefined,
    }))
    if (!base.length && !fork) setTitle(submission.text.slice(0, 42))
    onSend?.(submission)
    void startReply(targetBranchId, replyId, submission.text)
  }
  const retry = (message: ChatMessage) => {
    if (running || activeReplies.current.has(branchId)) return
    const index = messages.findIndex((item) => item.id === message.id)
    const question = messages
      .slice(0, index)
      .reverse()
      .find((item) => item.role === "user")
    if (!question) return
    if (workspace) {
      const replyId = crypto.randomUUID() + "-answer"
      const targetBranchId = forkBranch(
        "重新生成 · " + question.content.slice(0, 26),
        [
          ...messages.slice(0, index),
          { id: replyId, role: "assistant", content: "", model },
        ]
      )
      void startReply(targetBranchId, replyId, question.content)
      return
    }
    if (onInspect) {
      const id = crypto.randomUUID()
      const replyId = id + "-answer"
      updateBranch(branchId, (current) => ({
        ...current,
        messages: [
          ...messages,
          { ...question, id },
          { id: replyId, role: "assistant", content: "", model },
        ],
      }))
      void startReply(branchId, replyId, question.content)
      return
    }
    updateBranch(branchId, (current) => ({
      ...current,
      messages: messages.slice(0, index + 1).map((item) =>
        item.id === message.id
          ? {
              ...item,
              content: "",
              activity: undefined,
              version: (item.version ?? 1) + 1,
              model,
            }
          : item
      ),
    }))
    void startReply(branchId, message.id, question.content)
  }
  const resetThread = (nextMessages: ChatMessage[], nextTitle: string) => {
    for (const reply of activeReplies.current.values()) reply.controller.abort()
    activeReplies.current.clear()
    setBranches([
      {
        id: originalChatBranchId,
        title: initialBranchTitle,
        messages: nextMessages,
      },
    ])
    setBranchId(originalChatBranchId)
    setFeedback({})
    setTitle(nextTitle)
  }
  const newChat = () => resetThread([], "新对话")
  const otherRunning = branches.filter(
    (item) => item.id !== branchId && item.running
  ).length
  return (
    <Card
      className={cn(
        "flex h-[620px] w-full flex-col gap-0 overflow-hidden",
        className
      )}
    >
      {!workspace && (
        <CardHeader className="border-b pb-4">
          {sessionId ? (
            <div className="flex min-w-0 items-center justify-between gap-2">
              <CardTitle className="truncate">{title}</CardTitle>
              {!running && (
                <span className="shrink-0 text-xs text-muted-foreground">
                  {confirmEdits ? "写入需审批" : "自动应用示例改动"}
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={<Button variant="ghost" className="min-w-0" />}
                >
                  <CardTitle className="truncate">{title}</CardTitle>
                  <ChevronDown data-icon="inline-end" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={newChat}>
                      <Plus />
                      新对话
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        resetThread(initialMessages, codingDemoTitle)
                      }
                    >
                      <FileCode2 />
                      {codingDemoTitle}
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="新建对话"
                onClick={newChat}
              >
                <Plus />
              </Button>
            </div>
          )}
        </CardHeader>
      )}
      {!orchestrationTranscript && branches.length > 1 && (
        <div className="flex min-w-0 shrink-0 items-center gap-2 border-b px-3 py-1.5 text-xs sm:px-4">
          <GitBranch
            className="size-3.5 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <span className="shrink-0 text-muted-foreground">对话分支</span>
          <span
            className="min-w-0 flex-1 truncate font-medium"
            aria-live="polite"
            title={branch.title}
          >
            {branch.title}
          </span>
          {otherRunning > 0 && (
            <span className="hidden shrink-0 text-muted-foreground sm:inline">
              {otherRunning} 个分支处理中
            </span>
          )}
          <MessageBranchPicker
            index={branchIndex}
            count={branches.length}
            onChange={(index) => setBranchId(branches[index].id)}
          />
        </div>
      )}
      <CardContent
        className={cn(
          "min-h-0 flex-1 py-0",
          workspace ? "px-0" : "px-3 sm:px-5"
        )}
      >
        <MessageScrollerProvider
          key={branchId}
          autoScroll
          defaultScrollPosition={workspace ? "last-anchor" : "end"}
          scrollPreviousItemPeek={workspace ? 0 : undefined}
        >
          <MessageScroller>
            <MessageScrollerViewport aria-label="对话消息">
              <MessageScrollerContent className="py-6">
                {messages.length === 0 && (
                  <MessageScrollerItem messageId="empty">
                    <div className="flex min-h-64 flex-col items-center justify-center gap-4">
                      <BrandMark
                        brand={getDemoModel(model).brand}
                        className="size-8"
                      />
                      <h3 className="text-xl font-medium">
                        今天想一起做些什么？
                      </h3>
                      <Button
                        variant="outline"
                        onClick={() => setPrompt(codingDemoPrompt)}
                      >
                        {codingDemoTitle}
                      </Button>
                    </div>
                  </MessageScrollerItem>
                )}
                {messages.map((message) => (
                  <MessageScrollerItem
                    key={message.id}
                    messageId={message.id}
                    scrollAnchor={message.role === "user"}
                  >
                    <Message align={message.role === "user" ? "end" : "start"}>
                      <MessageContent>
                        {message.role === "assistant" && (
                          <>
                            <div className="flex items-center gap-2">
                              <BrandMark
                                brand={getDemoModel(message.model).brand}
                              />
                              <span className="text-xs text-muted-foreground">
                                {getDemoModel(message.model).name}
                              </span>
                              {onInspect && message.activity && (
                                <Button
                                  variant={
                                    selection?.turnId === message.id &&
                                    !selection.workerId
                                      ? "secondary"
                                      : "ghost"
                                  }
                                  size="xs"
                                  className="ml-auto"
                                  aria-label={
                                    "查看第 " +
                                    (turns.indexOf(message) + 1) +
                                    " 轮"
                                  }
                                  aria-pressed={
                                    selection?.turnId === message.id &&
                                    !selection.workerId
                                  }
                                  onClick={() =>
                                    onInspect({ turnId: message.id })
                                  }
                                >
                                  <PanelRight data-icon="inline-start" />第{" "}
                                  {turns.indexOf(message) + 1} 轮
                                </Button>
                              )}
                            </div>
                            {message.activity && (
                              <ChatActivity
                                activity={message.activity}
                                expandDelegations={expandDelegations}
                                selectedWorker={
                                  selection?.turnId === message.id
                                    ? selection.workerId
                                    : undefined
                                }
                                onInspect={
                                  onInspect
                                    ? (workerId, view) =>
                                        onInspect(
                                          { turnId: message.id, workerId },
                                          view
                                        )
                                    : undefined
                                }
                                pendingCard={
                                  message === turns.at(-1)
                                    ? pendingCard
                                    : undefined
                                }
                                onRespond={(requestId, value) =>
                                  respondToRequest(message, requestId, value)
                                }
                                onRetryWorker={
                                  orchestrationTranscript?.onRetryWorker
                                }
                              />
                            )}
                          </>
                        )}
                        {message.content && (
                          <Bubble
                            align={message.role === "user" ? "end" : "start"}
                            variant={
                              message.role === "user" ? "muted" : "ghost"
                            }
                          >
                            <BubbleContent>
                              <p className="leading-7 whitespace-pre-line">
                                {message.content}
                              </p>
                            </BubbleContent>
                          </Bubble>
                        )}
                        {message.attachments?.length ? (
                          <Attachments
                            items={message.attachments.map((name, index) => ({
                              id: String(index),
                              name,
                            }))}
                          />
                        ) : null}
                        {onInspect && message.activity && message.content && (
                          <RunEvidenceActions
                            evidence={getRunEvidence(message.activity)}
                            showWorkflow={
                              message.activity.steps.length > 0 ||
                              getWorkers(message.activity).length > 0
                            }
                            onInspect={(view) =>
                              onInspect({ turnId: message.id }, view)
                            }
                          />
                        )}
                        {message.content &&
                          (!orchestrationTranscript ||
                            (workspace && message.role === "assistant")) && (
                            <MessageFooter className="flex-wrap">
                              <CopyAction value={message.content} />
                              {message.role === "assistant" ? (
                                <>
                                  {!orchestrationTranscript && (
                                    <Button
                                      variant="ghost"
                                      size="icon-sm"
                                      aria-label="重新生成回答"
                                      disabled={running}
                                      onClick={() => retry(message)}
                                    >
                                      <RotateCcw />
                                    </Button>
                                  )}
                                  {workspace ? (
                                    (!running ||
                                      message.id !== turns.at(-1)?.id) && (
                                      <MessageFeedback
                                        value={feedback[message.id]}
                                        onChange={(value) =>
                                          setFeedback((current) => ({
                                            ...current,
                                            [message.id]: value,
                                          }))
                                        }
                                      />
                                    )
                                  ) : (
                                    <FeedbackActions />
                                  )}
                                  {(message.version ?? 1) > 1 && (
                                    <span className="ml-2">
                                      版本 {message.version}
                                    </span>
                                  )}
                                </>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  aria-label="编辑消息"
                                  disabled={running}
                                  onClick={() => {
                                    updateBranch(branchId, (current) => ({
                                      ...current,
                                      draft: {
                                        text: message.content,
                                        editId: message.id,
                                      },
                                    }))
                                  }}
                                >
                                  <Pencil />
                                </Button>
                              )}
                            </MessageFooter>
                          )}
                      </MessageContent>
                    </Message>
                  </MessageScrollerItem>
                ))}
              </MessageScrollerContent>
            </MessageScrollerViewport>
            <MessageScrollerButton aria-label="滚动到最新消息">
              <ArrowDown />
              <span className="sr-only">滚动到最新消息</span>
            </MessageScrollerButton>
          </MessageScroller>
        </MessageScrollerProvider>
      </CardContent>
      {!orchestrationTranscript && (
        <CardFooter className="flex flex-col gap-2 pt-3">
          {editing && (
            <div className="flex w-full items-center justify-between text-xs text-muted-foreground">
              <span>
                {workspace
                  ? "正在编辑消息 · 发送后创建分支"
                  : onInspect
                    ? "正在编辑消息 · 发送后新增一轮"
                    : "正在编辑消息 · 发送后从这里重新对话"}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  updateBranch(branchId, (current) => ({
                    ...current,
                    draft: undefined,
                  }))
                }}
              >
                取消
              </Button>
            </div>
          )}
          <ComposerInput
            value={prompt}
            onChange={setPrompt}
            onSend={send}
            running={running}
            onStop={stopReply}
            sendMode={sendMode}
            model={model}
            onModelChange={setModel}
            compact
          />
          {workspace ? (
            <div className="flex min-h-6 w-full items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>本地演示</span>
              {pendingRequest ? (
                <Button size="xs" variant="ghost" onClick={focusPending}>
                  {pendingRequest.kind === "approval"
                    ? "回到审批"
                    : "回到测试范围"}
                </Button>
              ) : (
                <span aria-live="polite">
                  {running
                    ? "正在执行"
                    : confirmEdits
                      ? "写入需审批"
                      : "自动应用示例改动"}
                </span>
              )}
            </div>
          ) : (
            <p
              className={cn(
                "text-center text-xs text-muted-foreground",
                onInspect && !running && "sr-only"
              )}
              role="status"
            >
              {pendingRequest
                ? pendingRequest.kind === "approval"
                  ? "等待审批"
                  : "等待选择测试范围"
                : running
                  ? "正在运行示例"
                  : "本地演示 · 示例工作区"}
            </p>
          )}
        </CardFooter>
      )}
    </Card>
  )
}

function ChatActivity({
  activity,
  expandDelegations,
  selectedWorker,
  pendingCard,
  onInspect,
  onRespond,
  onRetryWorker,
}: {
  activity: AgentActivity
  expandDelegations: boolean
  selectedWorker?: string
  pendingCard?: Ref<HTMLDivElement>
  onInspect?: (workerId: string, view?: WorkspaceView) => void
  onRespond: (id: string, value: string) => void
  onRetryWorker?: (workerId: string) => void
}) {
  const workers = getWorkers(activity)
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <Trace aria-label="本轮执行记录">
        {onInspect ? (
          activity.steps.length > 0 && (
            <RunOrchestration steps={activity.steps} />
          )
        ) : (
          <ReasoningSteps steps={activity.steps} />
        )}
        {activity.actions.map((action) =>
          action.kind === "tool" ? (
            <ToolCall key={action.id} call={action} />
          ) : (
            !onInspect && <SubagentCall key={action.id} call={action} />
          )
        )}
      </Trace>
      {onInspect && workers.length > 0 && (
        <DelegationGroup
          workers={workers}
          selectedId={selectedWorker}
          onInspect={onInspect}
          onRetry={onRetryWorker}
          defaultOpen={expandDelegations}
        />
      )}
      {activity.requests?.map((request) => {
        const worker = workers.find((item) => item.id === request.workerId)
        return (
          <div
            key={request.id}
            ref={request.status === "pending" ? pendingCard : undefined}
            tabIndex={request.status === "pending" ? -1 : undefined}
            className="rounded-lg focus-visible:ring-2 focus-visible:ring-ring"
          >
            <AgentInteraction
              request={request}
              source={
                worker
                  ? [worker.title, worker.model?.name]
                      .filter(Boolean)
                      .join(" · ")
                  : undefined
              }
              onRespond={(value) => onRespond(request.id, value)}
              onInspect={
                onInspect
                  ? (view) => onInspect(request.workerId, view)
                  : undefined
              }
            />
          </div>
        )
      })}
    </div>
  )
}
