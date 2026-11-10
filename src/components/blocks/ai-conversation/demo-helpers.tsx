import { useCallback, useEffect, useRef, useState } from "react"
import { Check, Copy, ThumbsDown, ThumbsUp } from "lucide-react"
import { Button } from "../../ui/button"

export function useTextStream() {
  const [text, setText] = useState("")
  const [running, setRunning] = useState(false)
  const [stopped, setStopped] = useState(false)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)
  const clear = useCallback(() => {
    if (timer.current) clearInterval(timer.current)
    timer.current = null
  }, [])
  useEffect(() => clear, [clear])
  const start = useCallback(
    (output: string) => {
      clear()
      setText("")
      setStopped(false)
      setRunning(true)
      let cursor = 0
      timer.current = setInterval(() => {
        cursor = Math.min(output.length, cursor + 7)
        setText(output.slice(0, cursor))
        if (cursor === output.length) {
          clear()
          setRunning(false)
        }
      }, 22)
    },
    [clear]
  )
  const stop = useCallback(() => {
    clear()
    setRunning(false)
    setStopped(true)
  }, [clear])
  const reset = useCallback(() => {
    clear()
    setText("")
    setRunning(false)
    setStopped(false)
  }, [clear])
  return { text, running, stopped, start, stop, reset }
}

export function CopyAction({
  value,
  label = "复制回答",
}: {
  value: string
  label?: string
}) {
  const [copied, set已复制] = useState(false)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => set已复制(false), 1800)
    return () => clearTimeout(timer)
  }, [copied])
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={copied ? "已复制" : failed ? "复制失败，点击重试" : label}
      title={copied ? "已复制" : failed ? "复制失败，点击重试" : label}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value)
          set已复制(true)
          setFailed(false)
        } catch {
          setFailed(true)
        }
      }}
    >
      {copied ? <Check /> : <Copy />}
    </Button>
  )
}

export function FeedbackActions() {
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null)
  return (
    <>
      <Button
        variant={feedback === "up" ? "secondary" : "ghost"}
        size="icon-sm"
        aria-label="回答有帮助"
        aria-pressed={feedback === "up"}
        onClick={() => setFeedback(feedback === "up" ? null : "up")}
      >
        <ThumbsUp />
      </Button>
      <Button
        variant={feedback === "down" ? "secondary" : "ghost"}
        size="icon-sm"
        aria-label="回答没有帮助"
        aria-pressed={feedback === "down"}
        onClick={() => setFeedback(feedback === "down" ? null : "down")}
      >
        <ThumbsDown />
      </Button>
    </>
  )
}

export const sampleReply =
  "可以分阶段迁移，让应用在修改期间继续正常运行。\n\n1. 先添加允许为空的新字段，尽量缩短这一步持锁的时间。\n2. 更新应用，让新记录写入该字段。\n3. 分小批次补齐历史数据，每批之间短暂停顿。\n4. 核对数据，再添加非空约束。\n\n迁移期间关注锁等待、复制延迟和查询耗时。遇到异常时，可以暂停后续批次，保留已经完成的进度。"

export function makeDemoReply(prompt: string) {
  if (
    /postgres|database|migration|column|region|数据库|迁移|字段/i.test(prompt)
  )
    return sampleReply
  if (/short|concise|summari|简短|简洁|总结|概括|摘要/i.test(prompt))
    return "简要总结：\n\n先明确要得到什么结果，再把任务拆成可撤销的小步骤。每一步完成后检查结果，并保留恢复原状的方法。\n\n这是本地示例回答，可以体验逐字输出、停止和重试，无需连接真实模型。"
  return `关于“${prompt.slice(0, 100)}”，可以先明确希望得到的结果。\n\n• 找出最重要的目标。\n• 拆成几个具体步骤。\n• 先用一个小例子验证，再扩大范围。\n\n这是本地示例回答。你可以操作控件、添加附件和选择模型，文字不会发送到服务器。`
}
