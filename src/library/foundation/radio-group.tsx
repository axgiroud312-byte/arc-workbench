import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group"

const choices = [
  { id: "always", label: "每次询问", detail: "执行写入前请求确认" },
  {
    id: "workspace",
    label: "信任当前工作区",
    detail: "只在离开当前目录时询问",
  },
  { id: "read", label: "仅允许读取", detail: "拒绝写入与执行命令" },
]

export default function RadioGroupDemo() {
  return (
    <RadioGroup
      defaultValue="always"
      aria-label="审批方式"
      className="mx-auto max-w-xs gap-2"
    >
      {choices.map(({ id, label, detail }) => (
        <label
          key={id}
          className="flex cursor-pointer items-start gap-3 rounded-lg border bg-card p-3 has-data-checked:border-foreground/50"
        >
          <RadioGroupItem value={id} />
          <span className="grid gap-1">
            <span className="text-sm font-medium">{label}</span>
            <span className="text-xs text-muted-foreground">{detail}</span>
          </span>
        </label>
      ))}
    </RadioGroup>
  )
}
