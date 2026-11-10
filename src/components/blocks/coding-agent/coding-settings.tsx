import { useEffect, useId, useState } from "react"
import { ArrowLeft, Bot, MessageSquare, Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "../../theme-provider"
import { Button } from "../../ui/button"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "../../ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select"
import { Switch } from "../../ui/switch"
import { ToggleGroup, ToggleGroupItem } from "../../ui/toggle-group"
import type { SendMode } from "../ai-conversation/composer-input"
import { demoModels, getDemoModel } from "../ai-conversation/model-picker"
import { BrandMark } from "../shared"

export type CodingPreferences = {
  defaultModel: string
  sendMode: SendMode
  confirmEdits: boolean
  askScope: boolean
  expandDelegations: boolean
  inspectorOnLaunch?: boolean
}

const preferencesKey = "arc-coding-preferences"
const defaults: CodingPreferences = {
  defaultModel: "sonnet",
  sendMode: "enter",
  confirmEdits: true,
  askScope: true,
  expandDelegations: true,
  inspectorOnLaunch: true,
}
const modelItems = demoModels.map(({ id, name }) => ({
  value: id,
  label: name,
}))

function readPreferences(): CodingPreferences {
  try {
    const saved = JSON.parse(localStorage.getItem(preferencesKey) ?? "{}")
    return {
      defaultModel: getDemoModel(saved?.defaultModel).id,
      sendMode:
        saved?.sendMode === "modifier-enter" ? "modifier-enter" : "enter",
      confirmEdits:
        typeof saved?.confirmEdits === "boolean"
          ? saved.confirmEdits
          : defaults.confirmEdits,
      askScope:
        typeof saved?.askScope === "boolean"
          ? saved.askScope
          : defaults.askScope,
      expandDelegations:
        typeof saved?.expandDelegations === "boolean"
          ? saved.expandDelegations
          : defaults.expandDelegations,
      inspectorOnLaunch:
        typeof saved?.inspectorOnLaunch === "boolean"
          ? saved.inspectorOnLaunch
          : defaults.inspectorOnLaunch,
    }
  } catch {
    return defaults
  }
}

export function useCodingPreferences() {
  const [preferences, setPreferences] = useState(readPreferences)
  useEffect(() => {
    try {
      localStorage.setItem(preferencesKey, JSON.stringify(preferences))
    } catch {
      /* Preferences still apply for the current page. */
    }
  }, [preferences])
  return [preferences, setPreferences] as const
}

const categories = [
  { id: "conversation", label: "对话", icon: MessageSquare },
  { id: "agent", label: "Agent", icon: Bot },
  { id: "appearance", label: "外观与布局", icon: Monitor },
] as const

const themes = [
  { id: "system", label: "跟随系统", icon: Monitor },
  { id: "light", label: "浅色", icon: Sun },
  { id: "dark", label: "深色", icon: Moon },
] as const

export function CodingSettings({
  preferences,
  onChange,
  onBack,
}: {
  preferences: CodingPreferences
  onChange: (value: CodingPreferences) => void
  onBack?: () => void
}) {
  const [category, setCategory] =
    useState<(typeof categories)[number]["id"]>("conversation")
  const id = useId()
  const { theme, setTheme } = useTheme()
  const model = getDemoModel(preferences.defaultModel)
  const page = categories.find((item) => item.id === category)!

  return (
    <section
      className="coding-settings-screen grid h-full min-h-0 w-full"
      aria-label="编程面板设置"
    >
      <nav
        className="coding-settings-nav flex min-w-0 flex-col"
        aria-label="设置分类"
      >
        <header className="coding-rail-title flex items-center gap-2 px-4">
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              className="-ml-1.5"
              onClick={onBack}
            >
              <ArrowLeft data-icon="inline-start" />
              返回工作台
            </Button>
          )}
          <span
            className={
              onBack
                ? "ml-auto text-xs text-muted-foreground"
                : "text-sm font-medium"
            }
          >
            设置
          </span>
        </header>
        <div className="coding-settings-links flex gap-1 px-3 pb-3">
          {categories.map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              variant={category === id ? "secondary" : "ghost"}
              size="sm"
              className="justify-start"
              aria-current={category === id ? "page" : undefined}
              onClick={() => setCategory(id)}
            >
              <Icon data-icon="inline-start" />
              {label}
            </Button>
          ))}
        </div>
      </nav>
      <div className="coding-settings-scroll min-h-0 min-w-0 overflow-y-auto">
        <div className="coding-settings-content flex flex-col">
          <h2 className="text-2xl font-semibold tracking-tight">
            {page.label}
          </h2>
          {category === "conversation" && (
            <>
              <section
                aria-labelledby={id + "-model-title"}
                className="coding-settings-group"
              >
                <h3 id={id + "-model-title"}>模型</h3>
                <FieldGroup className="gap-0">
                  <Field
                    orientation="responsive"
                    className="coding-setting-row"
                  >
                    <FieldContent>
                      <FieldLabel htmlFor={id + "-model"}>
                        新对话默认模型
                      </FieldLabel>
                      <FieldDescription>
                        在输入框切换模型时，只影响当前对话。
                      </FieldDescription>
                    </FieldContent>
                    <Select
                      items={modelItems}
                      value={model.id}
                      onValueChange={(value) =>
                        value &&
                        onChange({ ...preferences, defaultModel: value })
                      }
                    >
                      <SelectTrigger id={id + "-model"} className="min-w-0">
                        <BrandMark brand={model.brand} />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent alignItemWithTrigger={false}>
                        <SelectGroup>
                          {demoModels.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              <BrandMark brand={item.brand} />
                              {item.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                </FieldGroup>
              </section>
              <section
                aria-labelledby={id + "-input-title"}
                className="coding-settings-group"
              >
                <h3 id={id + "-input-title"}>输入</h3>
                <FieldGroup className="gap-0">
                  <Field
                    orientation="responsive"
                    className="coding-setting-row"
                  >
                    <FieldContent>
                      <FieldTitle>发送快捷键</FieldTitle>
                      <FieldDescription>Shift + Enter 换行。</FieldDescription>
                    </FieldContent>
                    <ToggleGroup
                      value={[preferences.sendMode]}
                      onValueChange={([value]) => {
                        if (value === "enter" || value === "modifier-enter")
                          onChange({ ...preferences, sendMode: value })
                      }}
                      size="sm"
                      variant="outline"
                      aria-label="发送快捷键"
                    >
                      <ToggleGroupItem value="enter">Enter</ToggleGroupItem>
                      <ToggleGroupItem value="modifier-enter">
                        Ctrl / ⌘ + Enter
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </Field>
                </FieldGroup>
              </section>
            </>
          )}
          {category === "agent" && (
            <>
              <section
                aria-labelledby={id + "-run-title"}
                className="coding-settings-group"
              >
                <h3 id={id + "-run-title"}>执行规则</h3>
                <FieldGroup className="gap-0">
                  <Field
                    orientation="horizontal"
                    className="coding-setting-row"
                  >
                    <FieldContent>
                      <FieldLabel htmlFor={id + "-approval"}>
                        写入前需要审批
                      </FieldLabel>
                      <FieldDescription>
                        从下一轮起，应用改动前先让你查看差异。
                      </FieldDescription>
                    </FieldContent>
                    <Switch
                      id={id + "-approval"}
                      checked={preferences.confirmEdits}
                      onCheckedChange={(checked) =>
                        onChange({ ...preferences, confirmEdits: checked })
                      }
                    />
                  </Field>
                  <Field
                    orientation="horizontal"
                    className="coding-setting-row"
                  >
                    <FieldContent>
                      <FieldLabel htmlFor={id + "-scope"}>
                        先询问测试范围
                      </FieldLabel>
                      <FieldDescription>
                        从下一轮起生效。关闭后默认验证全部场景。
                      </FieldDescription>
                    </FieldContent>
                    <Switch
                      id={id + "-scope"}
                      checked={preferences.askScope}
                      onCheckedChange={(checked) =>
                        onChange({ ...preferences, askScope: checked })
                      }
                    />
                  </Field>
                </FieldGroup>
              </section>
              <section
                aria-labelledby={id + "-task-title"}
                className="coding-settings-group"
              >
                <h3 id={id + "-task-title"}>子 Agent</h3>
                <FieldGroup className="gap-0">
                  <Field
                    orientation="horizontal"
                    className="coding-setting-row"
                  >
                    <FieldContent>
                      <FieldLabel htmlFor={id + "-delegations"}>
                        默认展开新委派
                      </FieldLabel>
                    </FieldContent>
                    <Switch
                      id={id + "-delegations"}
                      checked={preferences.expandDelegations}
                      onCheckedChange={(checked) =>
                        onChange({ ...preferences, expandDelegations: checked })
                      }
                    />
                  </Field>
                </FieldGroup>
              </section>
            </>
          )}
          {category === "appearance" && (
            <>
              <section
                aria-labelledby={id + "-theme-title"}
                className="coding-settings-group"
              >
                <h3 id={id + "-theme-title"}>主题</h3>
                <ToggleGroup
                  value={[theme]}
                  onValueChange={([value]) => {
                    if (
                      value === "system" ||
                      value === "light" ||
                      value === "dark"
                    )
                      setTheme(value)
                  }}
                  variant="outline"
                  className="coding-theme-options grid w-full grid-cols-3"
                  aria-label="主题"
                >
                  {themes.map(({ id, label, icon: Icon }) => (
                    <ToggleGroupItem
                      key={id}
                      value={id}
                      className="h-auto min-w-0 flex-col gap-2 p-2"
                    >
                      <span
                        className="coding-theme-swatch"
                        data-theme-preview={id}
                        aria-hidden="true"
                      >
                        <span />
                        <span />
                        <span />
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Icon />
                        {label}
                      </span>
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </section>
              <section
                aria-labelledby={id + "-layout-title"}
                className="coding-settings-group"
              >
                <h3 id={id + "-layout-title"}>工作台布局</h3>
                <FieldGroup className="gap-0">
                  <Field
                    orientation="horizontal"
                    className="coding-setting-row"
                  >
                    <FieldContent>
                      <FieldLabel htmlFor={id + "-inspector"}>
                        打开工作台时显示右栏
                      </FieldLabel>
                      <FieldDescription>用于桌面宽度的布局。</FieldDescription>
                    </FieldContent>
                    <Switch
                      id={id + "-inspector"}
                      checked={preferences.inspectorOnLaunch ?? true}
                      onCheckedChange={(checked) =>
                        onChange({ ...preferences, inspectorOnLaunch: checked })
                      }
                    />
                  </Field>
                </FieldGroup>
              </section>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

export function CodingSettingsDemo() {
  const [preferences, setPreferences] = useCodingPreferences()
  return (
    <div className="coding-settings-preview h-[34rem] w-full max-w-4xl overflow-hidden rounded-xl border bg-background">
      <CodingSettings preferences={preferences} onChange={setPreferences} />
    </div>
  )
}
