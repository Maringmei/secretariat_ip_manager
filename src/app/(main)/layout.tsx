import AppLayout from "@/components/layout/app-layout";
import { CounterProvider } from "@/components/counter/counter-provider";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CounterProvider>
      <AppLayout>
        {children}
      </AppLayout>
    </CounterProvider>
  );
}
