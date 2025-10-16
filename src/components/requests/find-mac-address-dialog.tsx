'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';

interface FindMacAddressDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FindMacAddressDialog({ isOpen, onClose }: FindMacAddressDialogProps) {

  const openLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>How to Find Your MAC Address</DialogTitle>
          <DialogDescription>
            Select your operating system below for instructions and a video guide.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Tabs defaultValue="windows">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="windows">Windows</TabsTrigger>
              <TabsTrigger value="macos">macOS</TabsTrigger>
            </TabsList>
            <TabsContent value="windows" className="mt-4">
              <div className="space-y-3">
                <h3 className="font-semibold">Instructions for Windows</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Click the Start button and search for "Command Prompt".</li>
                  <li>Open the Command Prompt application.</li>
                  <li>Type `ipconfig /all` and press Enter.</li>
                  <li>Look for "Physical Address". This is your MAC address.</li>
                </ol>
                <Button variant="secondary" asChild>
                  <Link href="https://www.youtube.com/watch?v=vher3Ls2POc" target="_blank" rel="noopener noreferrer">
                    Watch on YouTube
                  </Link>
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="macos" className="mt-4">
                <div className="space-y-3">
                    <h3 className="font-semibold">Instructions for macOS</h3>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                        <li>Go to System Settings {'>'} Network.</li>
                        <li>Select your active connection (Wi-Fi or Ethernet).</li>
                        <li>Click "Details", then go to the "Hardware" tab.</li>
                        <li>Your MAC address is listed as "Physical Address".</li>
                    </ol>
                    <Button variant="secondary" asChild>
                      <Link href="https://www.youtube.com/watch?v=gJw3DGuJVNk" target="_blank" rel="noopener noreferrer">
                        Watch on YouTube
                      </Link>
                    </Button>
                </div>
            </TabsContent>
          </Tabs>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
