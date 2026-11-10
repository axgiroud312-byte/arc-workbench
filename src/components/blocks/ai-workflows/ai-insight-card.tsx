import { useState } from "react"
import { ChevronUp, Sparkles, Square, TrendingDown } from "lucide-react"
import { Button } from "../../ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../ui/card"
import { Separator } from "../../ui/separator"
import { Badge } from "../../ui/badge"
import { BrandMark } from "../shared"
import { cn } from "../../../lib/utils"
import { useTextReveal } from "./demo-hooks"

const series = [84, 62, 80, 70, 73, 48, 67]
const previous = [87, 94, 90, 86, 82, 63, 63]
const pathFor = (values: number[]) => values.map((value, index) => `${index ? "L" : "M"} ${14 + index * 78.5} ${145 - value}`).join(" ")
const drivers = [
  { label: "团队版", delta: "−$26,900", amount: 81, point: 1 },
  { label: "专业版", delta: "−$9,500", amount: 29, point: 3 },
  { label: "企业版", delta: "+$3,400", amount: 10, point: 6 },
]
const explanations = {
  default: "两个欧洲、中东和非洲地区的团队暂停续费，导致净收入下降。部分专业版客户的付款重试仍未成功，也影响了收入。企业版的额外使用量弥补了部分降幅。",
  quarter: "收入仍比上季度同期高出 12.8%。企业版扩容是增长的主要来源，本周的回落则主要来自团队版续费减少。",
  plan: "团队版收入减少 2.69 万美元，专业版减少 9500 美元，企业版增加 3400 美元。三项合计，净收入减少 3.3 万美元。",
}

export function AiInsightCard() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<number | null>(null)
  const [followUp, setFollowUp] = useState<keyof typeof explanations>("default")
  const reveal = useTextReveal()
  const explain = (key: keyof typeof explanations = "default") => { setFollowUp(key); setOpen(true); reveal.start(explanations[key]) }
  return <Card className="mx-auto w-full max-w-xl overflow-hidden">
    <CardHeader><div className="flex items-center justify-between gap-4"><div className="flex flex-wrap items-center gap-x-3 gap-y-1"><CardTitle>净收入</CardTitle><CardDescription>10 月 20 日至 26 日</CardDescription></div><Button variant="outline" size="sm" aria-expanded={open} onClick={() => { if (reveal.running) reveal.stop(); else if (open) setOpen(false); else explain() }}>{reveal.running ? <Square data-icon="inline-start" /> : open ? <ChevronUp data-icon="inline-start" /> : <Sparkles data-icon="inline-start" />}{reveal.running ? "停止" : open ? "收起" : "解释变化"}</Button></div></CardHeader>
    <CardContent className="flex flex-col gap-5">
      <div className="flex flex-wrap items-baseline gap-3"><strong className="text-4xl font-medium tracking-tight tabular-nums">$482,100</strong><span className="flex items-center gap-1 text-sm text-destructive"><TrendingDown className="size-3.5" />−6.4%</span><span className="text-xs text-muted-foreground">较上周</span></div>
      <div tabIndex={0} role="group" aria-label="收入图表。使用左右方向键查看 7 天的收入。" className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring" onKeyDown={e => { if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); setActive(Math.max(0, Math.min(6, (active ?? 0) + (e.key === "ArrowRight" ? 1 : -1)))) } if (e.key === "Escape") setActive(null) }}>
        <svg viewBox="0 0 500 160" className="w-full overflow-visible" role="img" aria-label="本周收入较上周下降">
          <path d={pathFor(previous)} fill="none" stroke="var(--muted-foreground)" strokeWidth="1.5" strokeDasharray="5 5" opacity="0.6" />
          <path d={pathFor(series)} fill="none" stroke="var(--foreground)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          {series.map((v, i) => <g key={i} onMouseEnter={() => setActive(i)} onMouseLeave={() => setActive(null)}><rect x={i * 71} y="20" width="71" height="125" fill="transparent" /><circle cx={14 + i * 78.5} cy={145 - v} r={active === i ? 5 : 0} fill="var(--background)" stroke="var(--foreground)" strokeWidth="2" /></g>)}
          {open && drivers.map((driver, i) => <g key={driver.label}><line x1={14 + driver.point * 78.5} x2={14 + driver.point * 78.5} y1="22" y2={145 - series[driver.point]} stroke="var(--border)" strokeDasharray="3 4" /><circle cx={14 + driver.point * 78.5} cy="12" r="10" stroke="var(--border)" fill="var(--card)" /><text x={14 + driver.point * 78.5} y="16" textAnchor="middle" fontSize="11" fill="var(--muted-foreground)">{i + 1}</text><circle cx={14 + driver.point * 78.5} cy={145 - series[driver.point]} r="4" fill="var(--card)" stroke="var(--foreground)" strokeWidth="2" /></g>)}
        </svg>
        <div className="flex justify-between text-xs text-muted-foreground"><span>10 月 20 日，周一</span><span aria-live="polite">{active !== null ? `$${(series[active] * 1000).toLocaleString("zh-CN")}` : "10 月 26 日，周日"}</span></div>
      </div>
      {open && <><Separator /><div className="flex flex-col gap-5"><p className="min-h-20 text-sm leading-6" aria-busy={reveal.running}>{reveal.text || "正在查看账单和续费记录…"}</p><div className="flex flex-col gap-4">{drivers.map((driver, i) => <div key={driver.label} className="flex items-center gap-3" onMouseEnter={() => setActive(driver.point)} onMouseLeave={() => setActive(null)}><Badge variant="outline">{i + 1}</Badge><span className="flex-1 text-sm">{driver.label}</span><div className="hidden h-1.5 w-20 overflow-hidden rounded-full bg-muted sm:block"><div className="h-full rounded-full bg-foreground/45" style={{ width: `${driver.amount}%` }} /></div><span className={cn("w-20 text-right text-sm tabular-nums", i === 2 ? "text-success" : "text-destructive")}>{driver.delta}</span></div>)}</div><div className="flex flex-wrap gap-2"><Button variant="outline" size="sm" disabled={reveal.running} aria-pressed={followUp === "quarter"} onClick={() => explain("quarter")}>与上季度比较</Button><Button variant="outline" size="sm" disabled={reveal.running} aria-pressed={followUp === "plan"} onClick={() => explain("plan")}>按套餐查看</Button></div></div></>}
    </CardContent>
    <CardFooter className="flex flex-wrap justify-between gap-3 text-xs text-muted-foreground"><span className="flex items-center gap-2"><BrandMark brand="stripe" />Stripe 账单 · 示例数据</span><span className="flex items-center gap-2"><BrandMark brand="claude" />Claude Sonnet</span></CardFooter>
  </Card>
}
