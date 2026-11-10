import { useState } from "react"
import { ChevronRight, FileCode2, Folder } from "lucide-react"
import { Button } from "../../ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../ui/collapsible"
import { cn } from "../../../lib/utils"
import { CodeSample } from "./code-sample"
import { PreviewCard } from "./preview-card"

export type FileNode =
  { path: string; children: FileNode[] } | { path: string; modified?: boolean }

export function FileTree({
  nodes,
  selectedPath,
  onSelect,
  className,
}: {
  nodes: FileNode[]
  selectedPath?: string
  onSelect: (path: string) => void
  className?: string
}) {
  return (
    <ul
      className={cn("flex min-w-0 flex-col gap-0.5", className)}
      aria-label="文件树"
    >
      {nodes.map((node) => (
        <FileTreeNode
          key={node.path}
          node={node}
          selectedPath={selectedPath}
          onSelect={onSelect}
        />
      ))}
    </ul>
  )
}

function FileTreeNode({
  node,
  selectedPath,
  onSelect,
}: {
  node: FileNode
  selectedPath?: string
  onSelect: (path: string) => void
}) {
  const name = node.path.split("/").at(-1)
  const selected = node.path === selectedPath
  return (
    <li className="min-w-0">
      {"children" in node ? (
        <Collapsible defaultOpen>
          <CollapsibleTrigger
            render={
              <Button
                variant="ghost"
                size="sm"
                className="group w-full justify-start"
              />
            }
          >
            <ChevronRight
              data-icon="inline-start"
              className="transition-transform group-aria-expanded:rotate-90"
            />
            <Folder data-icon="inline-start" />
            <span className="truncate">{name}</span>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <ul className="ml-3 flex flex-col gap-0.5 border-l pl-1.5">
              {node.children.map((child) => (
                <FileTreeNode
                  key={child.path}
                  node={child}
                  selectedPath={selectedPath}
                  onSelect={onSelect}
                />
              ))}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      ) : (
        <Button
          variant={selected ? "secondary" : "ghost"}
          size="sm"
          className="w-full justify-start"
          title={node.path}
          aria-current={selected || undefined}
          onClick={() => onSelect(node.path)}
        >
          <FileCode2 data-icon="inline-start" />
          <span className="min-w-0 flex-1 truncate text-left font-mono text-xs">
            {name}
          </span>
          {node.modified && (
            <span className="shrink-0 text-xs text-muted-foreground">
              已修改
            </span>
          )}
        </Button>
      )}
    </li>
  )
}

const sampleFiles: Record<string, string> = {
  "src/chat-input.tsx":
    'export function ChatInput() {\n  return <textarea aria-label="消息" />\n}',
  "src/chat-input.test.tsx":
    'it("选字时保留输入", () => {\n  expect(submit).not.toHaveBeenCalled()\n})',
  "README.md": "# 聊天输入框\n\n回车发送，Shift + Enter 换行。",
}
const sampleNodes: FileNode[] = [
  {
    path: "src",
    children: [
      { path: "src/chat-input.tsx", modified: true },
      { path: "src/chat-input.test.tsx" },
    ],
  },
  { path: "README.md" },
]

export function FileTreeDemo() {
  const [path, setPath] = useState("src/chat-input.tsx")
  return (
    <PreviewCard title="项目文件">
      <div className="grid gap-4 sm:grid-cols-[12rem_minmax(0,1fr)]">
        <FileTree nodes={sampleNodes} selectedPath={path} onSelect={setPath} />
        <CodeSample title={path} value={sampleFiles[path]} lineNumbers />
      </div>
    </PreviewCard>
  )
}
