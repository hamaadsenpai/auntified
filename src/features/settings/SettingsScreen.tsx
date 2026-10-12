import Link from "next/link";
import { ChevronRightIcon } from "@/components/icons";
import { BottomNav, Screen } from "@/components/layout";
import { Money, Select } from "@/components/ui";
import { ROUTES } from "@/constants";
import { CurrencyPicker } from "./CurrencyPicker";
import { LANGUAGES } from "./languages";

export function SettingsScreen() {
  return (
    <Screen className="lg:hidden">
      <header className="flex h-[64px] flex-none items-center px-[20px]">
        <h1 className="m-0 font-display text-[22px] leading-[1.1] font-bold">Settings</h1>
      </header>
      <main className="flex min-h-0 flex-1 flex-col gap-[20px] overflow-y-auto px-[20px] pb-[16px] *:shrink-0">
        <fieldset className="m-0 flex flex-col gap-[8px] border-none p-0">
          <legend className="mb-[8px] p-0 font-display text-[16px] font-bold">Auntie&apos;s tone</legend>
          <label className="flex min-h-[60px] cursor-pointer items-center gap-[12px] rounded-[16px] border-2 border-teal bg-wash px-[14px] py-[10px]">
            <input type="radio" name="tone" value="roast" defaultChecked className="m-0 h-[22px] w-[22px] flex-none accent-teal" />
            <span className="flex flex-col gap-[2px]">
              <span className="text-[16px] font-semibold">Roast</span>
              <span className="text-[13px] font-medium text-muted">Full honesty. She will mention the bubble tea.</span>
            </span>
          </label>
          <label className="flex min-h-[60px] cursor-pointer items-center gap-[12px] rounded-[16px] border-[1.5px] border-line-strong px-[14px] py-[10px]">
            <input type="radio" name="tone" value="gentle" className="m-0 h-[22px] w-[22px] flex-none accent-teal" />
            <span className="flex flex-col gap-[2px]">
              <span className="text-[16px] font-semibold">Gentle</span>
              <span className="text-[13px] font-medium text-muted">Same advice, softer landing.</span>
            </span>
          </label>
        </fieldset>
        <div className="flex flex-col gap-[8px]">
          <label htmlFor="lang" className="font-display text-[16px] font-bold">
            Language
          </label>
          <Select id="lang" defaultValue="Singlish">
            {LANGUAGES.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </Select>
        </div>
        <div className="flex flex-col gap-[8px]">
          <label htmlFor="currency" className="font-display text-[16px] font-bold">
            Currency
          </label>
          <CurrencyPicker id="currency" />
          <span className="text-[12px] font-medium text-muted">Demo amounts convert at fixed rates.</span>
        </div>
        <div className="flex flex-col border-t border-line">
          <div className="flex min-h-[60px] items-center justify-between gap-[12px] border-b border-line">
            <span id="voice-l" className="flex flex-col gap-[2px]">
              <span className="text-[16px] font-semibold">Voice replies</span>
              <span className="text-[13px] font-medium text-muted">She reads her answers aloud</span>
            </span>
            <button
              type="button"
              role="switch"
              aria-checked="true"
              aria-labelledby="voice-l"
              className="flex h-[44px] w-[52px] flex-none cursor-pointer items-center border-none bg-none p-0"
            >
              <span className="flex h-[30px] w-[52px] items-center justify-end rounded-[15px] bg-teal p-[3px]">
                <span className="h-[24px] w-[24px] rounded-[12px] bg-white"></span>
              </span>
            </button>
          </div>
          <Link
            href={ROUTES.PAY_BLOCKED}
            className="flex min-h-[60px] items-center justify-between gap-[12px] border-b border-line text-night no-underline"
          >
            <span className="flex flex-col gap-[2px]">
              <span className="text-[13px] font-medium text-muted">Trusted contact</span>
              <span className="text-[16px] font-semibold">Mei Lin, sister</span>
            </span>
            <span className="text-[14px] font-semibold text-teal">Change</span>
          </Link>
          <Link
            href={ROUTES.ROAST}
            className="flex min-h-[60px] items-center justify-between gap-[12px] border-b border-line text-night no-underline"
          >
            <span className="flex flex-col gap-[2px]">
              <span className="text-[13px] font-medium text-muted">Savings goal</span>
              <span className="text-[16px] font-semibold"><Money sgd={1000} whole /> by 31 Oct</span>
            </span>
            <span className="text-[14px] font-semibold text-teal">Edit</span>
          </Link>
          <Link
            href={ROUTES.PATTERNS}
            className="flex min-h-[60px] items-center justify-between gap-[12px] border-b border-line text-night no-underline"
          >
            <span className="text-[16px] font-semibold">Your patterns</span>
            <ChevronRightIcon />
          </Link>
        </div>
        <p className="m-0 text-[12px] leading-[1.45] font-medium text-muted">
          Auntified is an assistant, not financial advice. It runs on demo data with no bank connection.
        </p>
      </main>
      <BottomNav active="settings" />
    </Screen>
  );
}
