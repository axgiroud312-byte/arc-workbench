"use client"

import type { ReactNode } from "react"
import { Code2Icon, EyeIcon, FileTextIcon } from "lucide-react"

import {
  CodeBlock,
  CodeBlockContent,
  CodeBlockCopyButton,
} from "../../ui/code-block"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs"

export type Artifact = {
  title: string
  filename: string
  source: string
  preview?: ReactNode
}

export function ArtifactPanel({ artifact }: { artifact: Artifact }) {
  return (
    <section
      aria-label={artifact.title}
      className="min-w-0 overflow-hidden rounded-xl border bg-card"
    >
      <header className="flex items-center gap-2.5 border-b px-3.5 py-3">
        <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
          <FileTextIcon className="size-4" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-medium">{artifact.title}</h3>
          <p className="truncate font-mono text-xs text-muted-foreground">
            {artifact.filename}
          </p>
        </div>
        <CodeBlockCopyButton
          value={artifact.source}
          aria-label="复制产物源码"
        />
      </header>
      {artifact.preview == null ? (
        <ArtifactSource source={artifact.source} />
      ) : (
        <Tabs defaultValue="preview">
          <TabsList variant="line" className="mx-3">
            <TabsTrigger value="preview">
              <EyeIcon />
              预览
            </TabsTrigger>
            <TabsTrigger value="code">
              <Code2Icon />
              源码
            </TabsTrigger>
          </TabsList>
          <TabsContent value="preview" className="min-w-0 border-t p-4">
            {artifact.preview}
          </TabsContent>
          <TabsContent value="code" className="min-w-0 border-t">
            <ArtifactSource source={artifact.source} />
          </TabsContent>
        </Tabs>
      )}
    </section>
  )
}

function ArtifactSource({ source }: { source: string }) {
  return (
    <CodeBlock className="rounded-none border-0">
      <CodeBlockContent lineNumbers className="max-h-72">
        {source}
      </CodeBlockContent>
    </CodeBlock>
  )
}

const reportTitle = "本次检查结果"
const findings = [
  "完成 8 项组件测试",
  "修复表单重试时按钮无法启用的问题",
  "在桌面和手机尺寸下检查布局",
]
const source = [
  "# " + reportTitle,
  "",
  ...findings.map((finding) => "- " + finding),
].join("\n")

export function ArtifactPanelDemo() {
  return (
    <div className="mx-auto w-full max-w-lg">
      <ArtifactPanel
        artifact={{
          title: "Agent 执行报告",
          filename: "run-report.md",
          source,
          preview: (
            <article className="grid gap-3">
              <h4 className="text-base font-medium">{reportTitle}</h4>
              <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
                {findings.map((finding) => (
                  <li key={finding}>{finding}</li>
                ))}
              </ul>
            </article>
          ),
        }}
      />
    </div>
  )
}
