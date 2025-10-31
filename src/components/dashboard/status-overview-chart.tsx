
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
        new?: number;
        pending_approval?: number;
        approved: number;
        ready?: number;
        closed?: number;
        re_opened?: number;
        rejected: number;
    };
}

const chartConfig = {
  New: { label: "New", color: "#3b82f6" },
  'Pending Approval': { label: "Pending Approval", color: "#f59e0b" },
  Approved: { label: "Approved", color: "#10b981" },
  Ready: { label: "Ready", color: "#84cc16" },
  Closed: { label: "Closed", color: "#6b7280" },
  'Re-opened': { label: "Re-opened", color: "#a855f7" },
  Rejected: { label: "Rejected", color: "#ef4444" },
};

export default function StatusOverviewChart({ data }: StatusOverviewChartProps) {
    if (!data) return null;

    const chartData = [
        { name: 'New', count: data.new ?? 0, fill: chartConfig.New.color },
        { name: 'Pending Approval', count: data.pending_approval ?? 0, fill: chartConfig['Pending Approval'].color },
        { name: 'Approved', count: data.approved, fill: chartConfig.Approved.color },
        { name: 'Ready', count: data.ready ?? 0, fill: chartConfig.Ready.color },
        { name: 'Closed', count: data.closed ?? 0, fill: chartConfig.Closed.color },
        { name: 'Re-opened', count: data.re_opened ?? 0, fill: chartConfig['Re-opened'].color },
        { name: 'Rejected', count: data.rejected, fill: chartConfig.Rejected.color },
    ].filter(d => d.count > 0);

    if (chartData.length === 0) {
      return <div className="flex h-[250px] items-center justify-center text-muted-foreground">No status data available</div>
    }

  return (
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square max-h-[250px]"
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
