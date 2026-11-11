"use client"

import { CalendarDaysIcon } from "lucide-react"
import { useState } from "react"
import { zhCN } from "react-day-picker/locale"

import { Button } from "./button"
import { Calendar } from "./calendar"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"

export function DatePicker({
  value,
  onValueChange,
  placeholder = "选择日期",
  min,
  max,
  disabled,
  className,
}: {
  value?: Date
  onValueChange: (date: Date) => void
  placeholder?: string
  min?: Date
  max?: Date
  disabled?: boolean
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const format = new Intl.DateTimeFormat("zh-CN", { dateStyle: "long" })
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button variant="outline" disabled={disabled} className={className} />
        }
      >
        <CalendarDaysIcon />
        {value ? format.format(value) : placeholder}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          required
          locale={zhCN}
          selected={value}
          defaultMonth={value}
          disabled={[
            ...(min ? [{ before: min }] : []),
            ...(max ? [{ after: max }] : []),
          ]}
          onSelect={(date) => {
            onValueChange(date)
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
