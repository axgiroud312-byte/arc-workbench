import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockTitle,
} from "../../ui/code-block"

export function CodeSample({
  title,
  value,
  lineNumbers = false,
  error = false,
}: {
  title: string
  value: string
  lineNumbers?: boolean
  error?: boolean
}) {
  return (
    <CodeBlock size="sm" variant={error ? "destructive" : "default"}>
      <CodeBlockHeader>
        <CodeBlockTitle className="min-w-0 flex-1" title={title}>
          {title}
        </CodeBlockTitle>
        <CodeBlockActions>
          <CodeBlockCopyButton value={value} aria-label={"复制" + title} />
        </CodeBlockActions>
      </CodeBlockHeader>
      <CodeBlockContent wrap lineNumbers={lineNumbers} className="max-h-64">
        {value}
      </CodeBlockContent>
    </CodeBlock>
  )
}
