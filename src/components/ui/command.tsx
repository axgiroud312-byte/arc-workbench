"use client"

import { useRef, useState, type ReactElement, type ReactNode } from "react"
import { Combobox } from "@base-ui/react/combobox"
import { SearchIcon } from "lucide-react"

import { Button } from "./button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog"
import { InputGroup, InputGroupAddon, InputGroupInput } from "./input-group"
import { Kbd } from "./kbd"

export type CommandAction = {
  id: string
  label: string
  keywords?: string[]
  icon?: ReactNode
  shortcut?: string
  disabled?: boolean
}

export function CommandPalette({
  actions,
  onSelect,
  trigger = <Button variant="outline">打开命令面板</Button>,
  title = "命令面板",
  description = "搜索并运行命令。",
  placeholder = "搜索命令…",
}: {
  actions: CommandAction[]
  onSelect: (id: string) => void
  trigger?: ReactElement
  title?: string
  description?: string
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent initialFocus={input} className="gap-3 sm:max-w-md">
        <DialogHeader className="pr-8">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Combobox.Root<CommandAction>
          inline
          open
          autoHighlight
          items={actions}
          itemToStringLabel={(action) => action.label}
          itemToStringValue={(action) => action.id}
          filter={(action, query) =>
            [action.label, action.id, ...(action.keywords ?? [])].some((term) =>
              term
                .toLocaleLowerCase()
                .includes(query.trim().toLocaleLowerCase())
            )
          }
          onValueChange={(action) => {
            if (!action) return
            setOpen(false)
            onSelect(action.id)
          }}
        >
          <InputGroup>
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <Combobox.Input
              ref={input}
              render={<InputGroupInput />}
              placeholder={placeholder}
              aria-label="搜索命令"
            />
          </InputGroup>
          <Combobox.Empty className="py-4 text-center text-muted-foreground empty:hidden">
            没有找到命令。
          </Combobox.Empty>
          <Combobox.List className="max-h-60 overflow-y-auto empty:hidden">
            {(action: CommandAction) => (
              <Combobox.Item
                key={action.id}
                value={action}
                disabled={action.disabled}
                className="flex cursor-default items-center gap-2 rounded-md px-2 py-2 outline-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:opacity-50 [&_svg]:size-4"
              >
                {action.icon}
                <span className="min-w-0 flex-1 truncate">{action.label}</span>
                {action.shortcut && <Kbd>{action.shortcut}</Kbd>}
              </Combobox.Item>
            )}
          </Combobox.List>
        </Combobox.Root>
      </DialogContent>
    </Dialog>
  )
}
