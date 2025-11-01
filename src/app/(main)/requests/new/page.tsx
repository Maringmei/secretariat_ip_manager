'use client';

import RequestForm from "@/components/request-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewRequestPage() {
  const router = useRouter();
  const [requestFor, setRequestFor] = useState<'self' | 'other' | null>(null);

  const handleBack = () => {
    if (requestFor) {
      setRequestFor(null);
    } else {
      router.back();
    }
  };
  
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
        </Button>
        <h1 className="font-headline text-3xl font-bold">New IP Address Request</h1>
      </div>
      <Card>
        <CardHeader>
        
          <CardDescription>
            {requestFor ? "Please provide the following details for your device. Your profile information is automatically included." : "Who is this IP request for?"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!requestFor ? (
             <div className="flex flex-col items-center justify-center gap-6 p-8">
                <p className="text-lg font-medium">Is this request for you or someone else?</p>
                <div className="flex gap-4">
                    <Button size="lg" onClick={() => setRequestFor('self')}>
                        <User className="mr-2" />
                        For Myself
                    </Button>
                    <Button size="lg" variant="secondary" onClick={() => setRequestFor('other')}>
                         <Users className="mr-2" />
                        For Other Employee
                    </Button>
                </div>
            </div>
          ) : (
            <RequestForm isForSelf={requestFor === 'self'} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
