import { Sidebar } from "@/components/layout/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="lg:flex lg:h-dvh lg:overflow-hidden">
      <Sidebar />
      <div className="min-w-0 flex-1 lg:overflow-y-auto">{children}</div>
    </div>
  );
}
