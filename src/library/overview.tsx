import { ArrowUpRight } from "lucide-react"
import { Badge } from "../components/ui/badge"
import { buttonVariants } from "../components/ui/button"
import { cn } from "../lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card"
import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockTitle,
} from "../components/ui/code-block"
import {
  blockCatalog,
  installCommand,
  installStyles,
  libraryKits,
  librarySections,
  registryHome,
} from "./catalog"
import { foundationCatalog } from "./foundation"

const catalog = [...blockCatalog, ...foundationCatalog]

function InstallSnippet({ label, value }: { label: string; value: string }) {
  return (
    <CodeBlock size="sm">
      <CodeBlockHeader>
        <CodeBlockTitle>{label}</CodeBlockTitle>
        <CodeBlockActions>
          <CodeBlockCopyButton value={value} aria-label={"复制" + label} />
        </CodeBlockActions>
      </CodeBlockHeader>
      <CodeBlockContent wrap>{value}</CodeBlockContent>
    </CodeBlock>
  )
}

export function InstallCommand({ id }: { id: string }) {
  return <InstallSnippet label="安装命令" value={installCommand(id)} />
}

export function InstallStyles() {
  return <InstallSnippet label="Tailwind 样式导入" value={installStyles} />
}

export function LibraryOverview() {
  return (
    <div className="flex min-w-0 flex-col gap-8">
      <section className="page-intro mb-0!">
        <div className="flex flex-wrap items-center gap-3">
          <h1>Arc Workbench</h1>
          <Badge variant="outline">shadcn · Base UI</Badge>
        </div>
        <p>
          可交互的中文 AI 与 Agent
          组件。选择组合包开始，或从左侧按需安装单个组件。
        </p>
      </section>
      <section aria-labelledby="kit-heading" className="flex flex-col gap-4">
        <div className="section-heading mb-0!">
          <h2 id="kit-heading">组合套件</h2>
          <a
            className="text-sm text-muted-foreground hover:text-foreground"
            href={registryHome}
          >
            源码与发布记录 <ArrowUpRight className="inline size-3.5" />
          </a>
        </div>
        <div className="grid min-w-0 gap-3 lg:grid-cols-2">
          {libraryKits.map((kit) => {
            const preview =
              catalog.find((item) => item.id === kit.preview) ??
              foundationCatalog[0]
            return (
              <Card key={kit.id} className="min-w-0 gap-3">
                <CardHeader>
                  <CardTitle>{kit.title}</CardTitle>
                  <CardDescription>{kit.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex min-w-0 flex-col gap-3">
                  <InstallCommand id={kit.id} />
                  <a
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "self-start"
                    )}
                    href={
                      "#/" + preview.category.toLowerCase() + "/" + preview.id
                    }
                  >
                    {kit.preview ? "查看预览" : "浏览基础组件"}
                    <ArrowUpRight data-icon="inline-end" />
                  </a>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>
      <section
        aria-labelledby="category-heading"
        className="flex flex-col gap-3"
      >
        <div className="section-heading mb-0!">
          <h2 id="category-heading">按功能浏览</h2>
        </div>
        <div className="grid min-w-0 gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {Object.entries(librarySections).map(([id, title]) => {
            const entries = catalog.filter((item) => item.section === id)
            const first = entries[0]
            return (
              <a
                key={id}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-12 justify-between"
                )}
                href={"#/" + first.category.toLowerCase() + "/" + first.id}
              >
                {title}
                <span className="text-xs text-muted-foreground">
                  {entries.length} 个
                </span>
              </a>
            )
          })}
        </div>
      </section>
      <section
        aria-labelledby="style-heading"
        className="flex max-w-2xl flex-col gap-3 pb-6"
      >
        <div className="section-heading mb-0!">
          <h2 id="style-heading">接入项目</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          在已初始化 shadcn Base UI 的 React + Tailwind CSS 4
          项目运行安装命令，再在 Tailwind 样式入口加入以下一行。
        </p>
        <InstallStyles />
      </section>
    </div>
  )
}
