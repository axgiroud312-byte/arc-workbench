import { useState } from "react"
import { ArrowUpRight } from "lucide-react"
import { Button } from "../../ui/button"
import { ComposerInput } from "../ai-conversation/composer-input"
import { PreviewCard } from "../coding-agent/preview-card"

export function Suggestion({
  text,
  onSelect,
}: {
  text: string
  onSelect: (text: string) => void
}) {
  return (
    <Button size="sm" variant="outline" onClick={() => onSelect(text)}>
      {text}
      <ArrowUpRight data-icon="inline-end" />
    </Button>
  )
}

export function SuggestionDemo() {
  const [prompt, setPrompt] = useState("")
  const [sent, setSent] = useState("")
  return (
    <PreviewCard title="建议提示词">
      <div className="flex flex-wrap gap-2">
        {["帮我看测试为什么失败", "解释这次改动", "检查中文输入法"].map(
          (text) => (
            <Suggestion key={text} text={text} onSelect={setPrompt} />
          )
        )}
      </div>
      <ComposerInput
        value={prompt}
        onChange={setPrompt}
        onSend={({ text }) => {
          setSent(text)
          setPrompt("")
        }}
        compact
      />
      {sent && (
        <p role="status" className="text-sm text-muted-foreground">
          已发送「{sent}」
        </p>
      )}
    </PreviewCard>
  )
}
