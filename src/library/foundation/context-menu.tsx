import { useState } from "react"
import { FileTextIcon, FolderOpenIcon, InfoIcon } from "lucide-react"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "../../components/ui/context-menu"

export default function ContextMenuDemo() {
  const [action, setAction] = useState("")
  return (
    <div className="mx-auto grid max-w-xs justify-items-center gap-3">
      <ContextMenu>
        <ContextMenuTrigger className="flex min-h-24 w-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed bg-card px-5 text-sm">
          <FileTextIcon className="size-5 text-muted-foreground" />
          README.md
          <span className="text-xs text-muted-foreground">右键点击或长按</span>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={() => setAction("已打开文件")}>
            <FolderOpenIcon />
            打开
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() => setAction("项目根目录 · Markdown 文件")}
          >
            <InfoIcon />
            查看详情
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      <span role="status" className="min-h-4 text-xs text-muted-foreground">
        {action}
      </span>
    </div>
  )
}
