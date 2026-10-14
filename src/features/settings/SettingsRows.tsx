"use client";

import { useState, type ComponentType, type ReactNode } from "react";
import toast from "react-hot-toast";
import { Avatar, Money, ProgressBar } from "@/components/ui";
import { useSettings, useSettingsStore } from "@/store";
import { COOL_OFF_HOURS, LIMITS } from "@/constants";
import type { Account, UpdateSettings } from "@/types/settings";
import { cn, errorMessage } from "@/utils";
import { AccountNameForm, AddAccountForm, AddMoneyForm, BalanceForm, MoneyLockForm, SavingsGoalForm, TrustedContactForm } from "./SettingsForms";

type Variant = "mobile" | "desktop";
type EditorForm = ComponentType<{ variant: "bold" | "soft"; onClose: () => void }>;

const ACTION = "min-h-[44px] flex-none cursor-pointer border-none bg-transparent p-0 text-[14px] font-semibold";

/** "31 Oct", or "31 Oct 2027" outside this year. `deadline` is "YYYY-MM-DD", read as a calendar date. */
function formatDeadline(deadline: string) {
  const date = new Date(`${deadline}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return deadline;
  const sameYear = date.getUTCFullYear() === new Date().getFullYear();
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: sameYear ? undefined : "numeric", timeZone: "UTC" }).format(date);
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? (parts.at(-1)?.[0] ?? "") : "")).toUpperCase() || "?";
}

/** Edit state for one row, plus a confirmed remove that clears the field. */
function useEditor() {
  const [editing, setEditing] = useState(false);

  async function remove(body: UpdateSettings, question: string) {
    if (!window.confirm(question)) return;
    try {
      await useSettingsStore.getState().save(body);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  return { editing, open: () => setEditing(true), close: () => setEditing(false), remove };
}

type RowProps = {
  variant: Variant;
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  avatar?: string;
  /** Edit/Add/Change, then Remove when there's something to remove. Hidden while loading. */
  actions: ReactNode;
  editing: boolean;
  form: ReactNode;
};

function EditableRow({ variant, label, value, detail, avatar, actions, editing, form }: RowProps) {
  const mobile = variant === "mobile";
  return (
    <div className="flex flex-col border-b border-line">
      <div className={cn("flex items-center gap-[12px]", mobile ? "min-h-[60px] justify-between" : "min-h-[64px]")}>
        {avatar && <Avatar initials={avatar} size={40} className="flex-none bg-mint text-[14px]" />}
        <span className="flex min-w-0 flex-1 flex-col gap-[2px]">
          <span className="text-[13px] font-medium text-muted">{label}</span>
          <span className={cn("font-semibold break-words", mobile ? "text-[16px]" : "text-[15px]")}>{value}</span>
          {detail && <span className="text-[13px] font-medium text-muted">{detail}</span>}
        </span>
        {!editing && <span className="flex flex-none items-center gap-[16px]">{actions}</span>}
      </div>
      {editing && form}
    </div>
  );
}

type ActionsProps = { ready: boolean; editLabel: string; onEdit: () => void; onRemove?: () => void; className?: string };

function Actions({ ready, editLabel, onEdit, onRemove, className }: ActionsProps) {
  if (!ready) return null;
  return (
    <>
      <button type="button" onClick={onEdit} className={cn(ACTION, "text-teal", className)}>
        {editLabel}
      </button>
      {onRemove && (
        <button type="button" onClick={onRemove} className={cn(ACTION, "text-brick", className)}>
          Remove
        </button>
      )}
    </>
  );
}

type SimpleRowProps = { variant: Variant; label: string; value: ReactNode; Form: EditorForm; editLabel?: string };

function SimpleRow({ variant, label, value, Form, editLabel = "Edit" }: SimpleRowProps) {
  const { status } = useSettings();
  const editor = useEditor();
  const ready = status === "ready";
  return (
    <EditableRow
      variant={variant}
      label={label}
      value={ready ? value : "…"}
      actions={<Actions ready={ready} editLabel={editLabel} onEdit={editor.open} />}
      editing={editor.editing}
      form={<Form variant={variant === "mobile" ? "bold" : "soft"} onClose={editor.close} />}
    />
  );
}

/** An extra account: its name and balance, and Remove. The balance moves only by top-ups and transfers. */
function ExtraAccountRow({ variant, account }: { variant: Variant; account: Account }) {
  const { status } = useSettings();
  const editor = useEditor();
  const remove = () => void editor.remove({ removeAccountId: account.id }, `Remove ${account.name}? Its balance goes with it.`);
  return (
    <EditableRow
      variant={variant}
      label="Account"
      value={account.name}
      detail={<Money sgd={account.balanceSgd} />}
      actions={
        status === "ready" && (
          <button type="button" onClick={remove} className={cn(ACTION, "text-brick")}>
            Remove
          </button>
        )
      }
      editing={false}
      form={null}
    />
  );
}

/** The main account's name and balance, any extra accounts, and add account / add money, each with an inline editor. */
export function AccountRows({ variant }: { variant: Variant }) {
  const { settings } = useSettings();
  return (
    <>
      <SimpleRow variant={variant} label="Account name" value={settings.accountName} Form={AccountNameForm} />
      <SimpleRow variant={variant} label="Balance" value={<Money sgd={settings.balanceSgd} />} Form={BalanceForm} />
      {settings.accounts.map((a) => (
        <ExtraAccountRow key={a.id} variant={variant} account={a} />
      ))}
      {settings.accounts.length < LIMITS.ACCOUNTS && (
        <SimpleRow variant={variant} label="Another account" value="Savings, joint or any other" Form={AddAccountForm} editLabel="Add" />
      )}
      <SimpleRow variant={variant} label="Add money" value="Top up or pay salary" Form={AddMoneyForm} editLabel="Add" />
    </>
  );
}

export function TrustedContactRow({ variant }: { variant: Variant }) {
  const { settings, status } = useSettings();
  const editor = useEditor();
  const ready = status === "ready";
  const contact = ready ? settings.trustedContact : null;

  const row = (
    <EditableRow
      variant={variant}
      label="Trusted contact"
      value={!ready ? "…" : contact ? (contact.relation ? `${contact.name}, ${contact.relation}` : contact.name) : "Not set"}
      detail={contact?.phone}
      avatar={variant === "desktop" && contact ? initials(contact.name) : undefined}
      actions={
        <Actions
          ready={ready}
          editLabel={contact ? "Change" : "Add"}
          onEdit={editor.open}
          onRemove={contact ? () => void editor.remove({ trustedContact: null }, `Remove ${contact.name} as your trusted contact?`) : undefined}
        />
      }
      editing={editor.editing}
      form={<TrustedContactForm variant={variant === "mobile" ? "bold" : "soft"} onClose={editor.close} />}
    />
  );

  if (variant === "mobile") return row;
  return (
    <>
      {row}
      <p className="m-0 pt-[8px] text-[13px] leading-[1.45] font-medium text-muted">
        {contact
          ? `When Auntie warns about or blocks a payment, she logs an alert for ${contact.name}. A warned payment cools off for ${COOL_OFF_HOURS} hours before you can send it anyway.`
          : `Add someone you trust, and when Auntie warns about or blocks a payment she logs an alert for them. A warned payment cools off for ${COOL_OFF_HOURS} hours either way.`}
      </p>
    </>
  );
}

/** Money Lock on the main account: the amount locked, or Off. */
export function MoneyLockRow({ variant }: { variant: Variant }) {
  const { settings, status } = useSettings();
  const editor = useEditor();
  const ready = status === "ready";
  const locked = ready ? settings.lockedSgd : 0;
  return (
    <EditableRow
      variant={variant}
      label="Money Lock"
      value={!ready ? "…" : locked > 0 ? <><Money sgd={locked} /> locked</> : "Off"}
      detail={`Locked money in ${settings.accountName} can't be sent by transfer.`}
      actions={
        <Actions
          ready={ready}
          editLabel={locked > 0 ? "Change" : "Lock"}
          onEdit={editor.open}
          onRemove={locked > 0 ? () => void editor.remove({ lockedSgd: 0 }, "Unlock all your money? It can then be sent by transfer.") : undefined}
        />
      }
      editing={editor.editing}
      form={<MoneyLockForm variant={variant === "mobile" ? "bold" : "soft"} onClose={editor.close} />}
    />
  );
}

/** Mobile: a row. Desktop: the panel's header and body (the panel and "Your patterns" link stay in the layout). */
export function SavingsGoalRow({ variant }: { variant: Variant }) {
  const { settings, status } = useSettings();
  const editor = useEditor();
  const ready = status === "ready";
  const goal = ready ? settings.savingsGoal : null;
  const form = <SavingsGoalForm variant={variant === "mobile" ? "bold" : "soft"} onClose={editor.close} />;
  const actions = (
    <Actions
      ready={ready}
      className={variant === "desktop" ? "min-h-0 text-[13px]" : undefined}
      editLabel={goal ? "Edit" : "Add"}
      onEdit={editor.open}
      onRemove={goal ? () => void editor.remove({ savingsGoal: null }, "Remove your savings goal?") : undefined}
    />
  );

  if (variant === "mobile") {
    return (
      <EditableRow
        variant="mobile"
        label="Savings goal"
        value={
          !ready ? (
            "…"
          ) : goal ? (
            <>
              <Money sgd={goal.targetSgd} whole /> by {formatDeadline(goal.deadline)}
            </>
          ) : (
            "Not set"
          )
        }
        detail={
          goal && (
            <>
              <Money sgd={goal.savedSgd} whole /> saved so far
            </>
          )
        }
        actions={actions}
        editing={editor.editing}
        form={form}
      />
    );
  }

  const percent = goal ? Math.min(100, Math.round((goal.savedSgd / goal.targetSgd) * 100)) : 0;
  return (
    <>
      <div className="flex items-baseline justify-between">
        <h2 id="dgoal-h" className="m-0 font-display text-[17px] font-bold">
          Savings goal
        </h2>
        {!editor.editing && <span className="flex items-baseline gap-[16px]">{actions}</span>}
      </div>
      {editor.editing ? (
        form
      ) : !ready ? (
        <span className="font-display text-[26px] leading-none font-bold">…</span>
      ) : goal ? (
        <>
          <div className="flex items-baseline gap-[8px]">
            <span className="font-display text-[26px] leading-none font-bold">
              <Money sgd={goal.targetSgd} whole />
            </span>
            <span className="text-[13px] font-medium text-muted">by {formatDeadline(goal.deadline)}</span>
          </div>
          <ProgressBar value={percent} />
          <span className="text-[13px] font-medium text-muted">
            <Money sgd={goal.savedSgd} whole /> saved so far
          </span>
        </>
      ) : (
        <>
          <span className="text-[15px] font-semibold">Not set</span>
          <span className="text-[13px] font-medium text-muted">Add a target and a date, and Auntie will track how close you are.</span>
        </>
      )}
    </>
  );
}
