import { ExternalLink, Globe } from "lucide-react"
import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "../../ui/trace"
import { PreviewCard } from "../coding-agent/preview-card"

export type SourceLink = {
  title: string
  url: string
  domain: string
  note?: string
}

export const sampleSources: SourceLink[] = [
  {
    title: "检测键盘事件是否正在组字",
    url: "https://developer.mozilla.org/zh-CN/docs/Web/API/KeyboardEvent/isComposing",
    domain: "MDN",
    note: "判断这次键盘事件是否发生在输入法组字期间。",
  },
  {
    title: "React 事件处理",
    url: "https://zh-hans.react.dev/learn/responding-to-events",
    domain: "React",
    note: "为界面控件注册事件处理函数。",
  },
]

export function Sources({
  items,
  defaultOpen = false,
}: {
  items: SourceLink[]
  defaultOpen?: boolean
}) {
  if (!items.length) return null
  return (
    <TraceCollapsible defaultOpen={defaultOpen}>
      <TraceCollapsibleTrigger>
        <TraceLine>
          <TraceIcon>
            <Globe />
          </TraceIcon>
          <TraceTitle>参考了 {items.length} 个来源</TraceTitle>
        </TraceLine>
      </TraceCollapsibleTrigger>
      <TraceCollapsibleContent>
        <Trace>
          {items.map((source) => (
            <a
              key={source.url}
              href={source.url}
              target="_blank"
              rel="noreferrer"
            >
              <TraceLine>
                <TraceIcon>
                  <ExternalLink />
                </TraceIcon>
                <TraceTitle>{source.title}</TraceTitle>
              </TraceLine>
            </a>
          ))}
        </Trace>
      </TraceCollapsibleContent>
    </TraceCollapsible>
  )
}

export function SourcesDemo() {
  return (
    <PreviewCard title="参考来源">
      <Trace>
        <Sources items={sampleSources} defaultOpen />
      </Trace>
    </PreviewCard>
  )
}
