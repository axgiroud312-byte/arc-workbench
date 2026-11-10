import { FilePen, GitCommitHorizontal } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../ui/sheet"
import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
} from "../../ui/trace"
import { ActivityLine } from "../coding-agent/activity-line"
import { demoFiles } from "../coding-agent/coding-demo"
import { DiffPreview, type FileDiff } from "../coding-agent/diff-preview"
import { PreviewCard } from "../coding-agent/preview-card"

export function Commit({
  hash,
  title,
  files,
}: {
  hash: string
  title: string
  files: FileDiff[]
}) {
  return (
    <Trace>
      <TraceCollapsible defaultOpen>
        <TraceCollapsibleTrigger>
          <ActivityLine
            icon={GitCommitHorizontal}
            title={title}
            status="done"
            description={hash}
          />
        </TraceCollapsibleTrigger>
        <TraceCollapsibleContent>
          <Trace>
            {files.map((file) => (
              <Sheet key={file.path}>
                <SheetTrigger>
                  <ActivityLine
                    icon={FilePen}
                    title={file.path}
                    status="done"
                    description={
                      "+" +
                      file.lines.filter((line) => line.variant === "added")
                        .length +
                      " −" +
                      file.lines.filter((line) => line.variant === "removed")
                        .length
                    }
                  />
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-lg">
                  <SheetHeader>
                    <SheetTitle>文件差异</SheetTitle>
                  </SheetHeader>
                  <div className="min-h-0 overflow-y-auto px-4 pb-4">
                    <DiffPreview file={file} />
                  </div>
                </SheetContent>
              </Sheet>
            ))}
          </Trace>
        </TraceCollapsibleContent>
      </TraceCollapsible>
    </Trace>
  )
}

export function CommitDemo() {
  return (
    <PreviewCard title="提交记录">
      <Commit
        hash="a1b2c3d"
        title="修复中文输入法回车误发送"
        files={demoFiles}
      />
    </PreviewCard>
  )
}
