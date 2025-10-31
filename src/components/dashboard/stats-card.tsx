
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  icon?: LucideIcon;
  description?: string;
}

export default function StatsCard({ title, value, icon: Icon, description }: StatsCardProps) {
  return (
    <Card className="relative overflow-hidden transition-transform duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg flex flex-col">
       <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-primary to-accent" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pl-3 pt-3">
        <CardTitle 
            className="font-semibold uppercase tracking-wider text-muted-foreground"
            style={{ fontSize: '0.65rem' }}
        >
            {title}
        </CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent className="flex-grow pl-3 pb-3 flex flex-col justify-center">
        <div className="text-3xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  );
}
