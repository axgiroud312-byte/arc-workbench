import { useState } from "react"
import { AlignCenterIcon, AlignLeftIcon, AlignRightIcon } from "lucide-react"
import { Button } from "@base-ui/react/button"
import { ButtonGroup } from "../../components/ui/button-group"

const options = [
  { value: "left", label: "左对齐", Icon: AlignLeftIcon },
  { value: "center", label: "居中", Icon: AlignCenterIcon },
  { value: "right", label: "右对齐", Icon: AlignRightIcon },
] as const

export default function ButtonGroupDemo() {
  const [alignment, setAlignment] =
    useState<(typeof options)[number]["value"]>("left")
  return (
    <div className="mx-auto grid w-full max-w-xs justify-items-center gap-3">
      <ButtonGroup
        aria-label="对齐方式"
        className="overflow-hidden rounded-md border bg-card"
      >
        {options.map(({ value, label, Icon }) => (
          <Button
            key={value}
            aria-label={label}
            aria-pressed={alignment === value}
            onClick={() => setAlignment(value)}
            className="p-2 hover:bg-muted aria-pressed:bg-accent aria-pressed:text-accent-foreground"
          >
            <Icon className="size-4" />
          </Button>
        ))}
      </ButtonGroup>
      <p
        className="w-full rounded-lg border bg-card p-4 text-sm"
        style={{ textAlign: alignment }}
      >
        工作台预览
      </p>
    </div>
  )
}
