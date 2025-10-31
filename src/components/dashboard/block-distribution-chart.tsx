
"use client"

import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { ChartConfig } from "../ui/chart"

const chartConfig = {
  requests: {
    label: "Requests",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

interface BlockDistributionChartProps {
    data?: { block_name: string; count: number | string }[];
}

export default function BlockDistributionChart({ data }: BlockDistributionChartProps) {
    if (!data) return null;

    const chartData = data.map(block => ({
        block: block.block_name,
        requests: Number(block.count),
    }));

    if (chartData.length === 0) {
      return <div className="flex h-[200px] items-center justify-center text-muted-foreground">No block data available</div>
    }

  return (
      <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
        <BarChart accessibilityLayer data={chartData} layout="vertical" margin={{ left: 20 }} barSize={20}>
          <CartesianGrid horizontal={false} />
          <YAxis
            dataKey="block"
            type="category"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value) => value.slice(0, 15)}
          />
          <XAxis dataKey="requests" type="number" hide />
          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
          <Bar dataKey="requests" fill="#98FB98" radius={4} />
        </BarChart>
      </ChartContainer>
  )
}
