import type { HTMLAttributes } from "react"
import { cn } from "cn"

const variants = {
  h1: "text-4xl font-semibold tracking-tight text-balance",
  h2: "border-b pb-2 text-2xl font-semibold tracking-tight text-balance",
  h3: "text-xl font-semibold tracking-tight",
  h4: "text-lg font-medium tracking-tight",
  p: "text-sm leading-7",
  blockquote: "border-l-2 pl-4 text-sm leading-6 text-muted-foreground",
  ul: "list-disc space-y-1 pl-6 text-sm leading-6",
  code: "rounded bg-muted px-1.5 py-0.5 font-mono text-sm font-medium",
  lead: "text-base leading-7 text-muted-foreground",
  small: "text-xs leading-5 text-muted-foreground",
} as const

type Variant = keyof typeof variants

export function Typography({
  variant = "p",
  className,
  ...props
}: HTMLAttributes<HTMLElement> & { variant?: Variant }) {
  const Tag = variant === "lead" ? "p" : variant
  return (
    <Tag
      data-slot="typography"
      className={cn(variants[variant], className)}
      {...props}
    />
  )
}
