import type { ComponentProps } from "react";
import { Input } from "@/components/ui";

type AuthFieldProps = {
  id: string;
  label: string;
  hint?: string;
} & Omit<ComponentProps<typeof Input>, "id" | "name">;

/** Label + input. No `name` on purpose: the demo form submits as GET and must not put values in the URL. */
export function AuthField({ id, label, hint, ...props }: AuthFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  return (
    <div className="flex flex-col gap-[8px]">
      <label htmlFor={id} className="text-[14px] font-semibold">
        {label}
      </label>
      <Input id={id} variant="soft" aria-describedby={hintId} {...props} />
      {hint && (
        <span id={hintId} className="text-[13px] font-medium text-muted">
          {hint}
        </span>
      )}
    </div>
  );
}
