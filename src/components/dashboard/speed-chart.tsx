
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
        const hue = (index * 137.5) % 360; // Use golden angle for distinct colors
        return { 
            name: speed.connection_speed_name, 
            count: Number(speed.count), 
            fill: `hsl(${hue}, 70%, 50%)` 
        };
    }).filter(d => d.count > 0);

    const chartConfig = {
        count: {
            label: "Count",
        },
        ...Object.fromEntries(chartData.map(d => [d.name.replace(/\s/g, ''), { label: d.name, color: d.fill }]))
    };

    if (chartData.length === 0) {
      return <div className="flex h-[200px] items-center justify-center text-muted-foreground">No data available</div>
    }

  return (
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square max-h-[200px]"
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
            strokeWidth={5}
          />
          <ChartLegend content={<ChartLegendContent nameKey="name" />} />
        </PieChart>
      </ChartContainer>
  )
}
