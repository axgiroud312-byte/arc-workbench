import { useRef, useState } from "react"
import { Check, ChevronDown, PencilLine, RotateCcw, Sparkles, Square, X } from "lucide-react"
import { Button } from "../../ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../ui/card"
import { Input } from "../../ui/input"
import { Textarea } from "../../ui/textarea"
import { Field, FieldLabel } from "../../ui/field"
import { Badge } from "../../ui/badge"
import { useTextReveal } from "./demo-hooks"

const initial = "我们正在准备推出全新的工作空间。团队一直在努力，把项目、对话和文档集中到同一个地方。\n\n我们的目标是帮助大家更轻松地专注于重要的工作。我们会先邀请少量团队试用，收集反馈后，再向所有人开放。\n\n抢先体验计划将于 11 月 12 日开始。"

export function AiInlineEdit({ title = "工作空间上线计划", defaultValue = initial, onChange }: { title?: string; defaultValue?: string; onChange?: (value: string) => void }) {
  const [value, setValue] = useState(defaultValue)
  const [before, setBefore] = useState<string | null>(null)
  const [range, setRange] = useState({ start: 0, end: 0 })
  const [promptOpen, setPromptOpen] = useState(false)
  const [instruction, setInstruction] = useState("")
  const [review, setReview] = useState(false)
  const [ghost, setGhost] = useState(false)
  const editor = useRef<HTMLTextAreaElement>(null)
  const stream = useTextReveal()
  const selection = value.slice(range.start, range.end) || value.split("\n\n")[0]
  const update = (next: string) => { setValue(next); onChange?.(next) }
  const rewrite = (action: string) => {
    const selected = selection.trim()
    let next = selected.replace(/正在准备|一直在努力，|非常|特别/g, "")
    if (action === "shorten" || /精简|简短|缩短/.test(action)) next = selected.split(/[。！？.!?]/)[0].replace("正在准备推出全新的", "即将推出新的") + "。"
    else if (action === "friendly" || /亲切|友好/.test(action)) next = "和大家分享一个新进展：" + selected
    else next = "我们即将推出新的工作空间，将项目、对话和文档集中管理。先邀请少量团队试用，根据反馈完善后再全面开放。"
    setPromptOpen(false); setReview(true); stream.start(next)
  }
  const accept = () => {
    setBefore(value)
    const start = range.end > range.start ? range.start : 0
    const end = range.end > range.start ? range.end : selection.length
    update(value.slice(0, start) + stream.text + value.slice(end))
    stream.reset(); setReview(false); setRange({ start: 0, end: 0 })
  }
  return <Card className="mx-auto w-full max-w-3xl overflow-hidden">
    <CardHeader className="gap-4">
      <div className="flex items-center justify-between gap-3"><span className="flex items-center gap-2 text-xs text-muted-foreground"><PencilLine className="size-4" /> 产品 / 上线计划</span><Badge variant="outline">草稿</Badge></div>
      <CardTitle>{title}</CardTitle>
      <CardDescription>林可 · 刚刚编辑</CardDescription>
    </CardHeader>
    <CardContent className="flex flex-col gap-5">
      <Field><FieldLabel htmlFor="inline-document" className="sr-only">文档内容</FieldLabel><Textarea ref={editor} id="inline-document" className="min-h-64 resize-y" value={value} disabled={review} onChange={e => update(e.target.value)} onSelect={e => { const el = e.currentTarget; setRange({ start: el.selectionStart, end: el.selectionEnd }) }} onKeyDown={e => {
        if ((e.ctrlKey || e.metaKey) && e.key === "k") { e.preventDefault(); setPromptOpen(open => !open) }
        if (e.key === "Escape") { setPromptOpen(false); setGhost(false) }
        if (e.key === "Tab" && ghost) { e.preventDefault(); setBefore(value); update(value + "我们会持续分享试用过程中的发现。"); setGhost(false) }
      }} /></Field>
      {ghost && <p className="text-sm text-muted-foreground">我们会持续分享试用过程中的发现。<kbd className="ml-2 rounded border px-1.5 py-0.5 text-xs">Tab</kbd></p>}
      {promptOpen && !review && <div className="flex flex-col gap-3 rounded-xl border bg-muted/30 p-4">
        <form className="flex gap-2" onSubmit={e => { e.preventDefault(); rewrite(instruction || "clearer") }}><Field><FieldLabel htmlFor="edit-instruction" className="sr-only">修改要求</FieldLabel><Input autoFocus id="edit-instruction" value={instruction} onChange={e => setInstruction(e.target.value)} placeholder="想怎样修改这段文字？" /></Field><Button type="submit" size="icon" aria-label="改写选中文字"><Sparkles /></Button></form>
        <div className="flex flex-wrap gap-2">{[{ value: "shorten", label: "精简" }, { value: "clearer", label: "表达更清楚" }, { value: "friendly", label: "语气更亲切" }].map(action => <Button key={action.value} variant="outline" size="sm" onClick={() => rewrite(action.value)}>{action.label}</Button>)}</div>
      </div>}
      {review && <div className="flex flex-col gap-4 rounded-xl border p-4" aria-live="polite">
        <div className="flex items-center gap-2 text-sm"><Sparkles className="size-4" />{stream.running ? "正在改写选中文字…" : "检查修改内容"}</div>
        <p className="text-sm leading-7"><del className="text-muted-foreground">{selection}</del><br /><ins className="bg-success/10 text-success decoration-transparent">{stream.text}</ins></p>
        <div className="flex flex-wrap gap-2">{stream.running ? <Button variant="outline" size="sm" onClick={stream.stop}><Square data-icon="inline-start" />停止</Button> : <Button size="sm" onClick={accept} disabled={!stream.text}><Check data-icon="inline-start" />接受修改</Button>}<Button variant="ghost" size="sm" onClick={() => { stream.reset(); setReview(false) }}><X data-icon="inline-start" />放弃</Button></div>
      </div>}
    </CardContent>
    <CardFooter className="flex flex-wrap justify-between gap-3">
      <div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={() => setPromptOpen(open => !open)} disabled={review}><Sparkles data-icon="inline-start" />用 AI 修改<ChevronDown data-icon="inline-end" /></Button><Button size="sm" variant="ghost" onClick={() => { setGhost(true); editor.current?.focus() }} disabled={review || ghost}>继续写作</Button>{before !== null && <Button size="sm" variant="ghost" onClick={() => { update(before); setBefore(null) }}><RotateCcw data-icon="inline-start" />撤销</Button>}</div>
      <span className="text-xs text-muted-foreground">本地改写演示 · Ctrl K</span>
    </CardFooter>
  </Card>
}
