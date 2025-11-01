'use client';

import RequestForm from "@/components/request-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Request as RequestType } from "@/lib/types";
import { useAuth } from "@/components/auth/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/api";

export default function EditRequestPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const { toast } = useToast();
  const [request, setRequest] = useState<RequestType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id || !token) return;

    const fetchRequestDetails = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/ip-requests/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        if (result.success && result.data) {
          setRequest({ ...result.data, requestedAt: new Date(result.data.created_at) });
        } else {
          toast({ title: "Error", description: "Failed to load request details for editing.", variant: "destructive" });
          router.back();
        }
      } catch (error) {
        toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
        router.back();
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequestDetails();
  }, [id, token, toast, router]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
        </Button>
        <h1 className="font-headline text-3xl font-bold">Edit IP Address Request</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Request #{request?.request_number}</CardTitle>
          <CardDescription>
            Update the details for your request below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : request ? (
            <RequestForm isEditing={true} existingRequest={request} />
          ) : (
            <p>Could not load request data.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
