import {
  Suspense,
  useEffect,
  useRef,
  useState,
  Component,
  type ReactNode,
} from "react"
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Blocks,
  Check,
  ChevronDown,
  ChevronRight,
  Code2,
  Copy,
  Eye,
  Menu,
  Monitor,
  Moon,
  RotateCcw,
  Search,
  Smartphone,
  Sun,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockTitle,
} from "@/components/ui/code-block"
import { Skeleton } from "@/components/ui/skeleton"
import { Toaster, toast } from "@/components/ui/toast"
import { useTheme } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { blocks, type BlockDefinition } from "./registry"
import { librarySections, registryHome } from "./library/catalog"
import {
  InstallCommand,
  InstallStyles,
  LibraryOverview,
} from "./library/overview"

class PreviewBoundary extends Component<
  { children: ReactNode },
  { error: boolean }
> {
  state = { error: false }
  static getDerivedStateFromError() {
    return { error: true }
  }
  render() {
    return this.state.error ? (
      <div className="flex flex-col items-center gap-3 p-10">
        <p>组件加载失败，请刷新页面重试。</p>
        <Button onClick={() => window.location.reload()}>刷新页面</Button>
      </div>
    ) : (
      this.props.children
    )
  }
}
function getId() {
  return (
    new URLSearchParams(window.location.search).get("embed") ||
    window.location.hash.split("/").filter(Boolean).pop() ||
    "library"
  )
}

export default function App() {
  const [id, setId] = useState(getId)
  const [search, setSearch] = useState("")
  const [tab, setTab] = useState("preview")
  const [codeTab, setCodeTab] = useState("source")
  const [width, setWidth] = useState("desktop")
  const [resetKey, setResetKey] = useState(0)
  const [sourceFile, setSourceFile] = useState<{
    id: string
    content: string
  }>()
  const [copied, setCopied] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const { theme, setTheme } = useTheme()
  const embedded = new URLSearchParams(window.location.search).has("embed")
  const isLibrary = !embedded && id === "library"
  const block =
    blocks.find((item) => item.id === id) ||
    blocks.find((item) => item.id === "eval-suite")!
  const index = blocks.indexOf(block)
  const widePreview = block.id === "coding-agent-panel"
  const ComponentPreview = block.Component
  const source = sourceFile?.id === block.id ? sourceFile.content : ""
  useEffect(() => {
    document
      .querySelector('.desktop-sidebar [aria-current="page"]')
      ?.scrollIntoView({ block: "nearest" })
  }, [block.id, isLibrary])
  useEffect(() => {
    const handle = () => {
      setId(getId())
      setTab("preview")
      setResetKey(0)
      window.scrollTo(0, 0)
    }
    window.addEventListener("hashchange", handle)
    return () => window.removeEventListener("hashchange", handle)
  }, [])
  useEffect(() => {
    if (isLibrary) {
      document.title = "Arc Workbench · 中文组件库"
      return
    }
    document.title = `${block.name} · Arc / shadcn`
    let alive = true
    block.source().then((text) => {
      if (alive) setSourceFile({ id: block.id, content: text })
    })
    return () => {
      alive = false
    }
  }, [block, isLibrary])
  useEffect(() => {
    const handle = (event: KeyboardEvent) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "k" &&
        !(event.target instanceof HTMLTextAreaElement) &&
        !(event.target instanceof HTMLInputElement)
      ) {
        event.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener("keydown", handle)
    return () => window.removeEventListener("keydown", handle)
  }, [])
  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 1800)
    return () => clearTimeout(timer)
  }, [copied])
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("theme")
    if (
      embedded &&
      (requested === "light" || requested === "dark" || requested === "system")
    ) {
      setTheme(requested)
    }
  }, [embedded, setTheme])

  function navigate(item: BlockDefinition) {
    window.location.hash = `/${item.category.toLowerCase()}/${item.id}`
    setMenuOpen(false)
  }
  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
    } catch {
      toast.add({ title: "复制失败，请在代码面板中手动选择。", type: "error" })
    }
  }
  function download() {
    const url = URL.createObjectURL(
      new Blob([source], { type: "text/plain;charset=utf-8" })
    )
    const a = document.createElement("a")
    a.href = url
    a.download = `${block.id}.tsx`
    a.click()
    URL.revokeObjectURL(url)
  }

  const navigation = (
    <>
      <div className="sidebar-search">
        <InputGroup>
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            ref={searchRef}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="搜索组件…"
            aria-label="搜索组件"
          />
          <InputGroupAddon align="inline-end">
            {search ? (
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label="清空搜索"
                onClick={() => setSearch("")}
              >
                <X />
              </Button>
            ) : (
              <kbd>Ctrl K</kbd>
            )}
          </InputGroupAddon>
        </InputGroup>
      </div>
      <nav className="component-navigation" aria-label="组件目录">
        <div className="library-label">
          <Blocks className="size-4" />
          <span>组件库</span>
          <span className="ml-auto">{blocks.length}</span>
        </div>
        <a
          href="#/library"
          className={cn("nav-link", isLibrary && "is-active")}
          aria-current={isLibrary ? "page" : undefined}
          onClick={() => setMenuOpen(false)}
        >
          <span>总览与组合包</span>
        </a>
        {Object.entries(librarySections).map(([category, label]) => {
          const filtered = blocks.filter(
            (item) =>
              item.section === category &&
              `${item.name} ${item.description} ${item.id} ${item.exportName}`
                .toLowerCase()
                .includes(search.toLowerCase())
          )
          if (!filtered.length) return null
          return (
            <Collapsible key={category} defaultOpen className="nav-group">
              <CollapsibleTrigger className="nav-group-trigger">
                <ChevronDown className="size-3" />
                <span>{label}</span>
                <span className="nav-count">{filtered.length}</span>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="nav-links">
                  {filtered.map((item) => (
                    <a
                      key={item.id}
                      href={`#/${item.category.toLowerCase()}/${item.id}`}
                      onClick={() => setMenuOpen(false)}
                      className={cn(
                        "nav-link",
                        !isLibrary && block.id === item.id && "is-active"
                      )}
                      aria-current={
                        !isLibrary && block.id === item.id ? "page" : undefined
                      }
                    >
                      <span>{item.name}</span>
                      {!isLibrary && block.id === item.id && (
                        <span className="active-dot" />
                      )}
                    </a>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )
        })}
        {search &&
          !blocks.some((item) =>
            `${item.name} ${item.description} ${item.id} ${item.exportName}`
              .toLowerCase()
              .includes(search.toLowerCase())
          ) && (
            <p className="px-4 py-8 text-sm text-muted-foreground">
              没有找到这个组件。
            </p>
          )}
      </nav>
      <div className="sidebar-footer">
        <span className="flex items-center gap-2">
          <span className="status-dot" />
          {blocks.length} 个组件
        </span>
        <span>shadcn/ui</span>
      </div>
    </>
  )
  const preview = (
    <PreviewBoundary key={`${id}-${resetKey}`}>
      <Suspense
        fallback={
          <div className="flex w-full flex-col gap-4 p-6">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-56 w-full" />
            <Skeleton className="h-8 w-2/3" />
          </div>
        }
      >
        <ComponentPreview />
      </Suspense>
    </PreviewBoundary>
  )

  if (embedded)
    return (
      <TooltipProvider>
        <div className="embedded-preview">{preview}</div>
        <Toaster />
      </TooltipProvider>
    )
  return (
    <TooltipProvider delay={250}>
      <div className="app-shell">
        <header className="site-header">
          <div className="header-leading">
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="mobile-menu"
                    aria-label="打开组件目录"
                  />
                }
              >
                <Menu />
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <SheetHeader className="p-5">
                  <SheetTitle>组件目录</SheetTitle>
                </SheetHeader>
                {navigation}
              </SheetContent>
            </Sheet>
            <a
              href="#/library"
              className="wordmark"
              aria-label="Arc shadcn 组件库首页"
            >
              <svg
                viewBox="0 0 24 26"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M3 23V12a9 9 0 0 1 18 0v11M7 23V12a5 5 0 0 1 10 0v11M11 23V12a1 1 0 0 1 2 0v11" />
              </svg>
              <span>Arc</span>
              <span className="wordmark-slash">/</span>
              <span className="wordmark-caption">shadcn</span>
            </a>
            <div className="header-tab">组件库</div>
          </div>
          <div className="header-actions">
            <span className="hidden text-xs text-muted-foreground md:block">
              AI 与智能体组件
            </span>
            <a
              className="reference-link"
              href={registryHome}
              target="_blank"
              rel="noreferrer"
            >
              GitHub
              <ArrowUpRight className="size-3.5" />
            </a>
            <div className="h-5 w-px bg-border" />
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={
                      theme === "dark" ? "切换浅色主题" : "切换深色主题"
                    }
                    onClick={() =>
                      setTheme(theme === "dark" ? "light" : "dark")
                    }
                  />
                }
              >
                {theme === "dark" ? <Sun /> : <Moon />}
              </TooltipTrigger>
              <TooltipContent>切换明暗主题</TooltipContent>
            </Tooltip>
          </div>
        </header>
        <aside className="desktop-sidebar">{navigation}</aside>
        <div
          className={cn(
            "workspace",
            (widePreview || isLibrary) && "workspace-wide"
          )}
        >
          <main className="main-content">
            {isLibrary ? (
              <LibraryOverview />
            ) : (
              <>
                <div className="breadcrumb">
                  <span>组件库</span>
                  <ChevronRight className="size-3" />
                  <span>{librarySections[block.section]}</span>
                  <ChevronRight className="size-3" />
                  <span className="text-foreground">{block.name}</span>
                </div>
                <section className="page-intro">
                  <div className="flex items-center gap-3">
                    <h1>{block.name}</h1>
                    <Badge variant="outline">shadcn</Badge>
                  </div>
                  <p>{block.description}</p>
                </section>
                <Tabs
                  value={tab}
                  onValueChange={setTab}
                  className="preview-tabs"
                  id="preview"
                >
                  <div className="preview-toolbar">
                    <TabsList variant="line">
                      <TabsTrigger value="preview">
                        <Eye data-icon="inline-start" />
                        预览
                      </TabsTrigger>
                      <TabsTrigger value="code">
                        <Code2 data-icon="inline-start" />
                        代码
                      </TabsTrigger>
                    </TabsList>
                    <div className="preview-options">
                      <span className="demo-label">交互预览 · 本地示例</span>
                      {tab === "preview" ? (
                        <>
                          <ToggleGroup
                            value={[width]}
                            onValueChange={([value]) => {
                              if (value) setWidth(value)
                            }}
                            spacing={0}
                            variant="outline"
                            size="sm"
                            aria-label="预览宽度"
                          >
                            <ToggleGroupItem
                              value="desktop"
                              aria-label="桌面预览"
                            >
                              <Monitor data-icon="inline-start" />
                            </ToggleGroupItem>
                            <ToggleGroupItem
                              value="mobile"
                              aria-label="手机预览"
                            >
                              <Smartphone data-icon="inline-start" />
                            </ToggleGroupItem>
                          </ToggleGroup>
                          {widePreview && (
                            <Tooltip>
                              <TooltipTrigger
                                render={
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    render={
                                      <a
                                        href={`?embed=${block.id}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        aria-label="在新标签打开面板"
                                      />
                                    }
                                    nativeButton={false}
                                  />
                                }
                              >
                                <ArrowUpRight />
                              </TooltipTrigger>
                              <TooltipContent>在新标签打开面板</TooltipContent>
                            </Tooltip>
                          )}
                          <Tooltip>
                            <TooltipTrigger
                              render={
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={() => setResetKey((v) => v + 1)}
                                  aria-label="重置演示"
                                />
                              }
                            >
                              <RotateCcw />
                            </TooltipTrigger>
                            <TooltipContent>重置演示</TooltipContent>
                          </Tooltip>
                        </>
                      ) : (
                        <Button variant="ghost" size="sm" onClick={download}>
                          <ArrowDownToLine data-icon="inline-start" />
                          下载源码
                        </Button>
                      )}
                    </div>
                  </div>
                  <TabsContent value="preview">
                    <div
                      className={cn(
                        "preview-stage",
                        width === "mobile" && "mobile-stage"
                      )}
                    >
                      {width === "mobile" ? (
                        <iframe
                          key={`${id}-${resetKey}-${theme}`}
                          title={`${block.name} 手机预览`}
                          className="mobile-preview-frame"
                          src={`?embed=${block.id}&theme=${theme}`}
                        />
                      ) : (
                        <div className="block-preview">{preview}</div>
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="code">
                    <div className="source-panel">
                      <div className="source-toolbar">
                        <ToggleGroup
                          value={[codeTab]}
                          onValueChange={([value]) => {
                            if (value) setCodeTab(value)
                          }}
                          size="sm"
                          aria-label="代码类型"
                        >
                          <ToggleGroupItem value="source">
                            组件源码
                          </ToggleGroupItem>
                          <ToggleGroupItem value="usage">
                            使用示例
                          </ToggleGroupItem>
                        </ToggleGroup>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            copy(codeTab === "source" ? source : block.usage)
                          }
                        >
                          {copied ? (
                            <Check data-icon="inline-start" />
                          ) : (
                            <Copy data-icon="inline-start" />
                          )}
                          {copied ? "已复制" : "复制代码"}
                        </Button>
                      </div>
                      <CodeBlock>
                        <CodeBlockHeader>
                          <CodeBlockTitle>
                            {codeTab === "source"
                              ? `${block.id}.tsx`
                              : "example.tsx"}
                          </CodeBlockTitle>
                        </CodeBlockHeader>
                        <CodeBlockContent className="max-h-[680px]" lineNumbers>
                          {codeTab === "source" ? source : block.usage}
                        </CodeBlockContent>
                      </CodeBlock>
                    </div>
                  </TabsContent>
                </Tabs>
                <section className="usage-section" id="usage">
                  <div className="section-heading">
                    <h2>安装与使用</h2>
                    <span>shadcn Base UI</span>
                  </div>
                  <div className="mb-4 flex flex-col gap-3">
                    <InstallCommand id={block.id} />
                    <InstallStyles />
                  </div>
                  <CodeBlock>
                    <CodeBlockHeader>
                      <CodeBlockTitle>example.tsx</CodeBlockTitle>
                      <CodeBlockActions>
                        <CodeBlockCopyButton value={block.usage} />
                      </CodeBlockActions>
                    </CodeBlockHeader>
                    <CodeBlockContent>{block.usage}</CodeBlockContent>
                  </CodeBlock>
                  <p>
                    演示使用本地数据。真实模型、服务连接和定时执行，需要在你的项目中接入对应接口。
                  </p>
                </section>
                <nav className="page-pagination" aria-label="切换组件">
                  <Button
                    variant="ghost"
                    disabled={index === 0}
                    onClick={() => navigate(blocks[index - 1])}
                  >
                    <ArrowLeft data-icon="inline-start" />
                    {index > 0 ? blocks[index - 1].name : "第一个组件"}
                  </Button>
                  <Button
                    variant="ghost"
                    disabled={index === blocks.length - 1}
                    onClick={() => navigate(blocks[index + 1])}
                  >
                    {index < blocks.length - 1
                      ? blocks[index + 1].name
                      : "最后一个组件"}
                    <ArrowRight data-icon="inline-end" />
                  </Button>
                </nav>
                <footer className="content-footer">
                  <span>参考 Arc · 使用 shadcn/ui 实现</span>
                  <span>
                    {index + 1} / {blocks.length}
                  </span>
                </footer>
              </>
            )}
          </main>
          {!isLibrary && (
            <aside className="page-toc">
              <span>本页导航</span>
              <a
                href="#preview"
                onClick={(event) => {
                  event.preventDefault()
                  document
                    .getElementById("preview")
                    ?.scrollIntoView({ behavior: "smooth" })
                }}
              >
                预览
              </a>
              <a
                href="#usage"
                onClick={(event) => {
                  event.preventDefault()
                  document
                    .getElementById("usage")
                    ?.scrollIntoView({ behavior: "smooth" })
                }}
              >
                安装与使用
              </a>
              <button
                onClick={() => {
                  setTab("code")
                  document
                    .getElementById("preview")
                    ?.scrollIntoView({ behavior: "smooth" })
                }}
              >
                组件源码
              </button>
              <a
                href={block.reference}
                target="_blank"
                rel="noreferrer"
                className="toc-reference"
              >
                {block.category === "Coding" ? "参考文档" : "原站组件"}
                <ArrowUpRight className="size-3" />
              </a>
              <span className="toc-note">
                React · TypeScript
                <br />
                Tailwind CSS · Base UI
              </span>
            </aside>
          )}
        </div>
      </div>
      <Toaster />
    </TooltipProvider>
  )
}
