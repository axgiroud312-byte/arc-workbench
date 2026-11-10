import { useRef, useState } from "react"
import { FileText, Paperclip, X } from "lucide-react"
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
} from "../../ui/attachment"
import { Button } from "../../ui/button"
import { PreviewCard } from "../coding-agent/preview-card"

export type ChatAttachment = { id: string; name: string; detail?: string }

export function Attachments({
  items,
  onRemove,
}: {
  items: ChatAttachment[]
  onRemove?: (id: string) => void
}) {
  if (!items.length) return null
  return (
    <AttachmentGroup aria-label="附件">
      {items.map((item) => (
        <Attachment key={item.id} size="sm">
          <AttachmentMedia>
            <FileText />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>{item.name}</AttachmentTitle>
            {item.detail && (
              <AttachmentDescription>{item.detail}</AttachmentDescription>
            )}
          </AttachmentContent>
          {onRemove && (
            <AttachmentActions>
              <AttachmentAction
                aria-label={"移除 " + item.name}
                onClick={() => onRemove(item.id)}
              >
                <X />
              </AttachmentAction>
            </AttachmentActions>
          )}
        </Attachment>
      ))}
    </AttachmentGroup>
  )
}

export function AttachmentsDemo() {
  const [files, setFiles] = useState<ChatAttachment[]>([
    { id: "example", name: "回车问题.md", detail: "Markdown · 示例附件" },
    { id: "log", name: "失败日志.txt", detail: "文本 · 示例附件" },
  ])
  const input = useRef<HTMLInputElement>(null)
  return (
    <PreviewCard title="消息附件">
      <Attachments
        items={files}
        onRemove={(id) =>
          setFiles((current) => current.filter((file) => file.id !== id))
        }
      />
      <input
        ref={input}
        type="file"
        multiple
        hidden
        onChange={(event) => {
          const selected = Array.from(event.target.files ?? [], (file) => ({
            id: crypto.randomUUID(),
            name: file.name,
            detail: (file.size / 1024).toFixed(1) + " KB · 本地文件",
          }))
          setFiles((current) => [...current, ...selected])
          event.target.value = ""
        }}
      />
      <Button
        variant="outline"
        size="sm"
        className="self-start"
        onClick={() => input.current?.click()}
      >
        <Paperclip data-icon="inline-start" />
        添加附件
      </Button>
    </PreviewCard>
  )
}
