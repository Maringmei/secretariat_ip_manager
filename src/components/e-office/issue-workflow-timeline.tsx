import type { WorkflowStep } from "@/lib/types";
import { CheckCircle, Circle, GitPullRequestArrow, Send } from "lucide-react";
import { Card, CardContent } from "../ui/card";

interface IssueWorkflowTimelineProps {
  workflow: WorkflowStep[];
}

const stepIcons: Record<string, React.ReactNode> = {
    'New': <Send className="h-5 w-5" />,
    'Assigned': <GitPullRequestArrow className="h-5 w-5" />,
    'Resolved': <CheckCircle className="h-5 w-5 text-green-600" />,
    'Closed': <CheckCircle className="h-5 w-5 text-green-600" />,
}

export default function IssueWorkflowTimeline({ workflow }: IssueWorkflowTimelineProps) {
  return (
    <div className="relative pl-6">
      {/* Timeline line */}
      <div className="absolute left-[34px] top-[10px] h-[calc(100%-20px)] w-0.5 bg-border -translate-x-1/2" />
      
      {workflow.map((step, index) => (
        <div key={index} className="relative flex items-start gap-4 pb-8">
            <div className="absolute left-[34px] top-1/2 -translate-x-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-primary" />
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                {stepIcons[step.step] || <Circle className="h-5 w-5" />}
            </div>
            <div className="flex-1 pt-2">
                <p className="font-semibold">{step.step}</p>
                <p className="text-sm text-muted-foreground">by {step.actor}</p>
                {step.remarks && (
                    <Card className="mt-2 bg-muted/50 text-sm">
                        <CardContent className="p-3">
                            <strong>Remarks:</strong> {step.remarks}
                        </CardContent>
                    </Card>
                )}
            </div>
            <div className="pt-2 text-right text-sm text-muted-foreground">
                <p>{new Date(step.timestamp).toLocaleDateString()}</p>
                <p>{new Date(step.timestamp).toLocaleTimeString()}</p>
            </div>
        </div>
      ))}
    </div>
  );
}
