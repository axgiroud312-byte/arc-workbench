import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../../components/ui/resizable"

export default function ResizableDemo() {
  return (
    <div className="mx-auto h-36 w-full max-w-sm overflow-hidden rounded-lg border bg-card">
      <ResizablePanelGroup>
        <ResizablePanel defaultSize="40%" minSize="20%">
          <div className="grid h-full place-items-center p-2 text-sm">
            文件列表
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle aria-label="调整文件栏宽度" />
        <ResizablePanel defaultSize="60%" minSize="30%">
          <div className="grid h-full place-items-center bg-muted/50 p-2 text-sm">
            代码预览
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
