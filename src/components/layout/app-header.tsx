'use client';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserNav } from './user-nav';

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
      </div>

      <div className="flex items-center gap-4 md:gap-2 lg:gap-4">
        <UserNav />
      </div>
    </header>
  );
}
