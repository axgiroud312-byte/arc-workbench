import { useState } from "react"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "../../components/ui/navigation-menu"

const navigation = [
  { title: "文档", links: ["安装指南", "主题样式"] },
  { title: "工作区", links: ["项目列表", "运行记录"] },
]

export default function NavigationMenuDemo() {
  const [page, setPage] = useState("安装指南")
  return (
    <div className="mx-auto w-full max-w-sm rounded-lg border bg-card">
      <NavigationMenu
        aria-label="工作台导航"
        className="max-w-none justify-start border-b px-2 py-1"
      >
        <NavigationMenuList>
          {navigation.map(({ title, links }, group) => (
            <NavigationMenuItem key={title}>
              <NavigationMenuTrigger>{title}</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-40 gap-0.5 p-1">
                  {links.map((link, index) => (
                    <li key={link}>
                      <NavigationMenuLink
                        href={"#" + group + "-" + index}
                        active={page === link}
                        onClick={(event) => {
                          event.preventDefault()
                          setPage(link)
                        }}
                      >
                        {link}
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
      <p className="p-4 text-sm" role="status">
        {page}
      </p>
    </div>
  )
}
