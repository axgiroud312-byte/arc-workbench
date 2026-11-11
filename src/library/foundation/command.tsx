import { useState } from "react"
import { FolderOpenIcon, ListTodoIcon, SettingsIcon } from "lucide-react"
import { CommandPalette } from "../../components/ui/command"

const actions = [
  {
    id: "files",
    label: "查看项目文件",
    keywords: ["打开", "files"],
    icon: <FolderOpenIcon />,
  },
  {
    id: "tasks",
    label: "查看任务列表",
    keywords: ["运行", "tasks"],
    icon: <ListTodoIcon />,
  },
  {
    id: "settings",
    label: "打开设置",
    keywords: ["偏好", "settings"],
    icon: <SettingsIcon />,
  },
]

export default function CommandDemo() {
  const [selected, setSelected] = useState("")
  return (
    <div className="flex flex-col items-center gap-3">
      <CommandPalette
        actions={actions}
        onSelect={(id) =>
          setSelected(actions.find((action) => action.id === id)?.label ?? "")
        }
      />
      <span role="status" className="text-xs text-muted-foreground">
        {selected ? "已选择 " + selected : "等待选择命令"}
      </span>
    </div>
  )
}
