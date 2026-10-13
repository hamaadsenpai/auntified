"use client";

import { useState, type ComponentType, type ReactNode } from "react";
import { Avatar, Money, ProgressBar } from "@/components/ui";
import { useSettings, useSettingsStore } from "@/store";
import type { UpdateSettings } from "@/types/settings";
import { cn } from "@/utils";
import { errorMessage, SaveError } from "./SettingsControls";
import { AccountNameForm, BalanceForm, SavingsGoalForm, TrustedContactForm } from "./SettingsForms";

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
  const [error, setError] = useState<string | null>(null);

  async function remove(body: UpdateSettings, question: string) {
    if (!window.confirm(question)) return;
    setError(null);
    try {
      await useSettingsStore.getState().save(body);
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  function open() {
    setError(null);
    setEditing(true);
  }

  return { editing, open, close: () => setEditing(false), error, remove };
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
  error: string | null;
};

function EditableRow({ variant, label, value, detail, avatar, actions, editing, form, error }: RowProps) {
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
      <SaveError error={error} className="pb-[10px]" />
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

function SimpleRow({ variant, label, value, Form }: { variant: Variant; label: string; value: ReactNode; Form: EditorForm }) {
  const { status } = useSettings();
  const editor = useEditor();
  const ready = status === "ready";
  return (
    <EditableRow
      variant={variant}
      label={label}
      value={ready ? value : "…"}
      actions={<Actions ready={ready} editLabel="Edit" onEdit={editor.open} />}
      editing={editor.editing}
      form={<Form variant={variant === "mobile" ? "bold" : "soft"} onClose={editor.close} />}
      error={editor.error}
    />
  );
}

/** Account name and balance, each with an inline editor. */
export function AccountRows({ variant }: { variant: Variant }) {
  const { settings } = useSettings();
  return (
    <>
      <SimpleRow variant={variant} label="Account name" value={settings.accountName} Form={AccountNameForm} />
      <SimpleRow variant={variant} label="Balance" value={<Money sgd={settings.balanceSgd} />} Form={BalanceForm} />
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
      error={editor.error}
    />
  );

  if (variant === "mobile") return row;
  return (
    <>
      {row}
      <p className="m-0 pt-[8px] text-[13px] leading-[1.45] font-medium text-muted">
        {contact
          ? `When Auntie blocks a payment, she can loop ${contact.name} in before you override.`
          : "Add someone you trust, and when Auntie blocks a payment she can loop them in before you override."}
      </p>
    </>
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
        error={editor.error}
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
      <SaveError error={editor.error} />
    </>
  );
}
