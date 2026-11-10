import { useState } from "react"
import {
  Check,
  CheckCheck,
  Download,
  FileText,
  ScanLine,
  Square,
} from "lucide-react"
import { Button } from "../../ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../ui/card"
import { Badge } from "../../ui/badge"
import { Input } from "../../ui/input"
import { Textarea } from "../../ui/textarea"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../ui/tabs"
import { FieldGroup, Field, FieldLabel } from "../../ui/field"
import { Progress } from "../../ui/progress"
import { useDemoRun } from "../shared"
import { CopyAction } from "./demo-helpers"
import { cn } from "../../../lib/utils"
import "./document-extract.css"

const extractionFields = [
  { key: "vendor", label: "供应商", value: "Northstar Studio", confidence: 99 },
  {
    key: "invoice_number",
    label: "发票编号",
    value: "INV-2026-042",
    confidence: 99,
  },
  { key: "date", label: "开票日期", value: "2026-10-24", confidence: 98 },
  {
    key: "due_date",
    label: "付款截止日期",
    value: "2026-11-23",
    confidence: 82,
  },
  { key: "subtotal", label: "小计", value: "2400.00", confidence: 99 },
  { key: "total", label: "总计（美元）", value: "2880.00", confidence: 99 },
]

export function DocumentExtract({
  onConfirm,
}: { onConfirm?: (data: Record<string, string>) => void } = {}) {
  const run = useDemoRun({ steps: 6, interval: 450 })
  const [values, setValues] = useState<Record<string, string>>({})
  const [active, setActive] = useState<string | null>(null)
  const [accepted, setAccepted] = useState(false)
  const [reviewed, setReviewed] = useState(false)
  const visibleCount = run.step
  const data = Object.fromEntries(
    extractionFields
      .slice(0, visibleCount)
      .map((field) => [field.key, values[field.key] ?? field.value])
  )
  const complete = run.progress >= 100
  const start = () => {
    setValues({})
    setAccepted(false)
    setReviewed(false)
    run.start()
  }
  const confirm = () => {
    setAccepted(true)
    setReviewed(true)
    onConfirm?.(data)
  }
  const download = () => {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    )
    const link = document.createElement("a")
    link.href = url
    link.download = "invoice-extraction.json"
    link.click()
    URL.revokeObjectURL(url)
  }
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ScanLine className="size-4 text-muted-foreground" />
            <CardTitle>文档提取</CardTitle>
          </div>
          <Button onClick={run.running ? run.stop : start}>
            {run.running ? (
              <Square data-icon="inline-start" />
            ) : (
              <ScanLine data-icon="inline-start" />
            )}
            {run.running ? "停止" : complete ? "重新提取" : "提取字段"}
          </Button>
        </div>
        <CardDescription>提取结构化字段，并对照原文核实。</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid overflow-hidden rounded-lg border lg:grid-cols-2">
          <div className="flex min-w-0 flex-col bg-muted/50">
            <div className="flex items-center justify-between border-b px-4 py-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-2">
                <FileText className="size-3.5" />
                northstar-发票.pdf
              </span>
              <span>第 1 / 1 页</span>
            </div>
            <div className="p-4 sm:p-6">
              <article
                aria-label="示例发票"
                className="invoice-paper mx-auto flex max-w-sm flex-col gap-6 rounded-sm bg-background p-6 shadow-sm"
              >
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    className={cn(
                      "w-fit text-left text-lg font-semibold",
                      active === "vendor" && "bg-accent"
                    )}
                    onMouseEnter={() => setActive("vendor")}
                    onMouseLeave={() => setActive(null)}
                  >
                    Northstar Studio
                  </button>
                  <p className="text-xs text-muted-foreground">
                    品牌设计与数字体验
                    <br />
                    英国伦敦国王街 14 号
                  </p>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-xl font-medium">发票</h3>
                  <div className="text-right text-xs leading-6">
                    <span
                      className={cn(active === "invoice_number" && "bg-accent")}
                    >
                      INV-2026-042
                    </span>
                    <br />
                    <span className={cn(active === "date" && "bg-accent")}>
                      2026 年 10 月 24 日
                    </span>
                  </div>
                </div>
                <div className="text-xs leading-6">
                  <span className="text-muted-foreground">付款方</span>
                  <br />
                  Forma Technologies
                  <br />
                  亚历克斯·摩根
                  <br />
                  alex@forma.example
                </div>
                <div className="flex flex-col gap-3 text-xs">
                  <div className="flex justify-between border-b pb-2 text-muted-foreground">
                    <span>项目</span>
                    <span>金额</span>
                  </div>
                  <div className="flex justify-between">
                    <span>设计系统开发</span>
                    <span>$1,800.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>组件文档编写</span>
                    <span>$600.00</span>
                  </div>
                  <div
                    className={cn(
                      "flex justify-between border-t pt-3",
                      active === "subtotal" && "bg-accent"
                    )}
                  >
                    <span>小计</span>
                    <span>$2,400.00</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>增值税 · 20%</span>
                    <span>$480.00</span>
                  </div>
                  <div
                    className={cn(
                      "flex justify-between text-sm font-medium",
                      active === "total" && "bg-accent"
                    )}
                  >
                    <span>总计</span>
                    <span>$2,880.00</span>
                  </div>
                </div>
                <p
                  className={cn(
                    "text-xs text-muted-foreground",
                    active === "due_date" && "bg-accent"
                  )}
                >
                  请于 2026 年 11 月 23 日前付款。
                  <br />
                  感谢您的支持。
                </p>
              </article>
            </div>
          </div>
          <div className="flex flex-col gap-4 p-4 sm:p-5">
            <Tabs defaultValue="fields">
              <div className="flex items-center justify-between gap-2">
                <TabsList>
                  <TabsTrigger value="fields">字段</TabsTrigger>
                  <TabsTrigger value="json">JSON</TabsTrigger>
                  <TabsTrigger value="schema">字段结构</TabsTrigger>
                </TabsList>
                <span className="text-xs text-muted-foreground">
                  {visibleCount} / 6
                </span>
              </div>
              <TabsContent value="fields">
                <FieldGroup className="gap-4">
                  {extractionFields.map((field, index) => (
                    <Field
                      key={field.key}
                      onMouseEnter={() => setActive(field.key)}
                      onMouseLeave={() => setActive(null)}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <FieldLabel htmlFor={`extract-${field.key}`}>
                          {field.label}
                        </FieldLabel>
                        {index < visibleCount && (
                          <Badge
                            variant={
                              field.confidence < 90 && !reviewed
                                ? "outline"
                                : "secondary"
                            }
                          >
                            {field.confidence < 90 && !reviewed
                              ? "待核对"
                              : `${field.confidence}%`}
                          </Badge>
                        )}
                      </div>
                      <Input
                        id={`extract-${field.key}`}
                        value={
                          index < visibleCount
                            ? (values[field.key] ?? field.value)
                            : ""
                        }
                        placeholder={run.running ? "正在读取文档…" : "尚未提取"}
                        disabled={index >= visibleCount || accepted}
                        onFocus={() => setActive(field.key)}
                        onBlur={() => setActive(null)}
                        onChange={(event) =>
                          setValues({
                            ...values,
                            [field.key]: event.target.value,
                          })
                        }
                      />
                      {field.confidence < 90 &&
                        index < visibleCount &&
                        !reviewed && (
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-muted-foreground">
                              原文较小，请核对付款日期。
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setReviewed(true)}
                            >
                              <Check data-icon="inline-start" />
                              确认无误
                            </Button>
                          </div>
                        )}
                    </Field>
                  ))}
                </FieldGroup>
              </TabsContent>
              <TabsContent value="json">
                <div className="flex justify-end">
                  <CopyAction
                    value={JSON.stringify(data, null, 2)}
                    label="复制提取结果 JSON"
                  />
                </div>
                <Textarea
                  aria-label="提取结果 JSON"
                  readOnly
                  value={JSON.stringify(data, null, 2)}
                  className="min-h-80"
                />
              </TabsContent>
              <TabsContent value="schema">
                <Textarea
                  aria-label="提取字段结构"
                  readOnly
                  className="min-h-80"
                  value={JSON.stringify(
                    {
                      type: "object",
                      properties: Object.fromEntries(
                        extractionFields.map((field) => [
                          field.key,
                          { type: "string", description: field.label },
                        ])
                      ),
                      required: extractionFields.map((field) => field.key),
                    },
                    null,
                    2
                  )}
                />
              </TabsContent>
            </Tabs>
            {run.running && (
              <Progress value={run.progress} aria-label="提取进度" />
            )}
            <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-3">
              <span className="text-xs text-muted-foreground">
                示例发票 · 本地提取
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label="下载提取结果 JSON"
                  disabled={!complete}
                  onClick={download}
                >
                  <Download />
                </Button>
                <Button
                  size="sm"
                  disabled={!complete || accepted}
                  onClick={confirm}
                >
                  <CheckCheck data-icon="inline-start" />
                  {accepted ? "已确认" : "全部确认"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
