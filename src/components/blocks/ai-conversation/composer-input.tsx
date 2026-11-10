import { useRef, useState } from "react"
import { ArrowUp, Brain, Globe, Paperclip, Square } from "lucide-react"
import { Button } from "../../ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupTextarea,
} from "../../ui/input-group"
import { Attachments } from "../chat-elements/attachments"
import { ModelMenu } from "./model-picker"

export type SendMode = "enter" | "modifier-enter"

export type ComposerSubmission = {
  text: string
  files: File[]
  model: string
  webSearch: boolean
  thinking: boolean
}

export function ComposerInput({
  value,
  onChange,
  onSend,
  running = false,
  onStop,
  placeholder = "输入你的问题…",
  compact = false,
  sendMode = "enter",
  model: controlledModel,
  onModelChange,
}: {
  value: string
  onChange: (value: string) => void
  onSend: (submission: ComposerSubmission) => void
  running?: boolean
  onStop?: () => void
  placeholder?: string
  compact?: boolean
  sendMode?: SendMode
  model?: string
  onModelChange?: (id: string) => void
}) {
  const [files, setFiles] = useState<File[]>([])
  const [model, setModel] = useState("sonnet")
  const [webSearch, setWebSearch] = useState(false)
  const [thinking, setThinking] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)
  const activeModel = controlledModel ?? model
  const send = () => {
    if (!value.trim() || running) return
    onSend({
      text: value.trim(),
      files,
      model: activeModel,
      webSearch,
      thinking,
    })
    setFiles([])
  }
  const shortcuts = value.endsWith("/")
    ? ["总结", "改写", "解释"]
    : value.endsWith("@")
      ? ["项目简介", "设计系统", "项目计划"]
      : []
  return (
    <div className="flex w-full flex-col gap-2">
      <input
        ref={fileInput}
        className="sr-only"
        type="file"
        multiple
        aria-label="添加本地文件"
        onChange={(event) => {
          setFiles([...files, ...Array.from(event.target.files ?? [])])
          event.target.value = ""
        }}
      />
      <Attachments
        items={files.map((file, index) => ({
          id: String(index),
          name: file.name,
          detail: (file.size / 1024).toFixed(1) + " KB · 本地文件",
        }))}
        onRemove={(id) =>
          setFiles((current) =>
            current.filter((_, index) => String(index) !== id)
          )
        }
      />
      {shortcuts.length > 0 && (
        <div className="flex flex-wrap gap-1 rounded-lg border bg-popover p-1">
          {shortcuts.map((shortcut) => (
            <Button
              key={shortcut}
              variant="ghost"
              size="sm"
              onClick={() =>
                onChange(
                  value.slice(0, -1) +
                    (value.endsWith("@") ? `@${shortcut} ` : `${shortcut} `)
                )
              }
            >
              {shortcut}
            </Button>
          ))}
        </div>
      )}
      <InputGroup>
        <InputGroupTextarea
          aria-label="消息"
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={compact ? 2 : 3}
          onKeyDown={(event) => {
            if (event.nativeEvent.isComposing || event.keyCode === 229) return
            if (
              event.key === "Enter" &&
              !event.shiftKey &&
              (sendMode === "enter" || event.ctrlKey || event.metaKey)
            ) {
              event.preventDefault()
              send()
            }
            if (event.key === "Escape" && running) onStop?.()
          }}
        />
        <InputGroupAddon align="block-end" className="flex-wrap">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="添加附件"
            onClick={() => fileInput.current?.click()}
          >
            <Paperclip />
          </Button>
          {!compact && (
            <>
              <Button
                variant={webSearch ? "secondary" : "ghost"}
                size="icon-sm"
                aria-label="联网搜索"
                title="在请求中启用联网搜索"
                aria-pressed={webSearch}
                onClick={() => setWebSearch(!webSearch)}
              >
                <Globe />
              </Button>
              <Button
                variant={thinking ? "secondary" : "ghost"}
                size="icon-sm"
                aria-label="深入思考"
                title="在请求中启用深入思考"
                aria-pressed={thinking}
                onClick={() => setThinking(!thinking)}
              >
                <Brain />
              </Button>
            </>
          )}
          <div className="ml-auto">
            <ModelMenu
              value={activeModel}
              onChange={(id) => {
                setModel(id)
                onModelChange?.(id)
              }}
            />
          </div>
          <Button
            size="icon-sm"
            aria-label={running ? "停止回复" : "发送消息"}
            aria-keyshortcuts={
              running
                ? "Escape"
                : sendMode === "enter"
                  ? "Enter"
                  : "Control+Enter Meta+Enter"
            }
            disabled={!running && !value.trim()}
            onClick={running ? onStop : send}
          >
            {running ? <Square /> : <ArrowUp />}
          </Button>
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}
