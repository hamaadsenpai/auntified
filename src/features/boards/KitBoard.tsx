import { AuntieBubble, Button, Card, Chip, Money, Tag } from "@/components/ui";
import { AuntieBao, type AuntieBaoMood } from "@/components/mascot";
import { ROUTES } from "@/constants/routes";
import { BoardLabel } from "./BoardLabel";

const SWATCHES = [
  { bg: "bg-teal", hex: "#287A74", use: "Buttons, links" },
  { bg: "bg-sea", hex: "#55A9A0", use: "Fills, bars" },
  { bg: "bg-mint", hex: "#AEEED3", use: "Her bubbles" },
  { bg: "bg-sun", hex: "#FFE070", use: "Nudge, warn" },
  { bg: "bg-cream", hex: "#FFF4DC", use: "Canvas, bao" },
  { bg: "bg-brick", hex: "#A6372B", use: "Blocks only" },
  { bg: "bg-ink", hex: "#2B1D14", use: "Outlines, shadow" },
  { bg: "bg-night", hex: "#0F2A28", use: "Text. Muted #3E5C59" },
];

const MOODS: { mood: AuntieBaoMood; name: string; use: string }[] = [
  { mood: "meh", name: "Meh", use: "Default, chat" },
  { mood: "alarm", name: "Alarmed", use: "Warn, block, check" },
  { mood: "smug", name: "Smug", use: "Savings, wins" },
  { mood: "sleep", name: "Asleep", use: "Logo, empty, idle" },
];

const TYPE_ROW = "grid grid-cols-[70px_1fr] items-baseline gap-[8px]";
const TYPE_LABEL = "font-mono text-[11px] font-semibold text-muted";

export function KitBoard() {
  return (
    <div id="s17" className="flex flex-col gap-[10px]">
      <BoardLabel href={ROUTES.KIT} num="17">
        UI kit
      </BoardLabel>
      <div className="flex w-[1000px] flex-col gap-[26px] overflow-hidden rounded-[24px] border-[3px] border-ink bg-white p-[32px] shadow-hard-lg">
        <div className="grid grid-cols-[repeat(8,1fr)] gap-[12px]">
          {SWATCHES.map((s) => (
            <div key={s.hex} className="flex flex-col gap-[6px]">
              <span className={`h-[56px] rounded-[14px] border-[2.5px] border-ink ${s.bg}`}></span>
              <span className="font-mono text-[12px] font-bold">{s.hex}</span>
              <span className="text-[12px] leading-[1.3] font-medium text-muted">{s.use}</span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-[340px_1fr] gap-[36px] border-t-2 border-dashed border-sand pt-[22px]">
          <div className="flex flex-col gap-[12px]">
            <div className={TYPE_ROW}>
              <span className={TYPE_LABEL}>Money 40</span>
              <span className="font-display text-[40px] leading-none font-bold"><Money sgd={2184.6} /></span>
            </div>
            <div className={TYPE_ROW}>
              <span className={TYPE_LABEL}>Head 26</span>
              <span className="font-display text-[26px] leading-[1.1] font-bold">Payment stopped</span>
            </div>
            <div className={TYPE_ROW}>
              <span className={TYPE_LABEL}>Title 19</span>
              <span className="font-display text-[19px] leading-[1.1] font-bold">Weekly roast</span>
            </div>
            <div className={TYPE_ROW}>
              <span className={TYPE_LABEL}>Voice 16</span>
              <span className="font-display text-[16px] leading-[1.4] font-medium">Pandan trees, is it?</span>
            </div>
            <div className={TYPE_ROW}>
              <span className={TYPE_LABEL}>UI 16</span>
              <span className="text-[16px] font-bold">Continue to Auntie&apos;s check</span>
            </div>
            <div className={TYPE_ROW}>
              <span className={TYPE_LABEL}>Label 13</span>
              <span className="text-[13px] font-medium text-muted">Available balance</span>
            </div>
            <span className="text-[12px] leading-[1.45] font-medium text-pretty text-muted">
              Fredoka for her voice, headings and money. Nunito for UI. Everything gets a 2.5px ink outline and a solid
              offset shadow, no blur.
            </span>
          </div>
          <div className="flex flex-col gap-[22px]">
            <div className="grid grid-cols-[repeat(4,1fr)] gap-[12px]">
              {MOODS.map((m) => (
                <div
                  key={m.mood}
                  className="flex flex-col items-center gap-[6px] rounded-[18px] border-[2.5px] border-ink bg-cream px-[8px] py-[12px] text-center"
                >
                  <AuntieBao mood={m.mood} width={76} height={71} />
                  <span className="font-display text-[15px] font-bold">{m.name}</span>
                  <span className="text-[12px] font-medium text-muted">{m.use}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-[1fr_1fr_1fr] content-start gap-x-[20px] gap-y-[18px]">
              <div className="flex flex-col gap-[12px]">
                <Button className="px-[6px] py-[1px] font-bold">Primary</Button>
                <Button variant="secondary" className="px-[6px] py-[1px] font-bold">
                  Secondary
                </Button>
                <div className="flex flex-wrap items-center gap-[6px]">
                  <Chip className="font-bold">Chip</Chip>
                  <Tag variant="blocked">Blocked</Tag>
                </div>
              </div>
              <div className="flex items-start gap-[8px]">
                <AuntieBao mood="meh" width={44} height={41} />
                <div className="flex flex-col gap-[5px]">
                  <span className="text-[13px] font-bold text-teal">Auntie Kumari</span>
                  <AuntieBubble className="py-[11px]"><Money sgd={83.5} /> on drinks and delivery. Explain.</AuntieBubble>
                </div>
              </div>
              <div className="flex flex-col gap-[12px]">
                <Card className="flex flex-col gap-[2px] px-[12px] py-[10px]">
                  <span className="text-[12px] font-medium text-muted">Saved with Auntie</span>
                  <span className="font-display text-[22px] leading-[1.1] font-bold"><Money sgd={412} whole /></span>
                </Card>
                <div className="flex flex-col gap-[2px] rounded-[16px] border-[2.5px] border-ink bg-sun px-[12px] py-[10px]">
                  <span className="text-[11px] font-extrabold tracking-[.06em] uppercase">One nudge</span>
                  <span className="font-display text-[14px] leading-[1.35] font-medium"><Money sgd={75} whole /> back this month.</span>
                </div>
              </div>
              <div className="col-span-full flex flex-col gap-[6px]">
                <div className="flex items-baseline justify-between">
                  <span className="font-display text-[14px] font-bold">Risk meter</span>
                  <span className="text-[12px] font-medium text-muted">Score 78 = rules 46 + model 32</span>
                </div>
                <div
                  role="meter"
                  aria-label="Risk score"
                  aria-valuenow={78}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  className="relative grid h-[14px] grid-cols-[40fr_30fr_31fr] gap-[3px]"
                >
                  <span className="rounded-[7px_2px_2px_7px] border-2 border-ink bg-mint"></span>
                  <span className="rounded-[2px] border-2 border-ink bg-sun"></span>
                  <span className="rounded-[2px_7px_7px_2px] border-2 border-ink bg-teal"></span>
                  <span className="absolute top-[-5px] left-[78%] ml-[-2px] h-[24px] w-[5px] rounded-[3px] bg-ink ring-2 ring-white"></span>
                </div>
                <div className="grid grid-cols-[40fr_30fr_31fr] gap-[3px] text-[11px] font-semibold text-muted">
                  <span>Pass 0-39</span>
                  <span>Warn 40-69, typed confirm</span>
                  <span className="text-night">Block 70+, questions then verdict</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
