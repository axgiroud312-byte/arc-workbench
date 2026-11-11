"use client"

import { useState } from "react"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MonitorIcon,
  RotateCwIcon,
  SmartphoneIcon,
} from "lucide-react"

import { Button } from "../../ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select"
import { ToggleGroup, ToggleGroupItem } from "../../ui/toggle-group"

export type WebPreviewPage = {
  id: string
  title: string
  path: string
} & ({ src: string; srcDoc?: never } | { srcDoc: string; src?: never })

export function WebPreview({ pages }: { pages: readonly WebPreviewPage[] }) {
  const [selected, setSelected] = useState<string>()
  const [device, setDevice] = useState<"desktop" | "phone">("desktop")
  const [reload, setReload] = useState(0)
  const index = Math.max(
    0,
    pages.findIndex((page) => page.id === selected)
  )
  const page = pages[index]
  if (!page) {
    return (
      <div className="grid min-h-40 place-items-center rounded-xl border bg-card text-sm text-muted-foreground">
        等待生成网页预览
      </div>
    )
  }

  return (
    <section
      aria-label="网页预览"
      className="overflow-hidden rounded-xl border bg-card"
    >
      <div className="flex flex-wrap items-center gap-2 border-b p-2.5">
        <div className="flex shrink-0 gap-0.5">
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label="上一页"
            disabled={index === 0}
            onClick={() => setSelected(pages[index - 1].id)}
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label="下一页"
            disabled={index === pages.length - 1}
            onClick={() => setSelected(pages[index + 1].id)}
          >
            <ChevronRightIcon />
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label="重新加载网页"
            onClick={() => setReload((current) => current + 1)}
          >
            <RotateCwIcon />
          </Button>
        </div>
        <Select<string>
          value={page.id}
          onValueChange={(id) => {
            if (id) setSelected(id)
          }}
        >
          <SelectTrigger
            size="sm"
            aria-label="预览页面"
            className="min-w-28 flex-1 bg-muted/60 font-mono text-xs"
          >
            <SelectValue>{page.path}</SelectValue>
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            {pages.map((entry) => (
              <SelectItem key={entry.id} value={entry.id}>
                {entry.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <ToggleGroup
          value={[device]}
          onValueChange={([next]) => {
            if (next === "desktop" || next === "phone") setDevice(next)
          }}
          variant="outline"
          size="sm"
          spacing={0}
          aria-label="网页尺寸"
        >
          <ToggleGroupItem value="desktop" aria-label="桌面网页">
            <MonitorIcon />
          </ToggleGroupItem>
          <ToggleGroupItem value="phone" aria-label="手机网页">
            <SmartphoneIcon />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div className="flex justify-center bg-muted/50 p-2.5 sm:p-4">
        <iframe
          key={page.id + ":" + reload}
          title={page.title}
          src={page.src}
          srcDoc={page.srcDoc}
          sandbox=""
          referrerPolicy="no-referrer"
          className="h-64 w-full max-w-full rounded-lg border bg-white"
          style={{ width: device === "phone" ? 350 : "100%" }}
        />
      </div>
    </section>
  )
}

function previewDocument(title: string, content: string) {
  return `<!doctype html>
<html lang="zh-CN">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<style>
  * { box-sizing: border-box }
  body { margin: 0; padding: clamp(16px, 5vw, 32px); color: #172b26; background: #f3f8f5; font: 14px/1.5 system-ui, sans-serif }
  header { border-bottom: 1px solid #d6e3da; padding-bottom: 12px; color: #39584a; font-size: 12px }
  h1 { margin: 14px 0 4px; font-size: clamp(21px, 5vw, 30px); letter-spacing: -0.04em }
  p { color: #456357; margin: 0 0 14px }
  dl { display: grid; grid-template-columns: repeat(auto-fit, minmax(105px, 1fr)); gap: 8px; margin: 0 }
  dl div { border: 1px solid #d6e3da; border-radius: 8px; padding: 10px; background: #fff }
  dt { font-size: 12px; color: #456357 }
  dd { margin: 4px 0 0; font-size: 17px; font-weight: 600 }
</style>
<header>项目工作区</header>
<main><h1>${title}</h1>${content}</main>
</html>`
}

const samplePages: WebPreviewPage[] = [
  {
    id: "home",
    title: "项目首页",
    path: "/",
    srcDoc: previewDocument(
      "项目首页",
      "<p>最近一次运行的检查结果。</p><dl><div><dt>测试</dt><dd>8 / 8</dd></div><div><dt>改动文件</dt><dd>3</dd></div><div><dt>用时</dt><dd>18 秒</dd></div></dl>"
    ),
  },
  {
    id: "settings",
    title: "项目设置",
    path: "/settings",
    srcDoc: previewDocument(
      "项目设置",
      "<p>当前工作区的默认偏好。</p><dl><div><dt>分支</dt><dd>main</dd></div><div><dt>审批</dt><dd>每次询问</dd></div></dl>"
    ),
  },
]

export function WebPreviewDemo() {
  return <WebPreview pages={samplePages} />
}
