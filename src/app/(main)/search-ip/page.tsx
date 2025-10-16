
'use client';

import { useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { useToast } from '@/hooks/use-toast';
import type { Request } from '@/lib/types';
import { Loader2, Search as SearchIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import RequestsTable from '@/components/requests-table';
import { API_BASE_URL } from '@/lib/api';

export default function SearchIpPage() {
    const [ipAddress, setIpAddress] = useState('');
    const [requests, setRequests] = useState<Request[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const { token } = useAuth();
    const { toast } = useToast();

    const handleSearch = async () => {
        if (!token) {
            toast({ title: 'Error', description: 'Authentication token not found.', variant: 'destructive' });
            return;
        }
        if (!ipAddress.trim()) {
            toast({ title: 'Info', description: 'Please enter an IP address to search.', variant: 'default' });
            return;
        }

        setIsLoading(true);
        setHasSearched(true);
        setRequests([]);

        try {
            const response = await fetch(`${API_BASE_URL}/ip-requests?ip_address=${ipAddress.trim()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const result = await response.json();
            if (result.success && result.data.ip_requests) {
                const formattedRequests: Request[] = result.data.ip_requests.map((req: any) => ({
                    ...req,
                    id: parseInt(req.id, 10), // Ensure ID is a number
                    requestedAt: new Date(req.created_at),
                }));
                setRequests(formattedRequests);
            } else {
                setRequests([]);
                toast({
                    title: 'No Results',
                    description: result.message || 'No requests found for this IP address.',
                    variant: 'default',
                });
            }
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'An unexpected error occurred.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <h1 className="font-headline text-3xl font-bold">Search by IP Address</h1>
            <Card>
                <CardHeader>
                    <CardDescription>Enter an IP address to find the associated request details.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex w-full max-w-sm items-center space-x-2">
                        <div className="relative flex-1">
                            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                                type="text"
                                placeholder="e.g., 192.168.0.13"
                                className="pl-8"
                                value={ipAddress}
                                onChange={(e) => setIpAddress(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSearch();
                                    }
                                }}
                            />
                        </div>
                        <Button type="button" onClick={handleSearch} disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Search'}
                        </Button>
                    </div>

                    <div className="mt-6">
                        {isLoading ? (
                            <div className="flex justify-center items-center p-8">
                                <Loader2 className="h-8 w-8 animate-spin" />
                            </div>
                        ) : hasSearched ? (
                            <RequestsTable requests={requests} />
                        ) : (
                            <div className="flex justify-center items-center p-8 text-muted-foreground">
                                Search results will appear here.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
