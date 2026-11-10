import { useEffect, useState } from "react"
import { ArrowRight, Check, FileText, Globe, MessageSquare, Pause, Play, ShieldCheck, Sparkles } from "lucide-react"
import { Button } from "../../ui/button"
import { Badge } from "../../ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../ui/card"
import { Switch } from "../../ui/switch"
import { Field, FieldContent, FieldDescription, FieldLabel } from "../../ui/field"
import { ToggleGroup, ToggleGroupItem } from "../../ui/toggle-group"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../ui/dialog"
import { Textarea } from "../../ui/textarea"
import { Separator } from "../../ui/separator"
import { BrandMark } from "../shared"
import { useTextReveal } from "./demo-hooks"

const steps = [
  { title: "在文档里，直接把话说清楚", description: "让每一份草稿都更清楚。", icon: FileText, benefits: ["直接在文档里改写", "保留你的语气和原意", "确认修改后再应用"], before: "我想联系您并告知您，我们的设计稿目前已经准备妥当，您现在可以抽空查看一下。", after: "设计稿已准备好，请查阅。期待你的反馈。" },
  { title: "长对话，快速看懂", description: "不用逐条翻阅，也能找到结论。", icon: MessageSquare, benefits: ["快速了解群聊进展", "整理结论和待办事项", "随时查看原始消息"], before: "#产品上线 · 24 条消息 · 6 人参与", after: "确定周四上线。小雅负责更新说明，团队将在周三检查最终演示。" },
  { title: "工作空间里的问题，直接问", description: "回答附带来源，方便核对。", icon: Globe, benefits: ["用自己的话提问", "检索已连接的工具", "查看回答依据的文档"], before: "我们怎样保护客户数据？", after: "客户数据保存在获批的地区。访问生产环境需要经过审批并留下记录。来源：安全政策、访问权限手册。" },
]

export function AiFeatureLaunch() {
  const [step, setStep] = useState(0)
  const [enabled, setEnabled] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [dialog, setDialog] = useState<"try" | "learn" | null>(null)
  const [draft, setDraft] = useState(steps[0].before)
  const reveal = useTextReveal()
  const current = steps[step]
  useEffect(() => { if (!playing || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return; const timer = setInterval(() => setStep(value => (value + 1) % steps.length), 5000); return () => clearInterval(timer) }, [playing])
  const choose = (value: string) => { if (value) { setStep(Number(value)); setPlaying(false) } }
  return <Card className="mx-auto w-full max-w-xl overflow-hidden">
    <CardHeader><div className="flex justify-between gap-3"><Badge variant="outline"><Sparkles data-icon="inline-start" />工作空间 AI 上线了</Badge><Button variant="ghost" size="icon-sm" aria-label={playing ? "暂停功能演示" : "播放功能演示"} onClick={() => setPlaying(value => !value)}>{playing ? <Pause /> : <Play />}</Button></div></CardHeader>
    <CardContent className="flex flex-col gap-6">
      <div className="flex min-h-48 flex-col justify-center gap-4 rounded-xl border bg-muted/30 p-5"><div className="flex items-center gap-2 text-xs text-muted-foreground"><current.icon className="size-4" />{["上线公告", "#产品上线", "工作空间搜索"][step]}</div><p className="text-sm leading-6 text-muted-foreground">{current.before}</p><Separator /><div className="flex items-start gap-3"><Sparkles className="mt-1 size-4 shrink-0" /><p className="text-sm leading-6">{current.after}</p></div></div>
      <div className="flex flex-col gap-3"><CardTitle>{current.title}</CardTitle><CardDescription>{current.description}</CardDescription></div>
      <ul className="flex min-h-24 flex-col gap-3">{current.benefits.map(benefit => <li key={benefit} className="flex items-center gap-3 text-sm"><Check className="size-4 text-muted-foreground" />{benefit}</li>)}</ul>
      <ToggleGroup value={[String(step)]} onValueChange={([value]) => { if (value) choose(value) }} variant="outline" size="sm" aria-label="功能演示步骤" className="self-center">{steps.map((item, i) => <ToggleGroupItem key={item.title} value={String(i)} aria-label={`第 ${i + 1} 步：${item.title}`}>{i + 1}</ToggleGroupItem>)}</ToggleGroup>
      <Separator />
      <Field orientation="horizontal"><FieldContent><FieldLabel htmlFor="workspace-ai-enabled">为我的工作空间启用</FieldLabel><FieldDescription>{enabled ? "已在演示中为 Halcyon 的 48 位成员启用。" : "管理员可为全部 48 位成员启用。"}</FieldDescription></FieldContent><Switch id="workspace-ai-enabled" checked={enabled} onCheckedChange={setEnabled} /></Field>
      <div className="flex gap-2"><Button className="flex-1" onClick={() => { setPlaying(false); setDraft(current.before); reveal.reset(); setDialog("try") }}>立即试用<ArrowRight data-icon="inline-end" /></Button><Button variant="outline" className="flex-1" onClick={() => setDialog("learn")}>了解详情</Button></div>
    </CardContent>
    <CardFooter className="justify-center"><span className="flex items-center gap-2 text-xs text-muted-foreground"><BrandMark brand="claude" />Claude Sonnet · 本地功能演示</span></CardFooter>
    <Dialog open={dialog !== null} onOpenChange={open => { if (!open) { setDialog(null); reveal.stop() } }}><DialogContent><DialogHeader><DialogTitle>{dialog === "try" ? current.title : "工作空间 AI"}</DialogTitle><DialogDescription>{dialog === "try" ? "试试这项功能的示例。" : "在工作空间里使用 AI 的三种方式。"}</DialogDescription></DialogHeader>{dialog === "try" ? <div className="flex flex-col gap-4"><Field><FieldLabel htmlFor="launch-demo-draft">你的草稿</FieldLabel><Textarea id="launch-demo-draft" value={draft} onChange={e => setDraft(e.target.value)} /></Field><Button disabled={!draft.trim() || reveal.running} onClick={() => reveal.start(step === 0 ? draft.replace(/我想联系您并告知您，/g, "").replace(/目前已经准备妥当/g, "已完成").replace(/您现在可以抽空查看一下/g, "请查阅") : current.after)}><Sparkles data-icon="inline-start" />{reveal.running ? "正在处理…" : ["改写草稿", "总结对话", "查找答案"][step]}</Button>{reveal.text && <p className="rounded-lg bg-muted p-4 text-sm leading-6">{reveal.text}</p>}</div> : <div className="flex flex-col gap-4">{steps.map(item => <div key={item.title} className="flex items-start gap-3"><item.icon className="mt-1 size-4 shrink-0" /><div><p className="text-sm font-medium">{item.title}</p><p className="mt-1 text-sm text-muted-foreground">{item.description}</p></div></div>)}<p className="flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="size-4" />此预览仅修改本地演示状态。</p></div>}</DialogContent></Dialog>
  </Card>
}
