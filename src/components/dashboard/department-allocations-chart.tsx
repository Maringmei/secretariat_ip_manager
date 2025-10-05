
"use client"

import { Bar, BarChart, XAxis, YAxis } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart"
import { ChartConfig } from "../ui/chart"

const chartConfig = {
  approved: {
    label: "Approved",
    color: "hsl(var(--chart-1))",
  },
  pending: {
    label: "Pending",
    color: "hsl(var(--chart-2))",
  },
   rejected: {
    label: "Rejected",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

interface DepartmentAllocationsChartProps {
    data?: { block_name: string; total: number; pending: number; approved: number; rejected: number; }[];
}

export default function DepartmentAllocationsChart({ data }: DepartmentAllocationsChartProps) {
    if (!data) return null;

    const chartData = data.map(dept => ({
        department: dept.block_name.split(" ")[0], // Use short name
        approved: dept.approved,
        pending: dept.pending,
        rejected: dept.rejected,
    }));

    if (chartData.length === 0) {
      return <div className="flex h-[300px] items-center justify-center text-muted-foreground">No allocation data available</div>
    }

  return (
      <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
        <BarChart accessibilityLayer data={chartData} layout="vertical" stackOffset="expand">
          <XAxis type="number" hide />
          <YAxis
            dataKey="department"
            type="category"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value) => value.slice(0, 10)}
            
          />
          <ChartTooltip content={<ChartTooltipContent hideLabel />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="approved" stackId="a" fill="var(--color-approved)" radius={0} />
          <Bar dataKey="pending" stackId="a" fill="var(--color-pending)" radius={0} />
          <Bar dataKey="rejected" stackId="a" fill="var(--color-rejected)" radius={4} />
        </BarChart>
      </ChartContainer>
  )
}
