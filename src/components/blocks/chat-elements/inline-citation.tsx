import { ExternalLink } from "lucide-react"
import { Button } from "../../ui/button"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../../ui/hover-card"
import { PreviewCard } from "../coding-agent/preview-card"
import { sampleSources, type SourceLink } from "./sources"

export function InlineCitation({
  source,
  index,
}: {
  source: SourceLink
  index: number
}) {
  return (
    <HoverCard>
      <HoverCardTrigger
        delay={120}
        render={
          <Button
            variant="secondary"
            size="icon-xs"
            nativeButton={false}
            render={<a href={source.url} target="_blank" rel="noreferrer" />}
            aria-label={"来源 " + index + " " + source.title}
          />
        }
      >
        {index}
      </HoverCardTrigger>
      <HoverCardContent className="flex flex-col gap-2">
        <span className="text-xs text-muted-foreground">{source.domain}</span>
        <span className="font-medium">{source.title}</span>
        {source.note && <p className="text-muted-foreground">{source.note}</p>}
        <a
          href={source.url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 underline underline-offset-4"
        >
          阅读来源
          <ExternalLink className="size-3.5" />
        </a>
      </HoverCardContent>
    </HoverCard>
  )
}

export function InlineCitationDemo() {
  return (
    <PreviewCard title="内联引用">
      <p className="text-sm leading-7">
        处理回车前，可以先确认输入法是否正在组字。
        <span className="ml-1 inline-flex align-middle">
          <InlineCitation source={sampleSources[0]} index={1} />
        </span>
      </p>
    </PreviewCard>
  )
}
