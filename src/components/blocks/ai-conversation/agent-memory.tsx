import { useMemo, useState } from "react"
import {
  Brain,
  Check,
  Pencil,
  Plus,
  Search,
  Trash2,
  Undo2,
  X,
} from "lucide-react"
import { Button } from "../../ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "../../ui/card"
import { Input } from "../../ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../../ui/input-group"
import { Switch } from "../../ui/switch"
import { Badge } from "../../ui/badge"
import { ToggleGroup, ToggleGroupItem } from "../../ui/toggle-group"
import { Field, FieldLabel, FieldGroup } from "../../ui/field"

type Memory = { id: number; text: string; category: string; source: string }
const memoryCategories = [
  { value: "All", label: "全部" },
  { value: "About you", label: "关于你" },
  { value: "Preferences", label: "偏好" },
  { value: "Projects", label: "项目" },
  { value: "People", label: "人物" },
]
const initialMemories: Memory[] = [
  {
    id: 1,
    text: "你是一名住在哥本哈根的产品设计师。",
    category: "About you",
    source: "来自“关于我的一些事” · 2 天前",
  },
  {
    id: 2,
    text: "你喜欢清楚简短的回答，最好附带实际例子。",
    category: "Preferences",
    source: "来自“我的工作习惯” · 3 天前",
  },
  {
    id: 3,
    text: "你正在开发 Forma，一个面向小团队的工作空间。",
    category: "Projects",
    source: "来自“Forma 项目计划” · 5 天前",
  },
  {
    id: 4,
    text: "你的前端技术栈是 React、TypeScript 和 Tailwind。",
    category: "Preferences",
    source: "来自“项目初始化” · 1 周前",
  },
  {
    id: 5,
    text: "玛雅是你的联合创始人，负责技术开发。",
    category: "People",
    source: "来自“团队介绍” · 1 周前",
  },
]

export function AgentMemory({
  onChange,
}: { onChange?: (memories: Memory[]) => void } = {}) {
  const [memories, setMemories] = useState(initialMemories)
  const [category, setCategory] = useState("All")
  const [search, setSearch] = useState("")
  const [saved, setSaved] = useState(true)
  const [history, setHistory] = useState(true)
  const [editing, setEditing] = useState<number | null>(null)
  const [editText, setEditText] = useState("")
  const [draft, setDraft] = useState("")
  const [forgotten, setForgotten] = useState<Memory | null>(null)
  const filtered = useMemo(
    () =>
      memories.filter(
        (item) =>
          (category === "All" || item.category === category) &&
          item.text.toLowerCase().includes(search.toLowerCase())
      ),
    [memories, category, search]
  )
  const update = (next: Memory[]) => {
    setMemories(next)
    onChange?.(next)
  }
  const add = () => {
    if (!draft.trim() || !saved) return
    update([
      ...memories,
      {
        id: Date.now(),
        text: draft.trim(),
        category: category === "All" ? "About you" : category,
        source: "由你添加 · 刚刚",
      },
    ])
    setDraft("")
  }
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Brain className="size-4 text-muted-foreground" />
            <CardTitle>记忆</CardTitle>
          </div>
          <Badge variant="secondary">{memories.length} 条记忆</Badge>
        </div>
        <CardDescription>查看、修改或删除助手记住的信息。</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <FieldGroup className="gap-4">
          <Field orientation="horizontal">
            <div className="flex flex-1 flex-col gap-1">
              <FieldLabel htmlFor="saved-memories">保存记忆</FieldLabel>
              <p className="text-xs text-muted-foreground">
                在不同对话之间保留有用的信息。
              </p>
            </div>
            <Switch
              id="saved-memories"
              checked={saved}
              onCheckedChange={setSaved}
            />
          </Field>
          <Field orientation="horizontal">
            <div className="flex flex-1 flex-col gap-1">
              <FieldLabel htmlFor="memory-history">参考聊天记录</FieldLabel>
              <p className="text-xs text-muted-foreground">
                结合之前的对话，提供更贴切的回答。
              </p>
            </div>
            <Switch
              id="memory-history"
              checked={history}
              onCheckedChange={setHistory}
            />
          </Field>
        </FieldGroup>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <ToggleGroup
            value={[category]}
            onValueChange={([value]) => value && setCategory(value)}
            className="flex-wrap justify-start"
          >
            {memoryCategories.map((item) => (
              <ToggleGroupItem key={item.value} value={item.value} size="sm">
                {item.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <InputGroup className="w-full sm:w-44">
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput
              aria-label="搜索记忆"
              placeholder="搜索记忆"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </InputGroup>
        </div>
        <div className="flex flex-col">
          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              没有找到符合条件的记忆。
            </p>
          )}
          {filtered.map((item) => (
            <div
              key={item.id}
              className="group flex items-start gap-3 border-b py-4 last:border-b-0"
            >
              <Brain className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                {editing === item.id ? (
                  <div className="flex gap-2">
                    <Input
                      aria-label="编辑记忆"
                      value={editText}
                      onChange={(event) => setEditText(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Escape") setEditing(null)
                        if (event.key === "Enter" && editText.trim()) {
                          update(
                            memories.map((row) =>
                              row.id === item.id
                                ? { ...row, text: editText.trim() }
                                : row
                            )
                          )
                          setEditing(null)
                        }
                      }}
                      autoFocus
                    />
                    <Button
                      size="icon-sm"
                      aria-label="保存记忆"
                      disabled={!editText.trim()}
                      onClick={() => {
                        update(
                          memories.map((row) =>
                            row.id === item.id
                              ? { ...row, text: editText.trim() }
                              : row
                          )
                        )
                        setEditing(null)
                      }}
                    >
                      <Check />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      aria-label="取消编辑"
                      onClick={() => setEditing(null)}
                    >
                      <X />
                    </Button>
                  </div>
                ) : (
                  <>
                    <p className="text-sm leading-6">{item.text}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.source}
                    </p>
                  </>
                )}
              </div>
              {editing !== item.id && (
                <div className="flex shrink-0 gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`编辑记忆: ${item.text}`}
                    onClick={() => {
                      setEditing(item.id)
                      setEditText(item.text)
                    }}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`删除记忆: ${item.text}`}
                    onClick={() => {
                      setForgotten(item)
                      update(memories.filter((row) => row.id !== item.id))
                    }}
                  >
                    <Trash2 />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
        {forgotten && (
          <div
            role="status"
            className="flex items-center justify-between gap-2 rounded-md bg-muted px-3 py-2 text-sm"
          >
            <span>已删除这条记忆</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                update([...memories, forgotten].sort((a, b) => a.id - b.id))
                setForgotten(null)
              }}
            >
              <Undo2 data-icon="inline-start" />
              撤销
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <form
          className="flex w-full gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            add()
          }}
        >
          <Input
            aria-label="新记忆"
            placeholder={
              saved ? "添加一件希望助手记住的事…" : "开启“保存记忆”后即可添加"
            }
            disabled={!saved}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
          <Button
            type="submit"
            variant="outline"
            size="icon"
            aria-label="添加记忆"
            disabled={!draft.trim() || !saved}
          >
            <Plus />
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
