import { useState } from "react"
import {
  FileDiff as FileDiffIcon,
  FlaskConical,
  ListChecks,
  ShieldCheck,
  ShieldX,
  TerminalSquare,
} from "lucide-react"
import { Button } from "../../ui/button"
import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoices,
  QuestionnaireError,
  QuestionnaireItem,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from "../../ui/questionnaire"
import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "../../ui/trace"
import { CodeSample } from "./code-sample"
import { Confirmation } from "./confirmation"
import { PreviewCard } from "./preview-card"
import type {
  RunApproval,
  RunEvidence,
  RunQuestion,
  RunRequest,
  WorkspaceView,
} from "./run-record"

type AgentInteractionProps = {
  request: RunRequest
  source?: string
  onRespond?: (value: string) => void
  onInspect?: (view: WorkspaceView) => void
}

export function AgentInteraction({
  request,
  source,
  onRespond,
  onInspect,
}: AgentInteractionProps) {
  if (request.status !== "pending") {
    const Icon =
      request.kind === "question"
        ? ListChecks
        : request.status === "approved"
          ? ShieldCheck
          : ShieldX
    const answer =
      request.kind === "question"
        ? request.options.find((option) => option.id === request.answer)?.label
        : undefined
    const label =
      request.kind === "question"
        ? answer
          ? "已选择 · " + answer
          : "测试范围询问已取消"
        : request.status === "approved"
          ? "已批准写入"
          : request.status === "denied"
            ? "已拒绝写入"
            : "写入审批已取消"
    return (
      <Trace>
        <TraceCollapsible>
          <TraceCollapsibleTrigger>
            <TraceLine>
              <TraceIcon>
                <Icon />
              </TraceIcon>
              <TraceTitle>{label}</TraceTitle>
            </TraceLine>
          </TraceCollapsibleTrigger>
          <TraceCollapsibleContent className="flex flex-col gap-1 text-xs text-muted-foreground">
            {source && <p>{source}</p>}
            <p>{request.title}</p>
            {request.kind === "approval" && <p>{request.detail}</p>}
          </TraceCollapsibleContent>
        </TraceCollapsible>
      </Trace>
    )
  }

  if (request.kind === "approval") {
    return (
      <Confirmation
        request={request}
        source={source}
        onDecision={
          onRespond
            ? (approved) => onRespond(approved ? "approve" : "deny")
            : undefined
        }
        onReview={onInspect ? () => onInspect("changes") : undefined}
      />
    )
  }
  return (
    <section
      className="flex min-w-0 flex-col gap-2 rounded-lg border bg-muted/25 p-3"
      aria-label={request.title}
    >
      {source && <p className="text-xs text-muted-foreground">{source}</p>}
      {onRespond ? (
        <Questionnaire
          items={[
            {
              name: request.id,
              required: true,
              choices: request.options.map(({ id }) => ({ value: id })),
            },
          ]}
          className="gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            const answer = new FormData(event.currentTarget).get(request.id)
            if (
              typeof answer === "string" &&
              request.options.some((option) => option.id === answer)
            )
              onRespond(answer)
          }}
        >
          <QuestionnaireItem name={request.id} required className="gap-2">
            <QuestionnaireTitle className="text-sm">
              {request.title}
            </QuestionnaireTitle>
            <QuestionnaireChoices className="sm:grid-cols-2">
              {request.options.map((option) => (
                <QuestionnaireChoice key={option.id} value={option.id}>
                  {option.label}
                </QuestionnaireChoice>
              ))}
            </QuestionnaireChoices>
            <QuestionnaireError>请选择测试范围。</QuestionnaireError>
          </QuestionnaireItem>
          <QuestionnaireActions>
            <QuestionnaireSubmit size="sm">提交选择</QuestionnaireSubmit>
          </QuestionnaireActions>
        </Questionnaire>
      ) : (
        <p className="text-sm font-medium">{request.title}</p>
      )}
    </section>
  )
}

export function RunEvidenceActions({
  evidence,
  onInspect,
}: {
  evidence: RunEvidence
  onInspect: (view: WorkspaceView) => void
}) {
  const changes = evidence.files.filter(
    (entry) => entry.status === "changed"
  ).length
  const lastRun = evidence.testRuns.at(-1)
  const tests = lastRun?.suites.flatMap((suite) => suite.tests) ?? []
  const failed = tests.filter((test) => test.failure).length
  return (
    <div className="flex flex-wrap gap-1.5" aria-label="本轮结果">
      {changes > 0 && (
        <Button
          variant="outline"
          size="xs"
          onClick={() => onInspect("changes")}
        >
          <FileDiffIcon data-icon="inline-start" />
          {changes} 个文件改动
        </Button>
      )}
      {evidence.commands.length > 0 && (
        <Button
          variant="outline"
          size="xs"
          onClick={() => onInspect("terminal")}
        >
          <TerminalSquare data-icon="inline-start" />
          {evidence.commands.length} 条命令
        </Button>
      )}
      {tests.length > 0 && (
        <Button variant="outline" size="xs" onClick={() => onInspect("tests")}>
          <FlaskConical data-icon="inline-start" />
          {failed ? failed + " 项测试失败" : tests.length + " 项测试通过"}
        </Button>
      )}
    </div>
  )
}

const sampleQuestion: RunQuestion = {
  kind: "question",
  id: "coverage",
  workerId: "tests",
  title: "这次验证哪些回车行为？",
  options: [
    { id: "all", label: "选字、发送和换行" },
    { id: "ime", label: "只验证输入法选字" },
  ],
  status: "pending",
}
const sampleApproval: RunApproval = {
  kind: "approval",
  id: "write",
  workerId: "tests",
  title: "允许应用示例改动？",
  detail: "chat-input.tsx、chat-input.test.tsx",
  status: "pending",
}

export function AgentInteractionDemo() {
  const [question, setQuestion] = useState(sampleQuestion)
  const [approval, setApproval] = useState(sampleApproval)
  const [showDiff, setShowDiff] = useState(false)

  return (
    <PreviewCard title="智能工具界面">
      <AgentInteraction
        key="coverage"
        request={question}
        source="补回归测试 · Codex"
        onRespond={(answer) =>
          setQuestion({ ...sampleQuestion, status: "answered", answer })
        }
      />
      {question.status === "answered" && (
        <AgentInteraction
          key="write"
          request={approval}
          source="补回归测试 · Codex"
          onRespond={(value) =>
            setApproval({
              ...sampleApproval,
              status: value === "approve" ? "approved" : "denied",
            })
          }
          onInspect={() => setShowDiff((current) => !current)}
        />
      )}
      {showDiff && (
        <CodeSample
          title="拟改 · chat-input.tsx"
          value={"- handleSubmit()\n+ if (!event.isComposing) handleSubmit()"}
        />
      )}
      {approval.status === "approved" && (
        <p className="text-sm" role="status">
          已批准示例改动，将运行{question.answer === "all" ? "三项" : "一项"}
          回归测试。
        </p>
      )}
      {question.status !== "pending" && (
        <Button
          variant="ghost"
          size="sm"
          className="self-start"
          onClick={() => {
            setQuestion(sampleQuestion)
            setApproval(sampleApproval)
            setShowDiff(false)
          }}
        >
          重置演示
        </Button>
      )}
    </PreviewCard>
  )
}
