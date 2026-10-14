import { notFound } from "next/navigation";

// Internal design boards with made-up data: dev only.
export default function BoardsLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV === "production") notFound();
  return <div className="min-h-dvh overflow-x-auto p-[48px]">{children}</div>;
}
