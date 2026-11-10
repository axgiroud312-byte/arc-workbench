import { useState } from "react"
import { Check, ListTodo } from "lucide-react"
import { Button } from "../../ui/button"
import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceDescription,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "../../ui/trace"
import { ActivityLine } from "../coding-agent/activity-line"
import { PreviewCard } from "../coding-agent/preview-card"

type QueueItem = { id: string; title: string; done: boolean }

export function Queue({ items }: { items: QueueItem[] }) {
  return (
    <Trace aria-label="待办队列">
      {[false, true].map((done) => {
        const section = items.filter((item) => item.done === done)
        const title = done ? "已完成" : "待处理"
        return (
          <TraceCollapsible key={title} defaultOpen>
            <TraceCollapsibleTrigger>
              <TraceLine>
                <TraceIcon>{done ? <Check /> : <ListTodo />}</TraceIcon>
                <TraceTitle>{title}</TraceTitle>
                <TraceDescription>{section.length} 项</TraceDescription>
              </TraceLine>
            </TraceCollapsibleTrigger>
            <TraceCollapsibleContent>
              <Trace>
                {section.length ? (
                  section.map((item) => (
                    <ActivityLine
                      key={item.id}
                      title={item.title}
                      status={done ? "done" : "pending"}
                    />
                  ))
                ) : (
                  <p className="text-xs">暂无任务</p>
                )}
              </Trace>
            </TraceCollapsibleContent>
          </TraceCollapsible>
        )
      })}
    </Trace>
  )
}

const sample: QueueItem[] = [
  { id: "search", title: "定位回车处理函数", done: true },
  { id: "reproduce", title: "复现输入法误发送", done: false },
  { id: "test", title: "补齐回归测试", done: false },
]

export function QueueDemo() {
  const [items, setItems] = useState(sample)
  const next = items.find((item) => !item.done)
  return (
    <PreviewCard title="待办队列">
      <Queue items={items} />
      <Button
        size="sm"
        variant="outline"
        className="self-start"
        onClick={() =>
          setItems(
            next
              ? items.map((item) =>
                  item.id === next.id ? { ...item, done: true } : item
                )
              : sample
          )
        }
      >
        {next ? "完成下一项" : "重置队列"}
      </Button>
    </PreviewCard>
  )
}
