"use client"

import { Pie, PieChart } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { CONNECTION_SPEEDS, REQUESTS } from "@/lib/data"

const chartData = CONNECTION_SPEEDS.map((speed, index) => {
    const count = REQUESTS.filter(r => r.connectionSpeed === speed.id && (r.status === 'Approved' || r.status === 'Completed')).length;
    return { name: speed.name, count, fill: `hsl(var(--chart-${index + 1}))` };
}).filter(d => d.count > 0);

const chartConfig = {
    count: {
        label: "Count",
    },
    ...Object.fromEntries(chartData.map(d => [d.name.replace(/\s/g,''), {label: d.name}]))
};

export default function SpeedChart() {
  return (
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square max-h-[300px]"
      >
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Pie
            data={chartData}
            dataKey="count"
            nameKey="name"
            innerRadius={60}
          />
        </PieChart>
      </ChartContainer>
  )
}
