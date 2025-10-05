"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { DEPARTMENTS, REQUESTS } from "@/lib/data"

const departmentData = DEPARTMENTS.map(dept => {
    const allocations = REQUESTS.filter(r => {
        // In a real app, user data would be joined. 
        // For mock data, we can check if a user is associated with a department.
        // The previous check was `r.userId.includes('staff')` which is incorrect for a number.
        // We will just create some random data for now.
        return (r.status === 'Approved' || r.status === 'Completed')
    }).length + (Math.floor(Math.random() * 5));

    return {
        department: dept.name.split(" ")[0], // Use short name
        allocations,
    }
})


const chartConfig = {
  allocations: {
    label: "Allocations",
    color: "hsl(var(--primary))",
  },
}

export default function DepartmentAllocationsChart() {
  return (
      <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
        <BarChart accessibilityLayer data={departmentData}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="department"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value) => value.slice(0, 3)}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="allocations" fill="var(--color-allocations)" radius={4} />
        </BarChart>
      </ChartContainer>
  )
}
