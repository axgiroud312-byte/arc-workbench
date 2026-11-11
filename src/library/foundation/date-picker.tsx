import { useState } from "react"
import { DatePicker } from "../../components/ui/date-picker"

export default function DatePickerDemo() {
  const [date, setDate] = useState<Date>()
  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-sm font-medium">计划执行日期</p>
      <DatePicker value={date} onValueChange={setDate} />
    </div>
  )
}
