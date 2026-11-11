import { Fragment, useState } from "react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../components/ui/breadcrumb"

export default function BreadcrumbDemo() {
  const [page, setPage] = useState(2)
  const levels = ["工作区", "项目", "运行记录"]
  return (
    <div className="mx-auto grid w-full max-w-sm gap-4 rounded-lg border bg-card p-4">
      <Breadcrumb aria-label="当前位置">
        <BreadcrumbList>
          {levels.slice(0, page).map((level, index) => (
            <Fragment key={level}>
              <BreadcrumbItem>
                <BreadcrumbLink
                  href={"#" + (index + 1)}
                  onClick={(event) => {
                    event.preventDefault()
                    setPage(index)
                  }}
                >
                  {level}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </Fragment>
          ))}
          <BreadcrumbItem>
            <BreadcrumbPage>{levels[page]}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <p className="text-sm font-medium" aria-live="polite">
        {levels[page]}
      </p>
      {page < levels.length - 1 && (
        <a
          href={"#" + (page + 2)}
          className="text-sm text-primary underline underline-offset-4"
          onClick={(event) => {
            event.preventDefault()
            setPage(page + 1)
          }}
        >
          进入{levels[page + 1]}
        </a>
      )}
    </div>
  )
}
