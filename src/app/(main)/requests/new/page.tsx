'use client';

import RequestForm from "@/components/request-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NewRequestPage() {
  const router = useRouter();
  
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
        </Button>
        <h1 className="font-headline text-3xl font-bold">New IP Address Request</h1>
      </div>
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
