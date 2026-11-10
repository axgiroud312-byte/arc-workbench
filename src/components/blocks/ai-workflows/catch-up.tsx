import { useState } from "react"
import { ArrowUpRight, Check, CheckCheck, Sparkles, Square } from "lucide-react"
import { Button } from "../../ui/button"
import { Badge } from "../../ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../ui/card"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../ui/dialog"
import { BrandMark } from "../shared"
import { cn } from "../../../lib/utils"
import { useLocalProgress } from "./demo-hooks"

const items = [
  { id: "1", section: "needs-you", source: "Slack", brand: "slack" as const, text: "小雅希望你确认新的新手引导流程。", context: "#设计评审", when: "今天 9:42", detail: "三步新手引导的原型已准备好。请检查邀请成员这一步，并确认是否必须填写工作空间名称。" },
  { id: "2", section: "needs-you", source: "Gmail", brand: "gmail" as const, text: "Northwind 正在等待更新后的上线时间表。", context: "回复：企业版上线计划", when: "昨天 16:20", detail: "客户想了解首批试用的日期和准备事项。计划于 11 月 12 日开始试用，首批邀请 5 个团队。" },
  { id: "3", section: "decisions", source: "Linear", brand: "linear" as const, text: "团队决定每周发布，周三截止合并本周改动。", context: "ENG-208 · 发布流程", when: "昨天 14:05", detail: "周三下午前合并的改动将在周四发布。紧急修复仍可单独发布。" },
  { id: "4", section: "shipped", source: "GitHub", brand: "github" as const, text: "搜索已支持筛选和键盘操作。", context: "合并请求 #284", when: "周一 11:30", detail: "这次搜索更新加入了文档类型筛选、方向键操作，并改进了无结果时的提示。试用团队已可体验。" },
  { id: "5", section: "fyi", source: "Slack", brand: "slack" as const, text: "周五的产品演示改到 15:00。", context: "#产品", when: "周一 10:15", detail: "演示内容包括新版工作空间和搜索功能，最后留出 10 分钟收集反馈。" },
]

const sectionLabels: Record<string, string> = { "needs-you": "需要你处理", decisions: "已做决定", shipped: "已上线", fyi: "其他消息" }
const rangeLabels: Record<string, string> = { "1 day": "最近 1 天", "3 days": "最近 3 天", "1 week": "最近 1 周" }

export function CatchUp() {
  const [range, setRange] = useState("3 days")
  const [read, setRead] = useState<string[]>([])
  const [selected, setSelected] = useState<(typeof items)[number] | null>(null)
  const [started, setStarted] = useState(false)
  const run = useLocalProgress(2900)
  const dataset = range === "1 day" ? items.slice(0, 2) : items
  const visible = dataset.slice(0, Math.ceil(run.progress / 100 * dataset.length))
  const mark = (id: string) => setRead(current => current.includes(id) ? current.filter(x => x !== id) : [...current, id])
  const start = () => { setStarted(true); setRead([]); run.start() }
  return <Card className="mx-auto w-full max-w-2xl overflow-hidden">
    <CardHeader><div className="flex flex-wrap items-center justify-between gap-3"><CardTitle>欢迎回来</CardTitle><Select items={rangeLabels} value={range} onValueChange={value => { if (!value) return; setRange(value); setStarted(false); setRead([]); run.reset() }}><SelectTrigger aria-label="回顾时间范围" className="w-32"><SelectValue /></SelectTrigger><SelectContent><SelectGroup>{["1 day", "3 days", "1 week"].map(value => <SelectItem key={value} value={value}>{rangeLabels[value]}</SelectItem>)}</SelectGroup></SelectContent></Select></div><CardDescription>快速了解你错过的重要消息。</CardDescription></CardHeader>
    <CardContent className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{[{ name: "Slack", brand: "slack" as const, count: 42 }, { name: "Linear", brand: "linear" as const, count: 12 }, { name: "GitHub", brand: "github" as const, count: 8 }, { name: "Gmail", brand: "gmail" as const, count: 16 }].map(source => <div key={source.name} className="flex items-center gap-2 rounded-lg bg-muted/45 px-3 py-2.5"><BrandMark brand={source.brand} /><span className="text-xs">{source.name}</span><span className="ml-auto text-xs text-muted-foreground">{range === "1 day" ? Math.ceil(source.count / 3) : range === "1 week" ? source.count * 2 : source.count}</span></div>)}</div>
      {!started && <div className="flex flex-col items-center gap-4 py-8"><Sparkles className="size-6 text-muted-foreground" /><p className="text-sm text-muted-foreground">重要动态，集中看完。</p><Button onClick={start}><Sparkles data-icon="inline-start" />回顾{rangeLabels[range]}</Button></div>}
      {started && <div className="flex flex-col gap-6" aria-busy={run.running}>{["needs-you", "decisions", "shipped", "fyi"].map(section => { const rows = visible.filter(item => item.section === section); return rows.length > 0 && <section key={section}><div className="mb-3 flex items-center gap-2"><h4 className="text-xs font-medium">{sectionLabels[section]}</h4><Badge variant={section === "needs-you" ? "secondary" : "outline"}>{rows.length}</Badge></div><div className="flex flex-col gap-3">{rows.map(item => <div key={item.id} className={cn("flex items-start gap-3", read.includes(item.id) && "opacity-50")}><BrandMark brand={item.brand} className="mt-1 shrink-0" /><button className="min-w-0 flex-1 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring" onClick={() => setSelected(item)}><span className="block text-sm leading-6">{item.text}</span><span className="mt-1 block text-xs text-muted-foreground">{item.context} · {item.when}</span></button><Button size="icon-sm" variant="ghost" aria-label={read.includes(item.id) ? `标为未读：${item.text}` : `标为已读：${item.text}`} onClick={() => mark(item.id)}>{read.includes(item.id) ? <Check /> : <CheckCheck />}</Button></div>)}</div></section> })}</div>}
    </CardContent>
    <CardFooter className="flex flex-wrap justify-between gap-3"><span className="flex items-center gap-2 text-xs text-muted-foreground"><BrandMark brand="claude" />Claude Haiku · 本地摘要</span>{started && <Button variant="ghost" size="sm" disabled={!visible.length} onClick={() => { if (run.running) run.stop(); else setRead(dataset.map(item => item.id)) }}>{run.running ? <Square data-icon="inline-start" /> : <CheckCheck data-icon="inline-start" />}{run.running ? "停止" : read.length === dataset.length ? "全部已读" : "全部标为已读"}</Button>}</CardFooter>
    <Dialog open={!!selected} onOpenChange={open => { if (!open) setSelected(null) }}><DialogContent><DialogHeader><DialogTitle>{selected?.source} 更新</DialogTitle><DialogDescription>{selected?.context} · {selected?.when}</DialogDescription></DialogHeader><p className="text-sm leading-7">{selected?.detail}</p><Button onClick={() => { if (selected) setRead(current => [...new Set([...current, selected.id])]); setSelected(null) }}><ArrowUpRight data-icon="inline-start" />标为已读并返回</Button><p className="text-xs text-muted-foreground">这是示例消息，未读取任何已连接的账户。</p></DialogContent></Dialog>
  </Card>
}
