"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartConfig = {
  allocations: {
    label: "Allocations",
    color: "hsl(var(--primary))",
  },
}

interface DepartmentAllocationsChartProps {
    data?: { block_name: string; total: number; }[];
}

export default function DepartmentAllocationsChart({ data }: DepartmentAllocationsChartProps) {
    if (!data) return null;

    const chartData = data.map(dept => ({
        department: dept.block_name.split(" ")[0], // Use short name
        allocations: dept.total,
    }));

  return (
      <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
        <BarChart accessibilityLayer data={chartData}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="department"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value) => value.slice(0, 10)}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="allocations" fill="var(--color-allocations)" radius={4} />
        </BarChart>
      </ChartContainer>
  )
}
