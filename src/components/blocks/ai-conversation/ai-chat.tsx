import { useEffect, useRef, useState, type Ref } from "react"
import {
  ArrowDown,
  ChevronDown,
  FileCode2,
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
}

type OrchestrationTranscript = {
  messages: ChatMessage[]
  onRetryWorker: (workerId: string) => void
}

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
  const [localMessages, setMessages] = useState<ChatMessage[]>(
    supplied ?? initialMessages
  )
  const messages = orchestrationTranscript?.messages ?? localMessages
  const [prompt, setPrompt] = useState("")
  const [model, setModel] = useState(initialModel)
  const [title, setTitle] = useState(initialTitle)
  const [editing, setEditing] = useState<string | null>(null)
  const [running, setRunning] = useState(previewPaused)
  const activeReply = useRef<ActiveReply | null>(null)
  const pendingCard = useRef<HTMLDivElement>(null)
  const latestActivity = messages.at(-1)?.activity
  const pendingRequest = getPendingRequest(latestActivity)
  const turns = messages.filter((message) => message.role === "assistant")

  useEffect(() => {
    onActivityChange?.(latestActivity)
  }, [latestActivity, onActivityChange])

  useEffect(() => {
    if (sessionId)
      onSessionChange?.(sessionId, { title, model, messages, running })
  }, [sessionId, title, model, messages, running, onSessionChange])

  function focusPending() {
    pendingCard.current?.scrollIntoView({ block: "nearest" })
    pendingCard.current?.focus({ preventScroll: true })
  }
  useEffect(() => {
    if (requestFocus) focusPending()
  }, [requestFocus])

  useEffect(
    () => () => {
      const reply = activeReply.current
      activeReply.current = null
      reply?.controller.abort()
    },
    []
  )

  const cancelReply = () => {
    const reply = activeReply.current
    activeReply.current = null
    reply?.controller.abort()
    setRunning(false)
    return reply?.id
  }

  const stopReply = () => {
    const id =
      cancelReply() ?? (previewPaused && running ? turns.at(-1)?.id : undefined)
    if (!id) return
    setMessages((previous) =>
      previous.map((message) =>
        message.id === id
          ? {
              ...message,
              activity: stopActivity(message.activity),
              content: message.content || "已停止本次演示。",
            }
          : message
      )
    )
  }

  const applyReplyFrame = (
    id: string,
    frame: Pick<ChatMessage, "activity" | "content">
  ) => {
    setMessages((previous) =>
      previous.map((message) =>
        message.id === id ? { ...message, ...frame } : message
      )
    )
  }

  const respondToRequest = (
    message: ChatMessage,
    requestId: string,
    value: string
  ) => {
    const reply = activeReply.current
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
    applyReplyFrame(message.id, frame)
    setRunning(!!getPendingRequest(frame.activity))
  }

  const startReply = async (id: string, question: string) => {
    const controller = new AbortController()
    const reply: ActiveReply = { id, controller }
    activeReply.current = reply
    setRunning(true)
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
        if (activeReply.current !== reply) return
        applyReplyFrame(id, frame)
      }
    } catch {
      if (activeReply.current === reply) {
        setMessages((previous) =>
          previous.map((message) =>
            message.id === id
              ? {
                  ...message,
                  activity: stopActivity(message.activity, "error"),
                  content: "演示中断了，可以重新生成回答。",
                }
              : message
          )
        )
      }
    } finally {
      if (activeReply.current === reply) {
        activeReply.current = null
        setRunning(false)
      }
    }
  }

  const send = (submission: ComposerSubmission) => {
    if (running || activeReply.current) return
    const base =
      editing && !onInspect
        ? messages.slice(
            0,
            messages.findIndex((item) => item.id === editing)
          )
        : messages
    const id = crypto.randomUUID()
    const replyId = `${id}-answer`
    setMessages([
      ...base,
      {
        id,
        role: "user",
        content: submission.text,
        attachments: submission.files.map((file) => file.name),
      },
      {
        id: replyId,
        role: "assistant",
        content: "",
        model: submission.model,
        version: 1,
      },
    ])
    setPrompt("")
    setEditing(null)
    if (!base.length) setTitle(submission.text.slice(0, 42))
    onSend?.(submission)
    void startReply(replyId, submission.text)
  }
  const retry = (message: ChatMessage) => {
    if (running || activeReply.current) return
    const index = messages.findIndex((item) => item.id === message.id)
    const question = messages
      .slice(0, index)
      .reverse()
      .find((item) => item.role === "user")
    if (!question) return
    if (onInspect) {
      const id = crypto.randomUUID()
      const replyId = id + "-answer"
      setMessages([
        ...messages,
        { ...question, id },
        { id: replyId, role: "assistant", content: "", model },
      ])
      void startReply(replyId, question.content)
      return
    }
    setMessages(
      messages.slice(0, index + 1).map((item) =>
        item.id === message.id
          ? {
              ...item,
              content: "",
              activity: undefined,
              version: (item.version ?? 1) + 1,
              model,
            }
          : item
      )
    )
    void startReply(message.id, question.content)
  }
  const resetThread = (nextMessages: ChatMessage[], nextTitle: string) => {
    cancelReply()
    setMessages(nextMessages)
    setPrompt("")
    setEditing(null)
    setTitle(nextTitle)
  }
  const newChat = () => resetThread([], "新对话")
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
      <CardContent
        className={cn(
          "min-h-0 flex-1 py-0",
          workspace ? "px-0" : "px-3 sm:px-5"
        )}
      >
        <MessageScrollerProvider
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
                            onInspect={(view) =>
                              onInspect({ turnId: message.id }, view)
                            }
                          />
                        )}
                        {message.content && !orchestrationTranscript && (
                          <MessageFooter>
                            <CopyAction value={message.content} />
                            {message.role === "assistant" ? (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  aria-label="重新生成回答"
                                  disabled={running}
                                  onClick={() => retry(message)}
                                >
                                  <RotateCcw />
                                </Button>
                                <FeedbackActions />
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
                                  setEditing(message.id)
                                  setPrompt(message.content)
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
                {onInspect
                  ? "正在编辑消息 · 发送后新增一轮"
                  : "正在编辑消息 · 发送后从这里重新对话"}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditing(null)
                  setPrompt("")
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
