import { useState } from "react"
import { Button } from "@base-ui/react/button"
import { DirectionProvider, useDirection } from "../../components/ui/direction"

function DirectionExample() {
  const direction = useDirection()
  return (
    <div
      dir={direction}
      className="flex w-full items-center gap-3 rounded-lg border bg-card p-4 text-sm"
    >
      <span className="grid size-9 place-items-center rounded-lg bg-muted font-mono">
        01
      </span>
      <span className="flex-1">会话记录</span>
      <span aria-hidden className="text-muted-foreground">
        {direction === "ltr" ? "→" : "←"}
      </span>
    </div>
  )
}

export default function DirectionDemo() {
  const [direction, setDirection] = useState<"ltr" | "rtl">("ltr")
  return (
    <div className="mx-auto grid max-w-xs gap-3">
      <DirectionProvider direction={direction}>
        <DirectionExample />
      </DirectionProvider>
      <Button
        className="justify-self-start rounded-md border bg-background px-3 py-1.5 text-sm hover:bg-muted"
        onClick={() => setDirection(direction === "ltr" ? "rtl" : "ltr")}
      >
        {direction === "ltr" ? "切换为从右到左" : "切换为从左到右"}
      </Button>
    </div>
  )
}
