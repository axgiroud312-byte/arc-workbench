import { useState } from "react"
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "../../components/ui/menubar"

export default function MenubarDemo() {
  const [label, setLabel] = useState("项目预览")
  return (
    <div className="mx-auto w-full max-w-sm overflow-hidden rounded-lg border bg-card">
      <Menubar aria-label="项目菜单" className="rounded-none border-0 border-b">
        <MenubarMenu>
          <MenubarTrigger>文件</MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={() => setLabel("已新建草稿")}>
              新建草稿
            </MenubarItem>
            <MenubarItem onClick={() => setLabel("草稿已保存")}>
              保存草稿
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>视图</MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={() => setLabel("编辑器视图")}>
              编辑器
            </MenubarItem>
            <MenubarItem onClick={() => setLabel("预览视图")}>预览</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
      <p className="p-4 text-sm" role="status">
        {label}
      </p>
    </div>
  )
}
