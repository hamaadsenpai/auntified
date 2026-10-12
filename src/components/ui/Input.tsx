import type { InputHTMLAttributes } from "react";
import { cn } from "@/utils";
import { FIELD_BASE, FIELD_VARIANTS, type SelectVariant } from "./Select";

type InputProps = {
  variant?: SelectVariant;
} & InputHTMLAttributes<HTMLInputElement>;

/** A text-like <input> with the same look as Select. */
export function Input({ variant = "bold", className, type = "text", ...props }: InputProps) {
  return <input type={type} {...props} className={cn(FIELD_BASE, FIELD_VARIANTS[variant], "cursor-text px-[14px]", className)} />;
}
