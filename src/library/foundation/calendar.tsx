import { useState } from "react"
import type { DateRange } from "react-day-picker"
import { zhCN } from "react-day-picker/locale"
import { Calendar } from "../../components/ui/calendar"

const formatter = new Intl.DateTimeFormat("zh-CN", {
  month: "short",
  day: "numeric",
})

export default function CalendarDemo() {
  const [range, setRange] = useState<DateRange>()
  return (
    <div className="flex flex-col items-center gap-3">
      <Calendar
        mode="range"
        locale={zhCN}
        selected={range}
        onSelect={setRange}
        className="rounded-lg border bg-card"
      />
      <span role="status" className="text-xs text-muted-foreground">
        {range?.from && range.to
          ? formatter.formatRange(range.from, range.to)
          : "选择开始日期与结束日期"}
      </span>
    </div>
  )
}
