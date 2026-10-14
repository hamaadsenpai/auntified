import { Screen } from "@/components/layout";
import { AskDesktop } from "@/features/ask/AskDesktop";
import { AskMobile } from "@/features/ask/AskMobile";

export default function AskPage() {
  return (
    <>
      <Screen className="lg:hidden">
        <AskMobile />
      </Screen>
      <AskDesktop />
    </>
  );
}
