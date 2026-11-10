import { useMemo, useState } from "react"
import { ArrowUpLeft, Check, Clock, CornerDownLeft, FileText, Search, Sparkles, Square, Triangle, Users, X } from "lucide-react"
import { Button } from "../../ui/button"
import { Badge } from "../../ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../ui/card"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "../../ui/input-group"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../ui/dialog"
import { Separator } from "../../ui/separator"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "../../ui/empty"
import { BrandMark } from "../shared"
import { cn } from "../../../lib/utils"
import { useTextReveal } from "./demo-hooks"

const records = [
  { id: "1", group: "docs", icon: FileText, title: "回调投递与重试", description: "投递失败后会逐步延长间隔并重试，最长持续 24 小时。", meta: "2 天前更新" },
  { id: "2", group: "docs", icon: FileText, title: "校验回调签名", description: "处理事件前，先校验请求头中的签名。", meta: "开发指南" },
  { id: "3", group: "customers", icon: Users, brand: "figma" as const, title: "Figma", description: "企业工作空间 · 已启用回调集成。", meta: "客户" },
  { id: "4", group: "issues", icon: Triangle, brand: "linear" as const, title: "WEB-284 · 重试失败的回调投递", description: "在事件日志中显示重试次数和最近一次投递状态。", meta: "进行中" },
  { id: "5", group: "docs", icon: FileText, title: "配置单点登录", description: "配置 SAML 身份验证，并验证工作空间域名。", meta: "安全" },
  { id: "6", group: "issues", icon: Triangle, brand: "linear" as const, title: "AUTH-912 · 会话超时设置", description: "允许工作空间管理员设置会话有效期。", meta: "已完成" },
]

const groupLabels: Record<string, string> = { docs: "文档", customers: "客户", issues: "事项" }

export function AiSearchBar() {
  const [query, setQuery] = useState("回调")
  const [active, setActive] = useState(0)
  const [source, setSource] = useState<string | null>(null)
  const [selected, setSelected] = useState<(typeof records)[number] | null>(null)
  const [recent, setRecent] = useState(["回调", "Figma", "AUTH-912"])
  const reveal = useTextReveal()
  const results = useMemo(() => records.filter(row => `${row.title} ${row.description}`.toLowerCase().includes(query.trim().toLowerCase())), [query])
  const changeQuery = (value: string) => { setQuery(value); setActive(0); reveal.reset(); setSource(null) }
  const ask = () => {
    if (!query.trim()) return
    const summary = results.length ? results.slice(0, 3).map((row, i) => `${row.description} [${i + 1}]`).join(" ") : `示例工作空间中没有找到与“${query}”相关的信息。请尝试更具体的关键词，或直接浏览文档。`
    reveal.start(summary)
    setRecent(current => [query, ...current.filter(text => text !== query)].slice(0, 3))
  }
  const open = (row: (typeof records)[number]) => { setSelected(row); setRecent(current => [query, ...current.filter(text => text !== query)].slice(0, 3)) }
  return <Card className="mx-auto w-full max-w-2xl gap-0 overflow-hidden py-0">
    <CardHeader className="p-4"><CardTitle className="sr-only">工作空间搜索</CardTitle><InputGroup><InputGroupAddon><Search /></InputGroupAddon><InputGroupInput value={query} onChange={e => changeQuery(e.target.value)} placeholder="搜索文档、客户和事项" aria-label="搜索工作空间" onKeyDown={e => {
      if (e.key === "ArrowDown") { e.preventDefault(); setActive(value => Math.min(results.length, value + 1)) }
      if (e.key === "ArrowUp") { e.preventDefault(); setActive(value => Math.max(0, value - 1)) }
      if (e.key === "Enter") { e.preventDefault(); if (active === 0) ask(); else if (results[active - 1]) open(results[active - 1]) }
      if (e.key === "Tab" && query && !e.shiftKey && !reveal.text) { e.preventDefault(); ask() }
      if (e.key === "Escape") { reveal.stop(); if (!reveal.running) changeQuery("") }
    }} /><InputGroupAddon align="inline-end">{query && <InputGroupButton size="icon-sm" aria-label="清空搜索" onClick={() => changeQuery("")}><X /></InputGroupButton>}<Badge variant="outline">Esc</Badge></InputGroupAddon></InputGroup></CardHeader>
    <Separator />
    <CardContent className="flex min-h-96 flex-col gap-4 p-4">
      {!query ? <><p className="px-2 text-xs text-muted-foreground">最近搜索</p>{recent.map(text => <Button key={text} variant="ghost" className="justify-start" onClick={() => changeQuery(text)}><Clock data-icon="inline-start" />{text}<ArrowUpLeft data-icon="inline-end" className="ml-auto" /></Button>)}<Separator /><p className="px-2 text-xs text-muted-foreground">问问工作空间</p>{["回调", "会话超时", "单点登录"].map(text => <Button key={text} variant="ghost" className="justify-start" onClick={() => changeQuery(text)}><Sparkles data-icon="inline-start" />{text}</Button>)}</> : <>
        {!reveal.text && !reveal.running ? <Button variant={active === 0 ? "secondary" : "ghost"} className="justify-start" onClick={ask}><Sparkles data-icon="inline-start" /><span className="truncate">向 AI 询问“{query}”</span><Badge variant="outline" className="ml-auto">Tab</Badge></Button> : <div className="rounded-xl bg-muted/50 p-4"><div className="mb-3 flex items-center justify-between gap-2"><span className="flex items-center gap-2 text-xs"><Sparkles className="size-3.5" />工作空间回答</span>{reveal.running && <Button variant="ghost" size="icon-sm" aria-label="停止 AI 回答" onClick={reveal.stop}><Square /></Button>}</div><p className="text-sm leading-7" aria-busy={reveal.running}>{reveal.text || "正在查找相关内容…"}</p><div className="mt-3 flex gap-2">{results.slice(0, 3).map((row, i) => <Button key={row.id} size="icon-sm" variant="outline" onClick={() => setSource(row.id)} onMouseEnter={() => setSource(row.id)} onMouseLeave={() => setSource(null)} aria-label={`突出显示来源 ${i + 1}`}>{i + 1}</Button>)}</div></div>}
        {!results.length && <Empty><EmptyHeader><EmptyTitle>没有匹配结果</EmptyTitle><EmptyDescription>试试“回调”“Figma”或“身份验证”。</EmptyDescription></EmptyHeader></Empty>}
        {["docs", "customers", "issues"].map(group => { const rows = results.filter(row => row.group === group); return rows.length > 0 && <section key={group}><p className="mb-2 px-2 text-[11px] text-muted-foreground">{groupLabels[group]}</p><div className="flex flex-col gap-1">{rows.map(row => <button key={row.id} className={cn("flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring", (active === results.indexOf(row) + 1 || source === row.id) && "bg-accent")} onClick={() => open(row)}>{row.brand ? <BrandMark brand={row.brand} className="mt-0.5 shrink-0" /> : <row.icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />}<span className="min-w-0 flex-1"><span className="block text-sm">{row.title}</span><span className="mt-1 block truncate text-xs text-muted-foreground">{row.description}</span></span>{row.meta === "已完成" ? <Check className="size-3.5 text-success" /> : <CornerDownLeft className="mt-1 size-3 text-muted-foreground" />}</button>)}</div></section> })}
      </>}
    </CardContent><CardFooter className="flex flex-wrap justify-between gap-3 p-4 text-xs text-muted-foreground"><span>↑ ↓ 选择 · Enter 打开 · Tab 问 AI</span><span className="flex items-center gap-2"><BrandMark brand="claude" />Claude Sonnet · 本地搜索</span></CardFooter>
    <Dialog open={!!selected} onOpenChange={open => { if (!open) setSelected(null) }}><DialogContent><DialogHeader><DialogTitle>{selected?.title}</DialogTitle><DialogDescription>{selected ? groupLabels[selected.group] : ""} · {selected?.meta}</DialogDescription></DialogHeader><p className="text-sm leading-7">{selected?.description}</p><p className="text-xs text-muted-foreground">示例工作空间记录。</p></DialogContent></Dialog>
  </Card>
}
