import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../components/ui/alert-dialog"

export default function AlertDialogDemo() {
  const [open, setOpen] = useState(false)
  const [deleted, setDeleted] = useState(false)
  return (
    <div className="flex flex-col items-center gap-3">
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger className="rounded-md border bg-background px-3 py-1.5 text-sm font-medium hover:bg-muted">
          删除草稿
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除这份草稿？</AlertDialogTitle>
            <AlertDialogDescription>
              草稿中的说明和修改记录将被移除。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>保留草稿</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                setDeleted(true)
                setOpen(false)
              }}
            >
              删除草稿
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <p className="text-xs text-muted-foreground" role="status">
        {deleted ? "草稿已删除" : "草稿已保存"}
      </p>
    </div>
  )
}
