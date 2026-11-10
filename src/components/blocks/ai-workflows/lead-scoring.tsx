import { useEffect, useState } from "react"
import { ArrowUpRight, Check, ChevronDown, Loader2, RefreshCw, RotateCcw, Sparkles } from "lucide-react"
import { Button } from "../../ui/button"
import { Badge } from "../../ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../ui/card"
import { ToggleGroup, ToggleGroupItem } from "../../ui/toggle-group"
import { Progress } from "../../ui/progress"
import { Separator } from "../../ui/separator"
import { BrandMark } from "../shared"
import { cn } from "../../../lib/utils"
import { useLocalProgress } from "./demo-hooks"

const sampleLeads = [
  { id: "vercel", company: "Vercel", name: "林娜", title: "工程副总裁", brand: "vercel" as const, received: "6 分钟前", reason: "产品意向强，工程团队正在扩张。", signals: ["查看价格 4 次", "120 位工程师", "已申请演示"], values: [96, 94, 90, 98] },
  { id: "ramp", company: "Ramp", name: "陈思", title: "数据负责人", brand: undefined, received: "18 分钟前", reason: "公司匹配度高，正在进行平台评估。", signals: ["D 轮融资", "已查看安全文档", "企业邮箱"], values: [94, 88, 88, 92] },
  { id: "linear", company: "Linear", name: "金诺", title: "工程经理", brand: "linear" as const, received: "32 分钟前", reason: "技术方案匹配，并多次查看文档。", signals: ["PostgreSQL", "查看接口文档 8 次", "团队试用"], values: [86, 84, 80, 90] },
  { id: "notion", company: "Notion", name: "李然", title: "产品负责人", brand: "notion" as const, received: "54 分钟前", reason: "匹配度较好，目前处于初步调研阶段。", signals: ["团队扩张中", "已下载指南", "企业邮箱"], values: [85, 64, 72, 84] },
  { id: "retool", company: "Retool", name: "艾文", title: "运营", brand: "retool" as const, received: "1 小时前", reason: "正在了解产品，尚未明确决策人。", signals: ["已订阅更新", "访问过首页", "企业邮箱"], values: [76, 46, 58, 70] },
]
const factors = [{ label: "公司匹配", weight: .35 }, { label: "购买意向", weight: .3 }, { label: "互动程度", weight: .2 }, { label: "角色匹配", weight: .15 }]
const scoreOf = (lead: (typeof sampleLeads)[number]) => Math.round(lead.values.reduce((sum, value, i) => sum + value * factors[i].weight, 0))

function ScoreRing({ score, busy }: { score: number; busy?: boolean }) {
  return <span className="relative flex size-10 shrink-0 items-center justify-center" aria-label={busy ? "正在为客户线索评分" : `匹配得分 ${score}，满分 100`}><svg viewBox="0 0 40 40" className={cn("absolute inset-0 size-full -rotate-90", busy && "motion-safe:animate-spin")} aria-hidden="true"><circle cx="20" cy="20" r="17" fill="none" stroke="var(--muted)" strokeWidth="2" /><circle cx="20" cy="20" r="17" fill="none" stroke="var(--foreground)" strokeWidth="2" strokeLinecap="round" strokeDasharray={`${(busy ? 25 : score) * 1.068} 107`} /></svg><span className="text-xs tabular-nums">{busy ? "–" : score}</span></span>
}

export function LeadScoring() {
  const [sort, setSort] = useState("score")
  const [expanded, setExpanded] = useState<string | null>("vercel")
  const [crm, setCrm] = useState("HubSpot")
  const [pushed, setPushed] = useState<Record<string, string>>({})
  const [pending, setPending] = useState<{ id: string; crm: string } | null>(null)
  const sync = useLocalProgress(1400)
  const scoring = useLocalProgress(2100)
  useEffect(() => { if (sync.complete && pending) { setPushed(current => ({ ...current, [pending.id]: pending.crm })); setPending(null) } }, [sync.complete, pending])
  const leads = sort === "score" ? [...sampleLeads].sort((a, b) => scoreOf(b) - scoreOf(a)) : sampleLeads
  return <Card className="mx-auto w-full max-w-2xl overflow-hidden">
    <CardHeader><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex flex-col gap-2"><CardTitle>新客户线索</CardTitle><CardDescription className="flex items-center gap-2"><BrandMark brand="claude" />Claude Sonnet · {leads.length} 条新线索</CardDescription></div><Button variant="ghost" size="icon-sm" disabled={scoring.running || !!pending} aria-label="重新评估客户线索" onClick={scoring.start}><RefreshCw className={cn(scoring.running && "motion-safe:animate-spin")} /></Button></div><div className="mt-3 flex flex-wrap items-center justify-between gap-3"><ToggleGroup value={[sort]} onValueChange={([value]) => { if (value) setSort(value) }} variant="outline" size="sm" aria-label="线索排序"><ToggleGroupItem value="score">评分最高</ToggleGroupItem><ToggleGroupItem value="newest">最新收到</ToggleGroupItem></ToggleGroup><span className="text-xs text-muted-foreground">{scoring.running ? "正在重新评估…" : "刚刚更新"}</span></div></CardHeader>
    <CardContent className="flex flex-col gap-1">
      {leads.map((lead, index) => { const open = expanded === lead.id; const score = scoreOf(lead); return <div key={lead.id}><button type="button" className="flex w-full items-start gap-3 rounded-lg py-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-expanded={open} aria-controls={`lead-detail-${lead.id}`} onClick={() => setExpanded(open ? null : lead.id)}><span className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-lg border text-lg font-medium" aria-hidden="true">{lead.brand ? <BrandMark brand={lead.brand} className="size-5" /> : lead.company.slice(0, 1)}</span><span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2"><span className="truncate text-sm font-medium">{lead.name}<span className="ml-2 font-normal text-muted-foreground">{lead.company}</span></span><span className="shrink-0 text-[11px] text-muted-foreground">{lead.received}</span></span><span className="mt-1 block text-xs text-muted-foreground">{lead.title}</span><span className="mt-2 block text-xs leading-5 text-muted-foreground">{lead.reason}</span>{pushed[lead.id] && <span className="mt-2 flex items-center gap-1 text-xs text-success"><Check className="size-3" />已加入本地 {pushed[lead.id]} 队列</span>}</span><ScoreRing score={score} busy={scoring.running} /><ChevronDown className={cn("mt-3 size-3 shrink-0 text-muted-foreground transition-transform motion-reduce:transition-none", open && "rotate-180")} /></button>
        {open && <div id={`lead-detail-${lead.id}`} className="mb-4 flex flex-col gap-5 rounded-xl bg-muted/30 p-4"><div className="flex flex-wrap gap-2">{lead.signals.map(signal => <Badge key={signal} variant="outline">{signal}</Badge>)}</div><div className="flex flex-col gap-3">{factors.map((factor, i) => <div key={factor.label} className="grid grid-cols-[100px_minmax(0,1fr)_28px] items-center gap-3 text-xs"><span className="text-muted-foreground">{factor.label}</span><Progress value={lead.values[i]} className="h-1.5" aria-label={`${factor.label}：${lead.values[i]}，满分 100`} /><span className="text-right tabular-nums">{lead.values[i]}</span></div>)}</div><div className="flex flex-wrap items-center justify-between gap-3"><span className="text-xs text-muted-foreground">{score >= 85 ? "高度匹配" : score >= 70 ? "较为匹配" : "继续跟进"} · 综合得分 {score}</span><Badge variant="secondary">{factors.map(factor => Math.round(factor.weight * 100)).join(" / ")}% 权重</Badge></div><Separator /><div className="flex flex-wrap justify-between gap-3"><ToggleGroup value={[crm]} onValueChange={([value]) => { if (value) setCrm(value) }} variant="outline" size="sm" aria-label="客户管理工具"><ToggleGroupItem value="HubSpot"><BrandMark brand="hubspot" />HubSpot</ToggleGroupItem><ToggleGroupItem value="Salesforce"><BrandMark brand="salesforce" />Salesforce</ToggleGroupItem></ToggleGroup>{pushed[lead.id] ? <Button size="sm" variant="outline" onClick={() => setPushed(current => { const next = { ...current }; delete next[lead.id]; return next })}><RotateCcw data-icon="inline-start" />撤销本地添加</Button> : <Button size="sm" disabled={!!pending || scoring.running} onClick={() => { setPending({ id: lead.id, crm }); sync.start() }}>{pending?.id === lead.id ? <Loader2 data-icon="inline-start" className="motion-safe:animate-spin" /> : <ArrowUpRight data-icon="inline-start" />}{pending?.id === lead.id ? "正在添加…" : `添加到 ${crm}`}</Button>}</div>{pending?.id === lead.id && <Progress value={sync.progress} aria-label="正在将线索加入本地演示队列" className="h-1" />}</div>}
        {index < leads.length - 1 && <Separator />}
      </div> })}
    </CardContent><CardFooter className="flex justify-between gap-3 text-xs text-muted-foreground"><span className="flex items-center gap-2"><Sparkles className="size-3.5" />根据实际信号解释评分</span><span role="status">本地客户管理演示</span></CardFooter>
  </Card>
}
