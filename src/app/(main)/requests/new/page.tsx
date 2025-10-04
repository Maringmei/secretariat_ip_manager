import RequestForm from "@/components/request-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewRequestPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">New IP Address Request</CardTitle>
          <CardDescription>
            Please provide the following details for your device. Your profile information is automatically included.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <RequestForm />
        </CardContent>
      </Card>
    </div>
  );
}
