import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "../../components/ui/chart"

const data = [
  { day: "周一", runs: 8 },
  { day: "周二", runs: 11 },
  { day: "周三", runs: 5 },
  { day: "周四", runs: 14 },
  { day: "周五", runs: 12 },
  { day: "周六", runs: 3 },
  { day: "周日", runs: 6 },
]

const config = {
  runs: { label: "运行数", color: "var(--chart-2)" },
} satisfies ChartConfig

export default function ChartDemo() {
  return (
    <figure className="mx-auto w-full max-w-md rounded-xl border bg-card p-4">
      <figcaption className="mb-4 text-sm font-medium">
        本周 Agent 运行
      </figcaption>
      <ChartContainer config={config} className="h-48 w-full">
        <BarChart accessibilityLayer data={data}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={25}
            allowDecimals={false}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="runs" fill="var(--color-runs)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartContainer>
    </figure>
  )
}
