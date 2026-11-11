import { useState } from "react"
import { Button } from "@base-ui/react/button"
import { AspectRatio } from "../../components/ui/aspect-ratio"

export default function AspectRatioDemo() {
  const [wide, setWide] = useState(true)
  return (
    <div className="mx-auto grid w-full max-w-xs gap-3">
      <AspectRatio ratio={wide ? 16 / 9 : 4 / 3}>
        <div className="flex size-full items-center justify-center rounded-lg border bg-card">
          <span className="text-3xl font-medium tabular-nums">
            {wide ? "16:9" : "4:3"}
          </span>
        </div>
      </AspectRatio>
      <div className="flex justify-center gap-2" aria-label="宽高比">
        <Button
          className="rounded-md border bg-background px-3 py-1.5 text-sm aria-pressed:border-foreground"
          aria-pressed={wide}
          onClick={() => setWide(true)}
        >
          宽屏
        </Button>
        <Button
          className="rounded-md border bg-background px-3 py-1.5 text-sm aria-pressed:border-foreground"
          aria-pressed={!wide}
          onClick={() => setWide(false)}
        >
          标准
        </Button>
      </div>
    </div>
  )
}
