import { useEffect, useState } from "react"
import { ArrowUp, Check, ChevronDown, Copy, ExternalLink, Globe, Loader2, RotateCcw, Search, Square } from "lucide-react"
import { Button } from "../../ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../ui/card"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "../../ui/input-group"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../ui/collapsible"
import { Badge } from "../../ui/badge"
import { Separator } from "../../ui/separator"
import { cn } from "../../../lib/utils"
import { copyDemoText, useLocalProgress } from "./demo-hooks"

const sources = [
  { title: "如何选择合适的数据库", domain: "postgresql.org", href: "https://www.postgresql.org/docs/current/intro-whatis.html", excerpt: "PostgreSQL 支持事务、复杂查询和可扩展的关系模型。" },
  { title: "在实际项目中使用 SQLite", domain: "sqlite.org", href: "https://www.sqlite.org/whentouse.html", excerpt: "SQLite 适合本地应用和部署要求简单的小型网站。" },
  { title: "了解 Redis", domain: "redis.io", href: "https://redis.io/docs/latest/develop/get-started/", excerpt: "Redis 提供快速的数据结构，适合缓存、队列和短期状态。" },
  { title: "D1 数据库概览", domain: "developers.cloudflare.com", href: "https://developers.cloudflare.com/d1/", excerpt: "D1 是面向 Cloudflare Workers 的托管 SQL 数据库。" },
]
const answer = "协作产品可以先用 PostgreSQL。事务和关系模型能保证项目、成员和权限之间的数据一致。遇到查询变慢时，先考虑增加索引。\n\nSQLite 适合优先在本地运行的应用，或部署简单的小型服务。Redis 可以补充缓存和队列能力，业务数据仍然保存在主数据库中。\n\n如果应用已经运行在 Cloudflare Workers 上，可以根据读取方式和预计数据量评估 D1。先选择能够满足实际查询需求、维护起来最简单的方案。"
const queries = ["比较适合小团队的关系数据库", "了解部署和日常维护的差异", "查看缓存和边缘数据库的适用场景"]

export function ResearchRun({ initialQuestion = "新做一个 SaaS 产品，应该选择什么数据库？" }: { initialQuestion?: string }) {
  const [question, setQuestion] = useState(initialQuestion)
  const [draft, setDraft] = useState("")
  const [expanded, setExpanded] = useState(true)
  const [activeSource, setActiveSource] = useState<number | null>(null)
  const [hasRun, setHasRun] = useState(false)
  const run = useLocalProgress(5500)
  const start = (next = question) => { setQuestion(next); setHasRun(true); setExpanded(true); run.start() }
  useEffect(() => { if (run.complete) setExpanded(false) }, [run.complete])
  const words = Array.from(answer)
  const visible = run.complete ? answer : words.slice(0, Math.max(0, Math.floor((run.progress - 38) / 62 * words.length))).join("")
  return <Card className="mx-auto w-full max-w-4xl overflow-hidden">
    <CardHeader>
      <div className="flex items-center justify-between gap-3"><CardTitle className="flex items-center gap-2"><Globe className="size-4" />深度研究</CardTitle><Badge variant="outline">示例研究</Badge></div>
      <CardDescription>检索和阅读资料，并为回答提供来源。</CardDescription>
    </CardHeader>
    <Separator />
    <CardContent className="flex flex-col gap-6">
      <h3 className="max-w-xl text-xl font-medium leading-relaxed">{question}</h3>
      {!hasRun ? <div className="flex flex-col items-start gap-5 py-6"><p className="text-sm text-muted-foreground">参考 4 份官方文档，比较不同方案。</p><Button onClick={() => start()}><Search data-icon="inline-start" />研究这个问题</Button></div> : <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_220px]">
        <div className="flex min-w-0 flex-col gap-5">
          <Collapsible open={expanded} onOpenChange={setExpanded}>
            <CollapsibleTrigger render={<Button variant="ghost" size="sm" />}>{run.running ? <Loader2 data-icon="inline-start" className="motion-safe:animate-spin" /> : <Check data-icon="inline-start" />} {run.running ? "正在研究问题" : "已阅读 4 个来源"}<ChevronDown data-icon="inline-end" /></CollapsibleTrigger>
            <CollapsibleContent><ol className="mt-3 flex flex-col gap-3 pl-3">{queries.map((query, i) => <li key={query} className="flex items-center gap-3 text-xs text-muted-foreground">{run.progress > (i + 1) * 12 ? <Check className="size-3.5 shrink-0 text-success" /> : <Search className="size-3.5 shrink-0" />}{query}</li>)}</ol></CollapsibleContent>
          </Collapsible>
          <article className="min-h-52 whitespace-pre-line text-sm leading-7" aria-busy={run.running}>{visible || <p className="text-muted-foreground">正在阅读文档，比较不同方案…</p>}</article>
          {run.progress > 65 && <div className="flex flex-wrap gap-2">{sources.slice(0, 3).map((source, i) => <Button key={source.domain} size="sm" variant="outline" onMouseEnter={() => setActiveSource(i)} onMouseLeave={() => setActiveSource(null)} onFocus={() => setActiveSource(i)} onBlur={() => setActiveSource(null)} onClick={() => setActiveSource(i)} aria-label={`查看来源 ${i + 1}：${source.title}`}>{i + 1} · {source.domain}</Button>)}</div>}
          {run.complete && <div className="flex flex-col items-start gap-2"><p className="text-xs text-muted-foreground">继续了解</p>{["如果优先在本地运行，该怎样选择？", "最初的数据结构应该怎样设计？"].map(text => <Button key={text} variant="ghost" size="sm" onClick={() => { setDraft(text); start(text) }}>{text}<ArrowUp data-icon="inline-end" /></Button>)}</div>}
        </div>
        <aside className="flex flex-col gap-3" aria-label="研究来源"><span className="text-xs text-muted-foreground">来源 · {Math.min(4, Math.ceil(run.progress / 10))}</span>{sources.slice(0, Math.min(4, Math.ceil(run.progress / 10))).map((source, i) => <div key={source.domain} className={cn("rounded-xl border p-3 transition-colors motion-reduce:transition-none", activeSource === i && "bg-accent")}><a className="flex items-start justify-between gap-2 text-xs font-medium hover:underline" href={source.href} target="_blank" rel="noreferrer">{source.title}<ExternalLink className="mt-0.5 size-3 shrink-0" /></a><p className="mt-2 text-[11px] text-muted-foreground">{i + 1} · {source.domain}</p>{activeSource === i && <p className="mt-3 text-xs leading-5 text-muted-foreground">{source.excerpt}</p>}</div>)}</aside>
      </div>}
      <form onSubmit={e => { e.preventDefault(); if (draft.trim()) { start(draft.trim()); setDraft("") } }}><InputGroup><InputGroupInput value={draft} onChange={e => setDraft(e.target.value)} placeholder="继续提问…" aria-label="研究问题" onKeyDown={e => { if (e.key === "Escape") run.stop() }} /><InputGroupAddon align="inline-end"><InputGroupButton type="submit" size="icon-sm" disabled={!draft.trim() || run.running} aria-label="提交研究问题"><ArrowUp /></InputGroupButton></InputGroupAddon></InputGroup></form>
    </CardContent>
    <CardFooter className="flex flex-wrap justify-between gap-3"><div className="flex gap-1">{run.running ? <Button size="sm" variant="outline" onClick={run.stop}><Square data-icon="inline-start" />停止</Button> : <Button size="sm" variant="ghost" onClick={() => start()}><RotateCcw data-icon="inline-start" />重新运行</Button>}<Button size="sm" variant="ghost" disabled={!visible} onClick={() => copyDemoText(`${question}\n\n${visible}\n\n${sources.map(s => s.href).join("\n")}`)}><Copy data-icon="inline-start" />复制</Button></div><span className="text-xs text-muted-foreground" role="status">{run.running ? "正在模拟研究过程" : "示例回答 · 未进行实时搜索"}</span></CardFooter>
  </Card>
}
