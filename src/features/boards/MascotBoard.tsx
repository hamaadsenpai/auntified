import { AuntieBao, type AuntieBaoMood } from "@/components/mascot";

const MOODS: { mood: AuntieBaoMood; name: string; use: string }[] = [
  { mood: "meh", name: "Meh", use: "Default. Reading your spending." },
  { mood: "alarm", name: "Alarmed", use: "Scam checks and blocks." },
  { mood: "smug", name: "Smug", use: "You saved money. She knew." },
  { mood: "sleep", name: "Asleep", use: "Empty states, nothing to roast." },
];

export function MascotBoard() {
  return (
    <div
      id="m1"
      className="grid w-[1440px] grid-cols-[320px_repeat(4,1fr)] items-end gap-[24px] rounded-[28px] border-[3px] border-ink bg-sun px-[48px] py-[40px] shadow-hard-lg"
    >
      <div className="flex flex-col gap-[10px] self-center">
        <span className="self-start rounded-[5px] bg-ink px-[7px] py-[3px] font-mono text-[11px] font-semibold text-white">
          M1
        </span>
        <h2 className="m-0 font-display text-[40px] leading-[1.05] font-bold">Meet Auntie Kumari</h2>
        <p className="m-0 text-[16px] leading-[1.45] font-medium text-pretty">
          A very tired steamed bao with a hair bun and reading glasses. Deeply unbothered, until you try to send money
          to a stranger.
        </p>
      </div>
      {MOODS.map((m) => (
        <div key={m.mood} className="flex flex-col items-center gap-[12px] text-center">
          <AuntieBao mood={m.mood} width={150} height={140} />
          <span className="font-display text-[20px] font-bold">{m.name}</span>
          <span className="text-[14px] leading-[1.4] font-medium">{m.use}</span>
        </div>
      ))}
    </div>
  );
}
