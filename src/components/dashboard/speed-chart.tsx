
"use client"

import { Pie, PieChart } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"

interface SpeedChartProps {
    data?: { connection_speed_name: string; count: number | string }[];
}

export default function SpeedChart({ data }: SpeedChartProps) {
    if (!data) return null;

    const chartData = data.map((speed, index) => {
        return { name: speed.connection_speed_name, count: Number(speed.count), fill: `hsl(var(--chart-${index + 1}))` };
    }).filter(d => d.count > 0);

    const chartConfig = {
        count: {
            label: "Count",
        },
        ...Object.fromEntries(chartData.map(d => [d.name.replace(/\s/g, ''), { label: d.name }]))
    };

    if (chartData.length === 0) {
      return <div className="flex h-[300px] items-center justify-center text-muted-foreground">No data available</div>
    }

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
          <ChartLegend content={<ChartLegendContent nameKey="name" />} />
        </PieChart>
      </ChartContainer>
  )
}
