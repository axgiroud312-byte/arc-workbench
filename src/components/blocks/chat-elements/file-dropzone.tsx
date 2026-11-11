"use client"

import { useRef, useState } from "react"
import { UploadIcon } from "lucide-react"

import { Button } from "../../ui/button"
import { Attachments, type ChatAttachment } from "./attachments"

export function FileDropzone({
  onFiles,
  multiple = true,
  disabled = false,
}: {
  onFiles: (files: File[]) => void
  multiple?: boolean
  disabled?: boolean
}) {
  const input = useRef<HTMLInputElement>(null)
  const dragDepth = useRef(0)
  const [active, setActive] = useState(false)

  function selectFiles(files: FileList) {
    if (!disabled && files.length)
      onFiles(Array.from(files).slice(0, multiple ? files.length : 1))
  }

  return (
    <div
      data-dragging={active && !disabled}
      className="flex flex-col items-center gap-2 rounded-lg border border-dashed bg-card px-3 py-5 text-center transition-colors data-[dragging=true]:border-primary data-[dragging=true]:bg-accent"
      onDragEnter={(event) => {
        if (!event.dataTransfer.types.includes("Files")) return
        event.preventDefault()
        dragDepth.current += 1
        setActive(true)
      }}
      onDragOver={(event) => {
        if (!event.dataTransfer.types.includes("Files")) return
        event.preventDefault()
        event.dataTransfer.dropEffect = disabled ? "none" : "copy"
      }}
      onDragLeave={() => {
        dragDepth.current = Math.max(0, dragDepth.current - 1)
        if (!dragDepth.current) setActive(false)
      }}
      onDrop={(event) => {
        if (!event.dataTransfer.types.includes("Files")) return
        event.preventDefault()
        dragDepth.current = 0
        setActive(false)
        selectFiles(event.dataTransfer.files)
      }}
    >
      <UploadIcon className="size-5 text-muted-foreground" aria-hidden="true" />
      <p className="text-sm font-medium">
        {multiple ? "将文件拖到这里" : "将单个文件拖到这里"}
      </p>
      <input
        ref={input}
        type="file"
        multiple={multiple}
        disabled={disabled}
        hidden
        onChange={(event) => {
          if (event.currentTarget.files) selectFiles(event.currentTarget.files)
          event.currentTarget.value = ""
        }}
      />
      <Button
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={() => input.current?.click()}
      >
        选择文件
      </Button>
    </div>
  )
}

export function FileDropzoneDemo() {
  const [files, setFiles] = useState<ChatAttachment[]>([
    { id: "example", name: "界面需求.md", detail: "1.2 KB · 示例附件" },
  ])
  return (
    <div className="mx-auto grid w-full max-w-sm gap-3">
      <FileDropzone
        onFiles={(selected) => {
          const items = selected.map((file) => ({
            id: crypto.randomUUID(),
            name: file.name,
            detail: (file.size / 1024).toFixed(1) + " KB · 本地文件",
          }))
          setFiles((current) => [...current, ...items])
        }}
      />
      <Attachments
        items={files}
        onRemove={(id) =>
          setFiles((current) => current.filter((file) => file.id !== id))
        }
      />
    </div>
  )
}
