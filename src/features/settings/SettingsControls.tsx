"use client";

import { useState } from "react";
import { AuntieBao } from "@/components/mascot";
import { Select } from "@/components/ui";
import { useSettings, useSettingsStore } from "@/store";
import type { ApiFailure } from "@/types/api";
import type { UpdateSettings } from "@/types/settings";
import { cn } from "@/utils";
import { LANGUAGES } from "./languages";

type Variant = "mobile" | "desktop";

const TONES = [
  { value: "roast", label: "Roast", hint: "Full honesty. She will mention the bubble tea.", mood: "meh" },
  { value: "gentle", label: "Gentle", hint: "Same advice, softer landing.", mood: "sleep" },
] as const;

export function errorMessage(err: unknown) {
  return (err as ApiFailure["error"] | undefined)?.message ?? "Something went wrong. Try again.";
}

export function SaveError({ error, className }: { error: string | null; className?: string }) {
  if (!error) return null;
  return (
    <p role="alert" className={cn("m-0 text-[13px] font-semibold text-brick", className)}>
      {error}
    </p>
  );
}

/** Saves one change at a time and keeps the last failure to show next to the control. */
function useInstantSave() {
  const [error, setError] = useState<string | null>(null);
  function save(body: UpdateSettings) {
    setError(null);
    useSettingsStore
      .getState()
      .save(body)
      .catch((err: unknown) => setError(errorMessage(err)));
  }
  return { error, save };
}

/** Shown at the top of each layout when settings fail to load. */
export function SettingsLoadError() {
  const { status, error, load } = useSettings();
  if (status !== "error") return null;
  return (
    <div role="alert" className="flex items-center justify-between gap-[12px] rounded-[14px] border-[1.5px] border-brick px-[14px] py-[10px]">
      <span className="text-[14px] font-semibold text-brick">{error ?? "Couldn't load your settings."}</span>
      <button
        type="button"
        onClick={() => void load(true)}
        className="min-h-[44px] flex-none cursor-pointer border-none bg-transparent p-0 text-[14px] font-semibold text-teal"
      >
        Retry
      </button>
    </div>
  );
}

export function ToneOptions({ variant }: { variant: Variant }) {
  const { settings, status } = useSettings();
  const { error, save } = useInstantSave();
  const ready = status === "ready";

  if (variant === "mobile") {
    return (
      <fieldset disabled={!ready} className="m-0 flex flex-col gap-[8px] border-none p-0">
        <legend className="mb-[8px] p-0 font-display text-[16px] font-bold">Auntie&apos;s tone</legend>
        {TONES.map((t) => {
          const checked = ready && settings.tone === t.value;
          return (
            <label
              key={t.value}
              className={cn(
                "flex min-h-[60px] cursor-pointer items-center gap-[12px] rounded-[16px] px-[14px] py-[10px]",
                checked ? "border-2 border-teal bg-wash" : "border-[1.5px] border-line-strong",
              )}
            >
              <input
                type="radio"
                name="tone"
                value={t.value}
                checked={checked}
                onChange={() => save({ tone: t.value })}
                className="m-0 h-[22px] w-[22px] flex-none accent-teal"
              />
              <span className="flex flex-col gap-[2px]">
                <span className="text-[16px] font-semibold">{t.label}</span>
                <span className="text-[13px] font-medium text-muted">{t.hint}</span>
              </span>
            </label>
          );
        })}
        <SaveError error={error} />
      </fieldset>
    );
  }

  return (
    <fieldset disabled={!ready} className="m-0 flex flex-col gap-[8px] border-none p-0">
      <legend className="mb-[8px] p-0 text-[14px] font-semibold">Tone</legend>
      <div className="grid grid-cols-2 gap-[12px]">
        {TONES.map((t) => (
          <label
            key={t.value}
            className="flex cursor-pointer items-start gap-[12px] rounded-[16px] border-[1.5px] border-line-strong px-[16px] py-[14px] has-checked:border-2 has-checked:border-teal has-checked:bg-wash"
          >
            <input
              type="radio"
              name="dtone"
              value={t.value}
              checked={ready && settings.tone === t.value}
              onChange={() => save({ tone: t.value })}
              className="m-0 mt-[2px] h-[20px] w-[20px] flex-none accent-teal"
            />
            <span className="flex flex-1 flex-col gap-[2px]">
              <span className="text-[16px] font-semibold">{t.label}</span>
              <span className="text-[13px] font-medium text-muted">{t.hint}</span>
            </span>
            <AuntieBao mood={t.mood} width={44} height={41} className="flex-none" />
          </label>
        ))}
      </div>
      <SaveError error={error} />
    </fieldset>
  );
}

export function LanguageSelect({ variant }: { variant: Variant }) {
  const { settings, status } = useSettings();
  const { error, save } = useInstantSave();
  const ready = status === "ready";
  const id = variant === "mobile" ? "lang" : "dlang";

  return (
    <div className="flex flex-col gap-[8px]">
      <label htmlFor={id} className={variant === "mobile" ? "font-display text-[16px] font-bold" : "text-[14px] font-semibold"}>
        Language
      </label>
      <Select
        id={id}
        variant={variant === "mobile" ? "bold" : "soft"}
        disabled={!ready}
        value={ready ? settings.language : ""}
        onChange={(e) => save({ language: e.target.value })}
      >
        {!ready && <option value="">…</option>}
        {LANGUAGES.map((l) => (
          <option key={l}>{l}</option>
        ))}
      </Select>
      <SaveError error={error} />
    </div>
  );
}

export function VoiceSwitch({ variant }: { variant: Variant }) {
  const { settings, status } = useSettings();
  const { error, save } = useInstantSave();
  const ready = status === "ready";
  const on = ready && settings.voiceReplies;
  const toggle = () => save({ voiceReplies: !settings.voiceReplies });

  if (variant === "mobile") {
    return (
      <div className="flex flex-col border-b border-line">
        <div className="flex min-h-[60px] items-center justify-between gap-[12px]">
          <span id="voice-l" className="flex flex-col gap-[2px]">
            <span className="text-[16px] font-semibold">Voice replies</span>
            <span className="text-[13px] font-medium text-muted">She reads her answers aloud</span>
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={on}
            aria-labelledby="voice-l"
            disabled={!ready}
            onClick={toggle}
            className="flex h-[44px] w-[52px] flex-none cursor-pointer items-center border-none bg-none p-0 disabled:opacity-60"
          >
            <span className={cn("flex h-[30px] w-[52px] items-center rounded-[15px] p-[3px]", on ? "justify-end bg-teal" : "justify-start bg-line-strong")}>
              <span className="h-[24px] w-[24px] rounded-[12px] bg-white"></span>
            </span>
          </button>
        </div>
        <SaveError error={error} className="pb-[10px]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col border-t border-line pt-[16px]">
      <label className="flex min-h-[60px] cursor-pointer items-center justify-between gap-[12px]">
        <span className="flex flex-col gap-[2px]">
          <span className="text-[16px] font-semibold">Voice replies</span>
          <span className="text-[13px] font-medium text-muted">She reads her answers aloud</span>
        </span>
        <input
          type="checkbox"
          role="switch"
          aria-checked={on}
          checked={on}
          disabled={!ready}
          onChange={toggle}
          className="peer absolute h-[1px] w-[1px] overflow-hidden opacity-0"
        />
        <span className="flex h-[30px] w-[52px] flex-none items-center justify-start rounded-[15px] bg-line-strong p-[3px] peer-checked:justify-end peer-checked:bg-teal peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-teal peer-disabled:opacity-60">
          <span className="h-[24px] w-[24px] rounded-[12px] bg-white"></span>
        </span>
      </label>
      <SaveError error={error} />
    </div>
  );
}
