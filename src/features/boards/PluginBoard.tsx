import { Fragment } from "react";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils";
import { BoardLabel } from "./BoardLabel";

const STEPS = [
  { step: "01 Bank", title: "Holds the payment", note: "POST /v1/preauth before release" },
  { step: "02 Auntified", title: "Scores and questions", note: "Rules plus model, chat if 70+", wash: true },
  { step: "03 Verdict", title: "pass, warn or block", note: "Bank releases or holds" },
];

const REQUEST = `{
  "event_id": "evt_8f21c0",
  "account": "acc_4417",
  "amount": { "value": 450000, "currency": "LKR" },
  "payee": {
    "id": "pn_8821",
    "name": "Kasun Perera",
    "added_at": "2026-10-11T23:46:10+05:30"
  },
  "reference": "Investment slot deposit",
  "initiated_at": "2026-10-11T23:52:04+05:30"
}`;

const RESPONSE = `{
  "event_id": "evt_8f21c0",
  "verdict": "block",
  "score": 86,
  "split": { "rules": 46, "model": 40 },
  "pattern": "investment_urgent_slot",
  "cool_down_until": "2026-10-12T23:52:04+05:30",
  "turns": 3
}`;

const PANES = [
  { caption: "Request", meta: "POST /v1/preauth", body: REQUEST },
  { caption: "Response", meta: "200 OK, under 800 ms", body: RESPONSE },
];

export function PluginBoard() {
  return (
    <div id="s16" className="flex flex-col gap-[10px]">
      <BoardLabel href={ROUTES.PLUGIN} num="16">
        Bank plug-in
      </BoardLabel>
      <div className="flex h-[620px] w-[1000px] flex-col gap-[22px] overflow-hidden rounded-[20px] border-[3px] border-ink bg-white p-[32px] shadow-hard-lg">
        <div className="flex items-baseline justify-between">
          <h1 className="m-0 font-display text-[26px] leading-[1.1] font-bold">Bank plug-in</h1>
          <span className="text-[13px] font-medium text-muted">Pre authorisation webhook, v1</span>
        </div>
        <ol className="m-0 grid list-none grid-cols-[1fr_32px_1fr_32px_1fr] items-center p-0">
          {STEPS.map((s, i) => (
            <Fragment key={s.step}>
              {i > 0 && <li aria-hidden="true" className="h-[2px] bg-sea"></li>}
              <li
                className={cn(
                  "flex flex-col gap-[4px] rounded-[20px] border-[2.5px] border-ink px-[16px] py-[14px] shadow-hard-sm",
                  s.wash && "bg-wash",
                )}
              >
                <span className="font-mono text-[12px] font-bold text-teal">{s.step}</span>
                <span className="text-[15px] font-semibold">{s.title}</span>
                <span className="text-[13px] font-medium text-muted">{s.note}</span>
              </li>
            </Fragment>
          ))}
        </ol>
        <div className="grid min-h-0 flex-1 grid-cols-[1fr_1fr] gap-[16px]">
          {PANES.map((p) => (
            <figure key={p.caption} className="m-0 flex min-h-0 flex-col gap-[8px]">
              <figcaption className="flex justify-between text-[13px] font-semibold">
                <span>{p.caption}</span>
                <span className="font-mono text-muted">{p.meta}</span>
              </figcaption>
              <pre className="m-0 flex-1 overflow-hidden rounded-[14px] bg-night px-[18px] py-[16px] font-mono text-[13px] leading-[1.6] font-medium text-code">
                {p.body}
              </pre>
            </figure>
          ))}
        </div>
        <span className="text-[13px] font-medium text-muted">
          On timeout the bank falls back to its own rules. Auntie never sees credentials.
        </span>
      </div>
    </div>
  );
}
