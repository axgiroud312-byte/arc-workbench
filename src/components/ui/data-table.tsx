"use client"

import { useState } from "react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
  type TableOptions,
} from "@tanstack/react-table"
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"

import { Button } from "./button"
import { Input } from "./input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table"

export function DataTable<TData>({
  columns,
  data,
  pageSize = 10,
  searchPlaceholder = "筛选记录…",
  label = "数据表格",
}: {
  columns: TableOptions<TData>["columns"]
  data: TData[]
  pageSize?: number
  searchPlaceholder?: string
  label?: string
}) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  // TanStack Table returns mutable instances and manages its own memoization.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    initialState: { pagination: { pageSize } },
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <Input
        type="search"
        className="max-w-72"
        placeholder={searchPlaceholder}
        aria-label={searchPlaceholder}
        value={globalFilter}
        onChange={(event) => setGlobalFilter(event.target.value)}
      />
      <div className="rounded-lg border">
        <Table aria-label={label}>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {group.headers.map((header) => {
                  const sort = header.column.getIsSorted()
                  const headerContent = flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )
                  const Icon =
                    sort === "asc"
                      ? ArrowUpIcon
                      : sort === "desc"
                        ? ArrowDownIcon
                        : ArrowUpDownIcon
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      aria-sort={
                        sort === "asc"
                          ? "ascending"
                          : sort === "desc"
                            ? "descending"
                            : undefined
                      }
                    >
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="-ml-2"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {headerContent}
                          <Icon aria-hidden="true" />
                        </Button>
                      ) : (
                        headerContent
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {!table.getRowModel().rows.length && (
              <TableRow>
                <TableCell
                  className="h-20 text-center text-muted-foreground"
                  colSpan={table.getVisibleLeafColumns().length}
                >
                  没有匹配的记录。
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground" aria-live="polite">
          {table.getFilteredRowModel().rows.length} 条记录
        </span>
        <div className="flex items-center gap-2">
          <Button
            size="icon-sm"
            variant="outline"
            aria-label="上一页"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
          >
            <ChevronLeftIcon />
          </Button>
          <span className="text-xs tabular-nums">
            {table.getPageCount()
              ? table.getState().pagination.pageIndex + 1
              : 0}{" "}
            / {table.getPageCount()}
          </span>
          <Button
            size="icon-sm"
            variant="outline"
            aria-label="下一页"
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
          >
            <ChevronRightIcon />
          </Button>
        </div>
      </div>
    </div>
  )
}
