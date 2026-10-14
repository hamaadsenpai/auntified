"use client";

import Link from "next/link";
import { useState } from "react";
import { AuntieBao } from "@/components/mascot";
import { Avatar, Button, Money, Tag } from "@/components/ui";
import { LIMITS, ROUTES } from "@/constants";
import { PayeeForm } from "@/features/payees/PayeeForm";
import { usePayees } from "@/store";
import { usePayDraftStore } from "@/store/pay-draft.store";
import { cn } from "@/utils";
import { AmountField } from "./AmountPad";
import { FromAccountSelect, useFromAccount } from "./FromAccountSelect";
import { addPayeeToDraft, initials, isNewPayee, transfersLabel, useSubmitDraft } from "./PayScreen";

const FIELD = "h-[52px] rounded-[14px] border-[1.5px] border-slate bg-white px-[14px] text-[16px] font-medium";

export function PayDesktop() {
  const { items, status, error, load } = usePayees();
  const from = useFromAccount();
  const { payeeId, amountSgd, reference } = usePayDraftStore();
  const [adding, setAdding] = useState(false);
  const draft = useSubmitDraft();
  const selected = items.find((p) => p.id === payeeId);
  // What Auntie can already see before the check runs; the rule flags come once the transfer exists.
  const facts = selected ? [isNewPayee(selected) && "New payee", selected.transferCount === 0 && "First transfer"].filter((f) => f !== false) : [];

  return (
    <main className="hidden min-h-full min-w-0 flex-1 grid-cols-[minmax(0,1fr)_520px] gap-[40px] bg-white px-[40px] py-[32px] lg:grid">
      {/* A div, not a form: the add-a-payee form sits inside and forms cannot nest. */}
      <div className="flex flex-col gap-[24px]">
        <h1 className="m-0 font-display text-[30px] leading-[1.1] font-bold">Send money</h1>
        <div className="flex flex-col gap-[8px]">
          <label htmlFor="damt" className="text-[14px] font-semibold">
            Amount
          </label>
          <AmountField id="damt" />
        </div>
        <div className="flex flex-col gap-[8px]">
          <label htmlFor="dfrom" className="text-[14px] font-semibold">
            From
          </label>
          <FromAccountSelect id="dfrom" />
        </div>
        <fieldset className="m-0 flex flex-col gap-[8px] border-none p-0">
          <legend className="mb-[8px] p-0 text-[14px] font-semibold">To</legend>
          {status === "error" ? (
            <div role="alert" className="flex items-center gap-[12px]">
              <p className="m-0 flex-1 text-[15px] font-semibold">{error}</p>
              <Button variant="secondary" className="h-[44px] px-[18px]" onClick={() => void load(true)}>
                Try again
              </Button>
            </div>
          ) : items.length === 0 ? (
            <p className="m-0 text-[14px] font-medium text-muted">
              {status === "ready" ? "No payees yet. Add a payee to send your first transfer." : "Loading…"}
            </p>
          ) : (
            items.map((p) => {
              const isSelected = p.id === payeeId;
              const isNew = isNewPayee(p);
              return (
                <label
                  key={p.id}
                  className={cn(
                    "flex min-h-[60px] cursor-pointer items-center gap-[12px] rounded-[14px] px-[14px] py-[8px]",
                    isSelected ? "border-2 border-teal bg-wash" : "border-[1.5px] border-line-strong",
                  )}
                >
                  <input
                    type="radio"
                    name="dpayee"
                    checked={isSelected}
                    onChange={() => usePayDraftStore.getState().setPayee(p.id)}
                    className="m-0 h-[20px] w-[20px] accent-teal"
                  />
                  <Avatar
                    initials={initials(p.name)}
                    size={40}
                    className={isSelected ? "bg-white text-[14px] text-teal" : "bg-mint text-[14px]"}
                  />
                  <span className="flex flex-1 flex-col">
                    <span className="text-[15px] font-semibold">{p.name}</span>
                    <span className="text-[13px] font-medium text-muted">{isNew ? p.account : transfersLabel(p.transferCount)}</span>
                  </span>
                  {isNew && <Tag variant="outline">New</Tag>}
                </label>
              );
            })
          )}
          {adding ? (
            <PayeeForm
              idPrefix="dpayee"
              submitLabel="Add payee"
              onSubmit={async (body) => {
                await addPayeeToDraft(body);
                setAdding(false);
              }}
              onCancel={() => setAdding(false)}
            />
          ) : (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="flex min-h-[44px] cursor-pointer items-center self-start border-none bg-none p-0 text-[14px] font-semibold text-teal"
            >
              Add a payee
            </button>
          )}
        </fieldset>
        <div className="flex flex-col gap-[8px]">
          <label htmlFor="dref" className="text-[14px] font-semibold">
            Reference
          </label>
          <input
            id="dref"
            type="text"
            maxLength={LIMITS.REFERENCE}
            placeholder="What it's for"
            value={reference}
            onChange={(e) => usePayDraftStore.getState().setReference(e.target.value)}
            className={FIELD}
          />
        </div>
      </div>
      <section aria-label="Review" className="flex flex-col gap-[18px] rounded-[24px] bg-wash p-[28px]">
        <h2 className="m-0 font-display text-[20px] font-bold">Review transfer</h2>
        <div className="flex flex-col gap-[4px]">
          <span className="text-[13px] font-medium text-muted">You are sending</span>
          <span className="font-display text-[52px] leading-none font-bold">
            <Money sgd={amountSgd} />
          </span>
        </div>
        {selected ? (
          <Link
            href={ROUTES.PAYEE(selected.id)}
            className="flex items-center gap-[12px] rounded-[18px] border border-line-strong bg-white px-[16px] py-[14px] text-night no-underline"
          >
            <Avatar initials={initials(selected.name)} size={44} className="flex-none bg-track text-[15px] text-teal" />
            <span className="flex flex-1 flex-col gap-[2px]">
              <span className="text-[16px] font-semibold">{selected.name}</span>
              <span className="text-[13px] font-medium text-muted">{selected.account}</span>
            </span>
            <span className="flex flex-col items-end gap-[3px]">
              {isNewPayee(selected) && (
                <Tag variant="outline" className="py-[4px]">
                  New payee
                </Tag>
              )}
              <span className="text-[12px] font-semibold">{transfersLabel(selected.transferCount)}</span>
            </span>
          </Link>
        ) : (
          <div className="flex items-center gap-[12px] rounded-[18px] border border-line-strong bg-white px-[16px] py-[14px]">
            <Avatar initials="?" size={44} className="flex-none bg-track text-[15px] text-teal" />
            <span className="text-[16px] font-semibold text-muted">Choose a payee</span>
          </div>
        )}
        <dl className="m-0 flex flex-col">
          <div className="flex justify-between gap-[12px] border-b border-line-strong py-[10px]">
            <dt className="text-[14px] font-medium text-muted">From</dt>
            <dd className="m-0 text-[14px] font-semibold">
              {from.name}, <Money sgd={from.balanceSgd} />
            </dd>
          </div>
          <div className="flex justify-between gap-[12px] border-b border-line-strong py-[10px]">
            <dt className="text-[14px] font-medium text-muted">Reference</dt>
            <dd className="m-0 text-[14px] font-semibold">{reference.trim() || "None"}</dd>
          </div>
        </dl>
        <div className="flex flex-col gap-[10px] rounded-[20px] border-[2.5px] border-ink bg-sun p-[16px]">
          <div className="flex items-center gap-[12px]">
            <AuntieBao mood="alarm" width={56} height={52} />
            <span className="font-display text-[18px] leading-[1.3] font-semibold">
              Auntie checks every new transfer before it goes.
            </span>
          </div>
          {facts.length > 0 && (
            <ul className="m-0 flex list-none flex-wrap gap-[6px] p-0">
              {facts.map((f) => (
                <li key={f} className="rounded-full bg-white px-[11px] py-[6px] text-[13px] font-semibold">
                  {f}
                </li>
              ))}
            </ul>
          )}
        </div>
        {draft.error && (
          <p role="alert" className="m-0 text-[14px] font-semibold text-brick">
            {draft.error}
          </p>
        )}
        <div className="mt-auto flex gap-[10px]">
          <button
            type="button"
            onClick={() => void draft.submit(ROUTES.PAY_CHECK)}
            disabled={draft.pending}
            className="flex h-[52px] flex-[1.4] cursor-pointer items-center justify-center rounded-[14px] border-none bg-teal text-[16px] font-semibold text-white disabled:cursor-default disabled:opacity-50"
          >
            {draft.pending ? "Creating transfer…" : "Continue to Auntie's check"}
          </button>
          <Button variant="secondary" className="flex-1 px-[6px] py-[1px]" onClick={draft.cancel}>
            Cancel
          </Button>
        </div>
      </section>
    </main>
  );
}
