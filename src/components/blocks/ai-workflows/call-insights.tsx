import { useEffect, useState } from "react"
import { CheckCircle2, Copy, DollarSign, Flag, Pause, Play, ShieldAlert, Sparkles, Swords } from "lucide-react"
import { Button } from "../../ui/button"
import { Badge } from "../../ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../ui/card"
import { Checkbox } from "../../ui/checkbox"
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from "../../ui/field"
import { ToggleGroup, ToggleGroupItem } from "../../ui/toggle-group"
import { Slider } from "../../ui/slider"
import { Separator } from "../../ui/separator"
import { Avatar, AvatarFallback } from "../../ui/avatar"
import { BrandMark } from "../shared"
import { cn } from "../../../lib/utils"
import { copyDemoText } from "./demo-hooks"

const moments = [
  { at: "04:12", type: "价格", icon: DollarSign, name: "陈思", role: "数据负责人 · Ramp", quote: "如果让其余工程团队成员也加入，费用会怎样变化？", duration: 12 },
  { at: "11:38", type: "竞品", icon: Swords, name: "周宁", role: "工程负责人 · Ramp", quote: "我们正在和现有方案进行比较。迁移工作量会是决定因素。", duration: 15 },
  { at: "19:06", type: "顾虑", icon: Flag, name: "陈思", role: "数据负责人 · Ramp", quote: "继续推进前，安全团队需要检查数据存储地区的相关文档。", duration: 14 },
  { at: "27:45", type: "下一步", icon: CheckCircle2, name: "李然", role: "客户经理", quote: "我今天会发送安全资料，并安排下周的技术交流。", duration: 10 },
]
const steps = [
  { id: "security", text: "发送安全和数据存储地区文档", owner: "李然", due: "今天" },
  { id: "pricing", text: "提供 120 个工程师席位的报价", owner: "李然", due: "明天" },
  { id: "demo", text: "和周宁安排技术评估", owner: "小雅", due: "11 月 12 日" },
]
const summary = "Ramp 正在为 120 位工程师评估共享数据平台。团队认可协作流程，目前还需确认批量席位的价格和数据存储地区。双方已约定下一步进行技术评估。"

export function CallInsights() {
  const [selected, setSelected] = useState("0")
  const [playing, setPlaying] = useState(false)
  const [position, setPosition] = useState(0)
  const [done, setDone] = useState<string[]>([])
  const moment = moments[Number(selected)]
  const risk = done.length === steps.length ? "低风险" : done.length ? "中等风险" : "高风险"
  useEffect(() => { if (!playing) return; const timer = setInterval(() => { setPosition(current => { const next = Math.min(moment.duration, current + 0.5); return next }) }, 500); return () => clearInterval(timer) }, [playing, moment.duration])
  useEffect(() => { if (position >= moment.duration && playing) setPlaying(false) }, [position, moment.duration, playing])
  return <Card className="mx-auto w-full max-w-2xl overflow-hidden">
    <CardHeader><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-xl border text-lg font-medium">R</span><div className="flex flex-col gap-1.5"><CardTitle>数据平台评估</CardTitle><CardDescription>Ramp · 2026 年 11 月 9 日 · 34 分钟</CardDescription></div></div><BrandMark brand="zoom" /></div><div className="mt-3 flex items-center justify-between gap-3"><div className="flex items-center gap-2"><div className="flex [&>*+*]:-ml-2">{["李", "雅", "陈", "周"].map(name => <Avatar key={name} className="size-7 border-2 border-card"><AvatarFallback>{name}</AvatarFallback></Avatar>)}</div><span className="text-xs text-muted-foreground">4 人参会</span></div><Badge variant="outline">{risk === "低风险" ? <CheckCircle2 data-icon="inline-start" /> : <ShieldAlert data-icon="inline-start" />}{risk}</Badge></div></CardHeader>
    <CardContent className="flex flex-col gap-6">
      <section className="flex flex-col gap-3" aria-label="发言时长"><div className="flex justify-between text-xs"><span>发言时长</span><span className="text-muted-foreground">我方团队 / 潜在客户</span></div><div className="flex h-2 overflow-hidden rounded-full" role="img" aria-label="李然 28%，小雅 16%，陈思 38%，周宁 18%">{[28, 16, 38, 18].map((width, i) => <div key={i} className="bg-foreground" style={{ width: `${width}%`, opacity: [0.85, 0.6, 0.35, 0.18][i] }} />)}</div><div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground sm:grid-cols-4">{["李然 28%", "小雅 16%", "陈思 38%", "周宁 18%"].map((name, i) => <span key={name} className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-foreground" style={{ opacity: [0.85, 0.6, 0.35, 0.18][i] }} />{name}</span>)}</div></section>
      <Separator />
      <section className="flex flex-col gap-4"><p className="text-xs font-medium">关键片段</p><ToggleGroup value={[selected]} onValueChange={([value]) => { if (value) { setSelected(value); setPlaying(false); setPosition(0) } }} variant="outline" className="flex flex-wrap" aria-label="通话片段">{moments.map((item, i) => <ToggleGroupItem key={item.at} value={String(i)} aria-label={`${item.type}，${item.at}`}><item.icon /><span className="tabular-nums">{item.at}</span></ToggleGroupItem>)}</ToggleGroup><div className="flex flex-col gap-4 rounded-xl bg-muted/40 p-4"><div className="flex items-center justify-between gap-2"><Badge variant="outline"><moment.icon data-icon="inline-start" />{moment.type}</Badge><span className="text-xs text-muted-foreground">{moment.at}</span></div><blockquote className="min-h-14 text-sm leading-7">“{moment.quote}”</blockquote><p className="text-xs text-muted-foreground">{moment.name} · {moment.role}</p><div className="flex items-center gap-3"><Button variant="outline" size="icon-sm" aria-label={playing ? "暂停片段预览" : "播放片段预览"} onClick={() => { if (position >= moment.duration) setPosition(0); setPlaying(value => !value) }}>{playing ? <Pause /> : <Play />}</Button><div className="relative flex h-9 flex-1 items-center gap-0.5" aria-hidden="true">{Array.from({ length: 52 }, (_, i) => <span key={i} className={cn("min-w-0 flex-1 rounded-full", i / 52 <= position / moment.duration ? "bg-foreground/75" : "bg-foreground/20")} style={{ height: `${15 + Math.abs(Math.sin(i * 1.7 + Number(selected))) * 85}%` }} />)}</div><span className="text-xs tabular-nums text-muted-foreground">0:{String(Math.floor(position)).padStart(2, "0")}</span></div><Slider value={position} onValueChange={value => { if (typeof value === "number") setPosition(value) }} min={0} max={moment.duration} step={0.5} aria-label="片段预览进度" /><p className="text-[11px] text-muted-foreground" role="status">{playing ? "正在预览时间线，不播放音频。" : "时间线预览 · 示例转录"}</p></div></section>
      <section className="flex flex-col gap-3"><div className="flex items-center justify-between gap-2"><h4 className="flex items-center gap-2 text-xs font-medium"><Sparkles className="size-3.5" />AI 摘要</h4><Button size="icon-sm" variant="ghost" aria-label="复制通话摘要" onClick={() => copyDemoText(summary)}><Copy /></Button></div><p className="text-sm leading-7">{summary}</p></section>
      <Separator /><section className="flex flex-col gap-4"><h4 className="text-xs font-medium">后续事项 · {done.length}/{steps.length}</h4><FieldGroup>{steps.map(step => <Field key={step.id} orientation="horizontal"><Checkbox id={`call-${step.id}`} checked={done.includes(step.id)} onCheckedChange={checked => setDone(current => checked ? [...current, step.id] : current.filter(id => id !== step.id))} /><FieldContent><FieldLabel htmlFor={`call-${step.id}`} className={cn(done.includes(step.id) && "line-through opacity-60")}>{step.text}</FieldLabel><FieldDescription>{step.owner} · {step.due}</FieldDescription></FieldContent></Field>)}</FieldGroup></section>
    </CardContent><CardFooter className="flex justify-between gap-3 text-xs text-muted-foreground"><span>Zoom 录制 · 示例通话</span><span className="flex items-center gap-2"><BrandMark brand="claude" />Claude Sonnet</span></CardFooter>
  </Card>
}
