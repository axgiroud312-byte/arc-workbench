import { useState } from "react"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../components/ui/pagination"

const runs = [
  ["组件状态检查", "安装演练", "主题验收"],
  ["菜单键盘操作", "侧栏手机布局", "表单校验"],
  ["发布组件", "生成安装文档", "更新预览"],
]

export default function PaginationDemo() {
  const [page, setPage] = useState(1)
  return (
    <div className="mx-auto grid max-w-sm gap-3 rounded-lg border bg-card p-4">
      <ul
        aria-label={"第 " + page + " 页运行记录"}
        className="divide-y text-sm"
      >
        {runs[page - 1].map((run) => (
          <li key={run} className="py-2">
            {run}
          </li>
        ))}
      </ul>
      <Pagination aria-label="运行记录分页">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#previous"
              text="上一页"
              aria-label="上一页"
              aria-disabled={page === 1}
              onClick={(event) => {
                event.preventDefault()
                setPage(Math.max(page - 1, 1))
              }}
            />
          </PaginationItem>
          {runs.map((_, index) => (
            <PaginationItem key={index}>
              <PaginationLink
                href={"#" + (index + 1)}
                isActive={page === index + 1}
                onClick={(event) => {
                  event.preventDefault()
                  setPage(index + 1)
                }}
              >
                {index + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              href="#next"
              text="下一页"
              aria-label="下一页"
              aria-disabled={page === runs.length}
              onClick={(event) => {
                event.preventDefault()
                setPage(Math.min(page + 1, runs.length))
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
