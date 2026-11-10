import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockLine,
  CodeBlockTitle,
} from "../../ui/code-block"

export type FileDiff = {
  path: string
  lines: { variant: "default" | "added" | "removed"; text: string }[]
}

export function DiffPreview({ file }: { file: FileDiff }) {
  const patch = file.lines
    .map(
      ({ variant, text }) =>
        (variant === "added" ? "+" : variant === "removed" ? "-" : " ") + text
    )
    .join("\n")

  return (
    <CodeBlock size="sm" className="coding-diff">
      <CodeBlockHeader>
        <CodeBlockTitle className="flex-1 text-xs" title={file.path}>
          {file.path}
        </CodeBlockTitle>
        <CodeBlockActions>
          <CodeBlockCopyButton value={patch} aria-label="复制文件差异" />
        </CodeBlockActions>
      </CodeBlockHeader>
      <CodeBlockContent lineNumbers wrap aria-label="文件差异">
        {file.lines.map((line, index) => (
          <CodeBlockLine key={index} variant={line.variant}>
            {line.text}
          </CodeBlockLine>
        ))}
      </CodeBlockContent>
    </CodeBlock>
  )
}
