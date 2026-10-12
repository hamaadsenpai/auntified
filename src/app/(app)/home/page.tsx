import { Screen } from "@/components/layout";
import { HomeDesktop } from "@/features/home/HomeDesktop";
import { HomeMobile } from "@/features/home/HomeMobile";

export default function HomePage() {
  return (
    <>
      <Screen className="lg:hidden">
        <HomeMobile />
      </Screen>
      <HomeDesktop />
    </>
  );
}
