import { notFound } from "next/navigation";
import { DemoDesktop, DemoProvider, DemoScreen } from "@/features/demo";
import { publicEnv } from "@/lib/env.client";

export default function Page() {
  if (!publicEnv.DEMO_MODE) notFound();
  return (
    <DemoProvider>
      <DemoDesktop />
      <DemoScreen />
    </DemoProvider>
  );
}
