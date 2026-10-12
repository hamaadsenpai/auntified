import { Screen } from "@/components/layout";
import { RoastDesktop } from "@/features/roast/RoastDesktop";
import { RoastMobile } from "@/features/roast/RoastMobile";

export default function RoastPage() {
  return (
    <>
      <Screen className="lg:hidden">
        <RoastMobile />
      </Screen>
      <RoastDesktop />
    </>
  );
}
