
"use client"

import { Line, LineChart, XAxis, YAxis, CartesianGrid } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { ChartConfig } from "@/components/ui/chart"

const chartConfig = {
  issues: {
    label: "Issues",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

interface MonthlyIssuesChartProps {
    data?: { label: string; count: number | string }[];
}

export default function MonthlyIssuesChart({ data }: MonthlyIssuesChartProps) {
    if (!data) return null;

    const chartData = data.map(month => ({
        month: month.label,
        issues: Number(month.count),
    }));

     if (chartData.length === 0) {
      return <div className="flex h-[300px] items-center justify-center text-muted-foreground">No monthly data available</div>
    }

  return (
      <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
        <LineChart accessibilityLayer data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid vertical={false} />
            <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
            />
            <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                allowDecimals={false}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
                dataKey="issues"
                type="monotone"
                stroke="var(--color-issues)"
                strokeWidth={2}
                dot={true}
            />
        </LineChart>
      </ChartContainer>
  )
}
