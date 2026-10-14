import { Suspense } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { SessionGuard } from "@/features/auth/SessionGuard";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="lg:flex lg:h-dvh lg:overflow-hidden">
      <Sidebar />
      <div className="min-w-0 flex-1 lg:overflow-y-auto">
        <Suspense fallback={null}>
          <SessionGuard />
        </Suspense>
        {children}
      </div>
    </div>
  );
}
