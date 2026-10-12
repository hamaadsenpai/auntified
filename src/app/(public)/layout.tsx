import { PublicFooter, PublicHeader } from "@/components/layout";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <PublicHeader />
      <div className="flex flex-1 flex-col">{children}</div>
      <PublicFooter />
    </div>
  );
}
