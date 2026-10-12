import Link from "next/link";
import { ChevronRightIcon } from "@/components/icons";
import { AuntieBao } from "@/components/mascot";
import { Avatar, Money, ProgressBar, Select } from "@/components/ui";
import { ROUTES } from "@/constants";
import { CurrencyPicker } from "./CurrencyPicker";
import { LANGUAGES } from "./languages";

const PANEL = "flex flex-col rounded-[24px] border-[2.5px] border-ink px-[24px] py-[20px] shadow-hard-md";
const TONES = [
  { value: "roast", label: "Roast", hint: "Full honesty. She will mention the bubble tea.", mood: "meh", checked: true },
  { value: "gentle", label: "Gentle", hint: "Same advice, softer landing.", mood: "sleep", checked: false },
] as const;

export function SettingsDesktop() {
  return (
    <main className="hidden min-h-dvh min-w-0 flex-col gap-[24px] bg-white px-[40px] py-[32px] lg:flex">
      <header className="flex flex-col gap-[2px]">
        <span className="text-[13px] font-medium text-muted">How Auntie talks to you, and who she calls</span>
        <h1 className="m-0 font-display text-[30px] leading-[1.1] font-bold">Settings</h1>
      </header>
      <div className="grid grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] items-start gap-[24px]">
        <section aria-labelledby="dauntie-h" className={`${PANEL} gap-[20px]`}>
          <h2 id="dauntie-h" className="m-0 font-display text-[17px] font-bold">
            Auntie
          </h2>
          <fieldset className="m-0 flex flex-col gap-[8px] border-none p-0">
            <legend className="mb-[8px] p-0 text-[14px] font-semibold">Tone</legend>
            <div className="grid grid-cols-2 gap-[12px]">
              {TONES.map((t) => (
                <label
                  key={t.value}
                  className="flex cursor-pointer items-start gap-[12px] rounded-[16px] border-[1.5px] border-line-strong px-[16px] py-[14px] has-checked:border-2 has-checked:border-teal has-checked:bg-wash"
                >
                  <input type="radio" name="dtone" value={t.value} defaultChecked={t.checked} className="m-0 mt-[2px] h-[20px] w-[20px] flex-none accent-teal" />
                  <span className="flex flex-1 flex-col gap-[2px]">
                    <span className="text-[16px] font-semibold">{t.label}</span>
                    <span className="text-[13px] font-medium text-muted">{t.hint}</span>
                  </span>
                  <AuntieBao mood={t.mood} width={44} height={41} className="flex-none" />
                </label>
              ))}
            </div>
          </fieldset>
          <div className="grid grid-cols-2 gap-[16px]">
            <div className="flex flex-col gap-[8px]">
              <label htmlFor="dlang" className="text-[14px] font-semibold">
                Language
              </label>
              <Select id="dlang" variant="soft" defaultValue="Singlish">
                {LANGUAGES.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col gap-[8px]">
              <label htmlFor="dcurrency" className="text-[14px] font-semibold">
                Currency
              </label>
              <CurrencyPicker id="dcurrency" variant="soft" />
            </div>
          </div>
          <label className="flex min-h-[60px] cursor-pointer items-center justify-between gap-[12px] border-t border-line pt-[16px]">
            <span className="flex flex-col gap-[2px]">
              <span className="text-[16px] font-semibold">Voice replies</span>
              <span className="text-[13px] font-medium text-muted">She reads her answers aloud</span>
            </span>
            <input type="checkbox" role="switch" defaultChecked className="peer absolute h-[1px] w-[1px] overflow-hidden opacity-0" />
            <span className="flex h-[30px] w-[52px] flex-none items-center justify-start rounded-[15px] bg-line-strong p-[3px] peer-checked:justify-end peer-checked:bg-teal peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-teal">
              <span className="h-[24px] w-[24px] rounded-[12px] bg-white"></span>
            </span>
          </label>
        </section>
        <div className="flex flex-col gap-[24px]">
          <section aria-labelledby="dsafety-h" className={`${PANEL} gap-[4px]`}>
            <h2 id="dsafety-h" className="m-0 pb-[6px] font-display text-[17px] font-bold">
              Safety net
            </h2>
            <div className="flex min-h-[64px] items-center gap-[12px] border-b border-line">
              <Avatar initials="ML" size={40} className="flex-none bg-mint text-[14px]" />
              <span className="flex flex-1 flex-col gap-[2px]">
                <span className="text-[13px] font-medium text-muted">Trusted contact</span>
                <span className="text-[15px] font-semibold">Mei Lin, sister</span>
              </span>
              <Link href={ROUTES.PAY_BLOCKED} className="flex min-h-[44px] items-center text-[14px] font-semibold text-teal">
                Change
              </Link>
            </div>
            <p className="m-0 pt-[8px] text-[13px] leading-[1.45] font-medium text-muted">
              When Auntie blocks a payment, she can loop Mei Lin in before you override.
            </p>
          </section>
          <section aria-labelledby="dgoal-h" className={`${PANEL} gap-[10px]`}>
            <div className="flex items-baseline justify-between">
              <h2 id="dgoal-h" className="m-0 font-display text-[17px] font-bold">
                Savings goal
              </h2>
              <Link href={ROUTES.ROAST} className="text-[13px] font-semibold text-teal">
                Edit
              </Link>
            </div>
            <div className="flex items-baseline gap-[8px]">
              <span className="font-display text-[26px] leading-none font-bold"><Money sgd={1000} whole /></span>
              <span className="text-[13px] font-medium text-muted">by 31 Oct</span>
            </div>
            <ProgressBar value={64} />
            <span className="text-[13px] font-medium text-muted">On pace for <Money sgd={640} whole /></span>
            <Link
              href={ROUTES.PATTERNS}
              className="mt-[6px] flex min-h-[48px] items-center justify-between gap-[12px] border-t border-line text-[15px] font-semibold text-night no-underline"
            >
              Your patterns
              <ChevronRightIcon />
            </Link>
          </section>
        </div>
      </div>
    </main>
  );
}
