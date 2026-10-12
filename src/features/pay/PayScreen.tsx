import { ChevronRightIcon } from "@/components/icons";
import { BottomNav, Screen } from "@/components/layout";
import { Avatar, Button, Tag } from "@/components/ui";
import { ROUTES } from "@/constants";
import { AmountPad } from "./AmountPad";

const RECENT = [
  { initials: "SL", name: "Mum" },
  { initials: "JH", name: "Jia Hui" },
  { initials: "KT", name: "Kelvin", isNew: true },
  { initials: "RK", name: "Ravi" },
];

export function PayScreen() {
  return (
    <Screen className="lg:hidden">
      <header className="flex h-[64px] flex-none items-center px-[20px]">
        <h1 className="m-0 font-display text-[22px] leading-[1.1] font-bold">Send money</h1>
      </header>
      <main className="flex min-h-0 flex-1 flex-col gap-[14px] overflow-y-auto px-[20px] pb-[12px] *:shrink-0">
        <AmountPad>
        <button
          type="button"
          aria-haspopup="dialog"
          className="flex min-h-[64px] cursor-pointer items-center gap-[12px] rounded-[20px] border-[2.5px] border-ink bg-white px-[12px] py-[10px] text-left shadow-hard-sm"
        >
          <Avatar initials="KT" size={40} className="flex-none bg-track text-[14px] text-teal" />
          <span className="flex flex-1 flex-col gap-[2px]">
            <span className="text-[12px] font-medium text-muted">To</span>
            <span className="text-[16px] font-semibold">Kelvin Tan</span>
          </span>
          <Tag variant="outline" className="px-[8px]">
            New
          </Tag>
          <ChevronRightIcon />
        </button>
        <div className="flex flex-col gap-[8px]">
          <span className="text-[13px] font-semibold text-muted">Recent payees</span>
          <ul className="m-0 grid list-none grid-cols-4 gap-[8px] p-0">
            {RECENT.map((p) => (
              <li key={p.initials}>
                <button
                  type="button"
                  aria-pressed={p.isNew ? "true" : undefined}
                  className="flex min-h-[72px] w-full cursor-pointer flex-col items-center gap-[6px] border-none bg-none px-[6px] py-[1px]"
                >
                  <Avatar
                    initials={p.initials}
                    size={44}
                    className={
                      p.isNew
                        ? "bg-track text-[14px] text-teal shadow-[0_0_0_2px_white,0_0_0_4px_var(--color-teal)]"
                        : "bg-mint text-[14px]"
                    }
                  />
                  <span className="text-[13px] font-semibold">
                    {p.name}
                    {p.isNew && (
                      <>
                        {" "}
                        <span className="text-[10px] font-bold tracking-[.06em] uppercase">New</span>
                      </>
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        </AmountPad>
        <Button href={ROUTES.PAY_REVIEW}>Review transfer</Button>
      </main>
      <BottomNav active="pay" />
    </Screen>
  );
}
