
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
import { Apple, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

interface FindMacAddressDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

// Simple Windows logo SVG
const WindowsLogo = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="mr-2 h-4 w-4"
  >
    <path d="M11.025 4.5H4.5v6.525h6.525V4.5zM20 4.5h-7.05v6.525H20V4.5zM11.025 13.425H4.5V20h6.525v-6.575zM20 13.425h-7.05V20H20v-6.575z" />
  </svg>
);


export function FindMacAddressDialog({ isOpen, onClose }: FindMacAddressDialogProps) {
  const [isImageVisible, setIsImageVisible] = useState(false);

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
              <TabsTrigger value="windows">
                <WindowsLogo />
                Windows
              </TabsTrigger>
              <TabsTrigger value="macos">
                <Apple className="mr-2 h-4 w-4" />
                Apple(macOS)
              </TabsTrigger>
            </TabsList>
            <TabsContent value="windows" className="mt-4">
              <div className="space-y-3">
                <h3 className="font-semibold">Instructions for Windows</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Click the Start button and search for "Command Prompt".</li>
                  <li>Open the Command Prompt application.</li>
                  <li>Type `ipconfig /all` and press Enter.</li>
                  <li>Look for "Physical Address" in the Ethernet adapter Ethernet Section This is your MAC address.</li>
                </ol>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsImageVisible(!isImageVisible)}>
                        <ImageIcon className="mr-2"/>
                        {isImageVisible ? "Hide" : "Show"} Example Image
                    </Button>
                    <Button variant="secondary" asChild>
                        <Link href="https://www.youtube.com/watch?v=V_rs20osJ1c" target="_blank" rel="noopener noreferrer">
                            Watch on YouTube
                        </Link>
                    </Button>
                </div>
                {isImageVisible && (
                    <div className="mt-4 rounded-md border p-2">
                        <Image 
                            src="/images/ipconfig-all.jpg"
                            alt="Example of ipconfig /all command output"
                            width={200}
                            height={200}
                            className="rounded"
                        />
                    </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="macos" className="mt-4">
                <div className="space-y-3">
                    <h3 className="font-semibold">Instructions for Apple(macOS)</h3>
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
