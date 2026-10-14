import { Suspense } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { SessionGuard } from "@/features/auth/SessionGuard";
import { LogoutButton } from "@/features/settings/LogoutButton";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="lg:flex lg:h-dvh lg:overflow-hidden">
      <Sidebar footer={<LogoutButton className="min-h-[44px] rounded-[12px] px-[12px] text-left text-[15px]" />} />
      <div className="min-w-0 flex-1 lg:overflow-y-auto">
        <Suspense fallback={null}>
          <SessionGuard />
        </Suspense>
        {children}
      </div>
    </div>
  );
}
