import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockLine,
  CodeBlockTitle,
} from "../../ui/code-block"
import { useHighlightedCode } from "../../../hooks/use-highlighted-code"
import { PreviewCard } from "../coding-agent/preview-card"

export function HighlightedCode({
  title,
  value,
  language,
}: {
  title: string
  value: string
  language: string
}) {
  const lines = useHighlightedCode(value, language)
  return (
    <CodeBlock>
      <CodeBlockHeader>
        <CodeBlockTitle>{title}</CodeBlockTitle>
        <CodeBlockActions>
          <CodeBlockCopyButton value={value} aria-label="复制代码" />
        </CodeBlockActions>
      </CodeBlockHeader>
      <CodeBlockContent lineNumbers>
        {lines.map((line, index) => (
          <CodeBlockLine key={index}>{line}</CodeBlockLine>
        ))}
      </CodeBlockContent>
    </CodeBlock>
  )
}

export function CodeBlockDemo() {
  return (
    <PreviewCard title="代码块">
      <HighlightedCode
        title="chat-input.tsx"
        language="tsx"
        value={
          'function handleEnter(event: KeyboardEvent) {\n  if (event.isComposing || event.shiftKey) return\n  if (event.key === "Enter") submitMessage()\n}'
        }
      />
    </PreviewCard>
  )
}
