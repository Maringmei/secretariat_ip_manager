
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { EofficeIssueForm } from "@/components/e-office/issue-form";

export default function NewEofficeIssuePage() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };
  
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
        </Button>
        <h1 className="font-headline text-3xl font-bold">New E-Office Issue</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Create E-Office Issue</CardTitle>
          <CardDescription>
            Please fill out the form below to report a new issue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EofficeIssueForm />
        </CardContent>
      </Card>
    </div>
  );
}
