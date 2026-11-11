import { useEffect, useState } from "react"
import { Button } from "@base-ui/react/button"
import { Spinner } from "../../components/ui/spinner"

export default function SpinnerDemo() {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle")
  useEffect(() => {
    if (state !== "loading") return
    const timer = window.setTimeout(() => setState("done"), 1400)
    return () => window.clearTimeout(timer)
  }, [state])
  return (
    <div className="flex flex-col items-center gap-3">
      <Button
        className="inline-flex items-center gap-2 rounded-md border bg-background px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:opacity-60"
        disabled={state === "loading"}
        onClick={() => setState("loading")}
      >
        {state === "loading" && (
          <Spinner className="size-4" aria-label="正在检查" />
        )}
        {state === "loading" ? "检查中" : "检查组件"}
      </Button>
      <p className="text-xs text-muted-foreground" role="status">
        {
          { idle: "等待开始", loading: "正在读取组件状态…", done: "检查完成" }[
            state
          ]
        }
      </p>
    </div>
  )
}
