import { useEffect, useState } from "react"
import { ArrowLeft, ArrowRight, ArrowUp, Check, CheckCircle2, Loader2, ShieldCheck, Sparkles, Square } from "lucide-react"
import { Button } from "../../ui/button"
import { Badge } from "../../ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../ui/card"
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from "../../ui/field"
import { Switch } from "../../ui/switch"
import { Progress } from "../../ui/progress"
import { ToggleGroup, ToggleGroupItem } from "../../ui/toggle-group"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "../../ui/input-group"
import { Separator } from "../../ui/separator"
import { BrandMark } from "../shared"
import { cn } from "../../../lib/utils"
import { useLocalProgress, useTextReveal } from "./demo-hooks"

const sources = [
  { id: "notion", name: "Notion", note: "帮助中心和团队手册", count: 128, brand: "notion" as const },
  { id: "drive", name: "Google Drive", note: "产品指南和文档", count: 86, brand: "google-drive" as const },
  { id: "confluence", name: "Confluence", note: "内部知识和操作手册", count: 54, brand: "confluence" as const },
  { id: "zendesk", name: "Zendesk", note: "客服文章和解决方案", count: 312, brand: "zendesk" as const },
]
const models = [
  { id: "claude", name: "Claude Sonnet", note: "回答细致清楚", brand: "claude" as const },
  { id: "openai", name: "GPT", note: "通用灵活，响应快", brand: "openai" as const },
  { id: "gemini", name: "Gemini", note: "适合阅读大量内容", brand: "gemini" as const },
]
const toneLabels: Record<string, string> = { Concise: "简洁", Friendly: "亲切", Formal: "正式" }
const guardrailLabels: Record<string, string> = { cite: "每条回答注明来源", handoff: "不确定时转人工", redact: "隐藏个人信息" }

export interface WizardConfiguration { sources: string[]; model: string; tone: string; guardrails: Record<string, boolean> }

export function AiSetupWizard({ featureName = "Northwind 助手", onComplete }: { featureName?: string; onComplete?: (configuration: WizardConfiguration) => void }) {
  const [step, setStep] = useState(0)
  const [connected, setConnected] = useState<string[]>([])
  const [connecting, setConnecting] = useState<string | null>(null)
  const [model, setModel] = useState("claude")
  const [tone, setTone] = useState("Concise")
  const [guardrails, setGuardrails] = useState<Record<string, boolean>>({ "cite": true, "handoff": true, "redact": true })
  const [question, setQuestion] = useState("怎样邀请新同事加入？")
  const [askedQuestion, setAskedQuestion] = useState("")
  const sync = useLocalProgress(1800)
  const answer = useTextReveal()
  useEffect(() => { if (sync.complete && connecting) { setConnected(current => [...new Set([...current, connecting])]); setConnecting(null) } }, [sync.complete, connecting])
  const test = () => { setAskedQuestion(question); answer.start(`${tone === "Friendly" ? "很高兴帮你！" : ""}打开“设置”，进入“成员”，然后选择“邀请成员”。填写同事的邮箱，选择成员角色后发送邀请。${guardrails["cite"] ? `[1] ${sources.find(source => connected.includes(source.id))?.name ?? "工作空间"} · 成员访问指南。` : ""}`) }
  const finish = () => { onComplete?.({ sources: connected, model, tone, guardrails }); setStep(3) }
  return <Card className="mx-auto w-full max-w-2xl overflow-hidden">
    <CardHeader><div className="flex items-start justify-between gap-3"><div className="flex flex-col gap-2"><CardTitle>设置 {featureName}</CardTitle><CardDescription>为 Northwind 的 48 位客服提供答案。</CardDescription></div><Badge variant={step === 3 ? "secondary" : "outline"}>{step === 3 ? "演示已启用" : "草稿"}</Badge></div></CardHeader>
    {step < 3 && <div className="flex items-center gap-2 px-6" aria-label={`第 ${step + 1} 步，共 3 步`}>{["连接", "设置", "测试"].map((label, i) => <div key={label} className="flex flex-1 items-center gap-2"><span className={cn("flex size-6 shrink-0 items-center justify-center rounded-full text-xs", i <= step ? "bg-foreground text-background" : "bg-muted text-muted-foreground")}>{i < step ? <Check className="size-3" /> : i + 1}</span><span className={cn("text-xs", i !== step && "text-muted-foreground")}>{label}</span>{i !== 2 && <div className="ml-1 h-px flex-1 bg-border" />}</div>)}</div>}
    <CardContent className="min-h-80">
      {step === 0 && <div className="flex flex-col gap-5"><div><h4 className="text-sm font-medium">先为助手准备资料</h4><p className="mt-1 text-xs text-muted-foreground">至少连接一个示例知识来源。</p></div>{sources.map(source => { const done = connected.includes(source.id); const active = connecting === source.id; return <div key={source.id} className="flex flex-col gap-3"><div className="flex items-center gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-lg border"><BrandMark brand={source.brand} /></span><div className="min-w-0 flex-1"><p className="text-sm">{source.name}</p><p className="mt-1 truncate text-xs text-muted-foreground">{active ? `已同步 ${Math.round(sync.progress / 100 * source.count)} / ${source.count} 篇文档` : done ? `已同步 ${source.count} 篇文档` : source.note}</p></div><Button variant={done ? "ghost" : "outline"} size="sm" disabled={!!connecting && !active} onClick={() => { if (done) setConnected(current => current.filter(id => id !== source.id)); else if (active) { sync.stop(); setConnecting(null) } else { setConnecting(source.id); sync.start() } }}>{done ? <Check data-icon="inline-start" /> : active ? <Loader2 data-icon="inline-start" className="motion-safe:animate-spin" /> : null}{done ? "已连接" : active ? "取消" : "连接"}</Button></div>{active && <Progress value={sync.progress} aria-label={`正在同步 ${source.name}`} className="h-1" />}</div> })}</div>}
      {step === 1 && <FieldGroup><Field><FieldLabel>选择模型</FieldLabel><ToggleGroup value={[model]} onValueChange={([value]) => { if (value) setModel(value) }} variant="outline" className="flex w-full flex-wrap gap-2" aria-label="助手模型">{models.map(item => <ToggleGroupItem key={item.id} value={item.id} className="h-auto min-w-36 flex-1 flex-col items-start gap-2 p-3"><span className="flex items-center gap-2"><BrandMark brand={item.brand} />{item.name}</span><span className="text-xs text-muted-foreground">{item.note}</span></ToggleGroupItem>)}</ToggleGroup></Field><Field><FieldLabel>回答语气</FieldLabel><ToggleGroup variant="outline" value={[tone]} onValueChange={([value]) => { if (value) setTone(value) }} aria-label="回答语气">{["Concise", "Friendly", "Formal"].map(value => <ToggleGroupItem key={value} value={value}>{toneLabels[value]}</ToggleGroupItem>)}</ToggleGroup></Field><Separator />{Object.keys(guardrails).map((label, i) => <Field key={label} orientation="horizontal"><FieldContent><FieldLabel htmlFor={`guardrail-${i}`}>{guardrailLabels[label]}</FieldLabel></FieldContent><Switch id={`guardrail-${i}`} checked={guardrails[label]} onCheckedChange={checked => setGuardrails(current => ({ ...current, [label]: checked }))} /></Field>)}</FieldGroup>}
      {step === 2 && <div className="flex flex-col gap-5"><div className="flex flex-wrap gap-2">{connected.map(id => <Badge key={id} variant="outline"><Check data-icon="inline-start" />{sources.find(source => source.id === id)?.name}</Badge>)}</div><p className="text-sm">启用前，先试问一个问题。</p><form onSubmit={e => { e.preventDefault(); if (question.trim()) test() }}><InputGroup><InputGroupInput value={question} onChange={e => setQuestion(e.target.value)} aria-label="助手测试问题" placeholder="问一个客服问题…" /><InputGroupAddon align="inline-end"><InputGroupButton type={answer.running ? "button" : "submit"} size="icon-sm" aria-label={answer.running ? "停止测试回答" : "提交测试问题"} onClick={answer.running ? answer.stop : undefined} disabled={!question.trim()}>{answer.running ? <Square /> : <ArrowUp />}</InputGroupButton></InputGroupAddon></InputGroup></form>{askedQuestion && <div className="flex flex-col gap-3 rounded-xl bg-muted/40 p-4"><p className="text-xs text-muted-foreground">{askedQuestion}</p><div className="flex items-center gap-2 text-xs"><BrandMark brand={models.find(item => item.id === model)?.brand} />{featureName}</div><p className="text-sm leading-7" aria-busy={answer.running}>{answer.text || "正在阅读已连接的资料…"}</p></div>}<FieldDescription>测试使用示例回答，设置仅保存在本次预览中。</FieldDescription></div>}
      {step === 3 && <div className="flex flex-col items-center gap-5 py-6 text-center"><CheckCircle2 className="size-12 text-success" /><div><h3 className="text-lg font-medium">{featureName}已准备好</h3><p className="mt-2 text-sm text-muted-foreground">本地助手设置已完成。</p></div><div className="flex flex-wrap justify-center gap-2"><Badge variant="outline">{connected.length} 个来源</Badge><Badge variant="outline">{models.find(item => item.id === model)?.name}</Badge><Badge variant="outline">{toneLabels[tone]}</Badge></div><Button variant="outline" onClick={() => { setStep(0); answer.reset(); setAskedQuestion("") }}>修改设置</Button></div>}
    </CardContent><CardFooter className="flex flex-wrap items-center justify-between gap-3"><span className="flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="size-3.5" />示例设置 · 未连接真实账户</span>{step < 3 && <div className="flex gap-2">{step > 0 && <Button variant="ghost" size="sm" onClick={() => { answer.stop(); setStep(current => current - 1) }}><ArrowLeft data-icon="inline-start" />上一步</Button>}<Button size="sm" disabled={step === 0 ? !connected.length || !!connecting : step === 2 ? !answer.text || answer.running : false} onClick={() => { if (step === 2) finish(); else setStep(current => current + 1) }}>{step === 2 ? <Sparkles data-icon="inline-start" /> : null}{step === 2 ? "在演示中启用" : "继续"}{step < 2 && <ArrowRight data-icon="inline-end" />}</Button></div>}</CardFooter>
  </Card>
}
