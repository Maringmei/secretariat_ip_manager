
"use client"

import { Pie, PieChart } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"

interface StatusOverviewChartProps {
    data?: {
        pending: number;
        approved: number;
        rejected: number;
    };
}

const chartConfig = {
  Approved: {
    label: "Approved",
    color: "#10b981",
  },
  Rejected: {
    label: "Rejected",
    color: "#ef4444",
  },
  Pending: {
    label: "Pending",
    color: "#f59e0b",
  },
};

export default function StatusOverviewChart({ data }: StatusOverviewChartProps) {
    if (!data) return null;

    const chartData = [
        { name: 'Approved', count: data.approved, fill: chartConfig.Approved.color },
        { name: 'Rejected', count: data.rejected, fill: chartConfig.Rejected.color },
        { name: 'Pending', count: data.pending, fill: chartConfig.Pending.color },
    ].filter(d => d.count > 0);

    if (chartData.length === 0) {
      return <div className="flex h-[300px] items-center justify-center text-muted-foreground">No status data available</div>
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
            strokeWidth={5}
          />
          <ChartLegend
            content={<ChartLegendContent nameKey="name" />}
          />
        </PieChart>
      </ChartContainer>
  )
}
