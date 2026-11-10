import { useState } from "react"
import { FlaskConical } from "lucide-react"
import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
} from "../../ui/trace"
import { ActivityLine, type ActivityStatus } from "./activity-line"
import { CodeSample } from "./code-sample"
import { PreviewCard } from "./preview-card"

type TestCase = { title: string; failure?: string }
export type TestRun = {
  id: string
  title: string
  status: ActivityStatus
  suites: { file: string; tests: TestCase[] }[]
}

function testCounts(tests: TestCase[]) {
  const failed = tests.filter((test) => test.failure).length
  const passed = tests.length - failed
  return failed ? passed + " 通过 · " + failed + " 失败" : passed + " 通过"
}

export function TestResults({ runs }: { runs: TestRun[] }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  return (
    <Trace aria-label="测试记录">
      {runs.map((run, index) => {
        const tests = run.suites.flatMap((suite) => suite.tests)
        const line = (
          <ActivityLine
            icon={FlaskConical}
            title={run.title}
            status={run.status}
            description={tests.length ? testCounts(tests) : undefined}
          />
        )
        return tests.length ? (
          <TraceCollapsible
            key={run.id}
            open={expanded[run.id] ?? index === runs.length - 1}
            onOpenChange={(open) =>
              setExpanded((current) => ({ ...current, [run.id]: open }))
            }
          >
            <TraceCollapsibleTrigger>{line}</TraceCollapsibleTrigger>
            <TraceCollapsibleContent>
              <Trace>
                {run.suites.map((suite) => (
                  <TraceCollapsible key={suite.file} defaultOpen>
                    <TraceCollapsibleTrigger>
                      <ActivityLine
                        title={suite.file}
                        status={
                          suite.tests.some((test) => test.failure)
                            ? "error"
                            : "done"
                        }
                        description={testCounts(suite.tests)}
                      />
                    </TraceCollapsibleTrigger>
                    <TraceCollapsibleContent>
                      <Trace>
                        {suite.tests.map((test) =>
                          test.failure ? (
                            <TraceCollapsible key={test.title}>
                              <TraceCollapsibleTrigger>
                                <ActivityLine
                                  title={test.title}
                                  status="error"
                                />
                              </TraceCollapsibleTrigger>
                              <TraceCollapsibleContent>
                                <CodeSample
                                  title="失败详情"
                                  value={test.failure}
                                  error
                                />
                              </TraceCollapsibleContent>
                            </TraceCollapsible>
                          ) : (
                            <ActivityLine
                              key={test.title}
                              title={test.title}
                              status="done"
                              description="通过"
                            />
                          )
                        )}
                      </Trace>
                    </TraceCollapsibleContent>
                  </TraceCollapsible>
                ))}
              </Trace>
            </TraceCollapsibleContent>
          </TraceCollapsible>
        ) : (
          <div key={run.id}>{line}</div>
        )
      })}
    </Trace>
  )
}

const sampleRun: TestRun = {
  id: "verify-input",
  title: "输入框回归测试",
  status: "error",
  suites: [
    {
      file: "chat-input.test.tsx",
      tests: [
        { title: "普通回车发送" },
        { title: "Shift + Enter 换行" },
        {
          title: "选字回车不发送",
          failure: "预期提交 0 次，实际提交 1 次。\nchat-input.test.tsx:17",
        },
      ],
    },
  ],
}

export function TestResultsDemo() {
  return (
    <PreviewCard title="测试结果">
      <TestResults runs={[sampleRun]} />
    </PreviewCard>
  )
}
