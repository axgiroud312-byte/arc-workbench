import { useState } from "react"
import { Button } from "../../ui/button"
import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoices,
  QuestionnaireError,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from "../../ui/questionnaire"
import { PreviewCard } from "../coding-agent/preview-card"

const questions = [
  {
    name: "behavior",
    required: true,
    prompt: "平时按回车要做什么？",
    choices: [{ value: "直接发送" }, { value: "换一行" }],
  },
  {
    name: "coverage",
    required: true,
    prompt: "这次要验证哪些行为？",
    choices: [{ value: "选字、发送和换行" }, { value: "只验证选字" }],
  },
] as const

export function QuestionDemo() {
  const [answers, setAnswers] = useState<string[] | null>(null)
  return (
    <PreviewCard title="Agent 向你提问">
      {answers ? (
        <>
          <dl className="flex flex-col gap-3 text-sm" aria-label="已提交的答案">
            {questions.map((question, index) => (
              <div
                key={question.name}
                className="flex flex-wrap justify-between gap-2"
              >
                <dt className="text-muted-foreground">{question.prompt}</dt>
                <dd>{answers[index]}</dd>
              </div>
            ))}
          </dl>
          <Button
            size="sm"
            variant="outline"
            className="self-start"
            onClick={() => setAnswers(null)}
          >
            重新回答
          </Button>
        </>
      ) : (
        <Questionnaire
          items={questions}
          shortcuts="numbers"
          onSubmit={(event) => {
            event.preventDefault()
            const data = new FormData(event.currentTarget)
            setAnswers(
              questions.map((question) => String(data.get(question.name) ?? ""))
            )
          }}
        >
          <QuestionnaireProgress
            aria-label="答题进度"
            render={(props, { current, total }) => (
              <div
                {...props}
                aria-valuetext={"第 " + current + " 题，共 " + total + " 题"}
              >
                第 {current} 题，共 {total} 题
              </div>
            )}
          />
          {questions.map((question) => (
            <QuestionnaireItem
              key={question.name}
              name={question.name}
              required
            >
              <QuestionnaireTitle>{question.prompt}</QuestionnaireTitle>
              <QuestionnaireChoices>
                {question.choices.map((choice) => (
                  <QuestionnaireChoice key={choice.value} value={choice.value}>
                    {choice.value}
                  </QuestionnaireChoice>
                ))}
              </QuestionnaireChoices>
              <QuestionnaireError>请先选择一个答案。</QuestionnaireError>
            </QuestionnaireItem>
          ))}
          <QuestionnaireActions>
            <QuestionnairePrevious>上一题</QuestionnairePrevious>
            <QuestionnaireNext>下一题</QuestionnaireNext>
            <QuestionnaireSubmit>提交答案</QuestionnaireSubmit>
          </QuestionnaireActions>
        </Questionnaire>
      )}
    </PreviewCard>
  )
}
