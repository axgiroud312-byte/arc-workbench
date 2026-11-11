import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "../../components/ui/data-table"

type Run = { name: string; status: string; duration: number }
const runs: Run[] = [
  { name: "检查组件", status: "通过", duration: 18 },
  { name: "更新文档", status: "通过", duration: 31 },
  { name: "审查改动", status: "失败", duration: 52 },
  { name: "对比模型", status: "通过", duration: 63 },
  { name: "生成报告", status: "运行中", duration: 8 },
  { name: "安装验证", status: "通过", duration: 26 },
]

const columns: ColumnDef<Run>[] = [
  { accessorKey: "name", header: "任务" },
  { accessorKey: "status", header: "状态" },
  {
    accessorKey: "duration",
    header: "用时",
    cell: ({ row }) => row.original.duration + " 秒",
  },
]

export default function DataTableDemo() {
  return (
    <div className="mx-auto max-w-lg rounded-xl border bg-card p-4">
      <DataTable
        label="运行记录"
        data={runs}
        columns={columns}
        pageSize={4}
        searchPlaceholder="搜索运行记录…"
      />
    </div>
  )
}
