import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils";

type ButtonProps = {
  variant?: "primary" | "secondary";
  href?: string;
  className?: string;
  children: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

const VARIANTS = {
  primary: "border-ink bg-teal text-white shadow-hard-xs",
  secondary: "border-teal bg-white text-teal",
};

export function Button({ variant = "primary", href, className, children, ...props }: ButtonProps) {
  const base = cn("h-[52px] rounded-full border-[2.5px] text-[16px] font-semibold", VARIANTS[variant]);
  if (href !== undefined) {
    const linkClass = cn(base, "flex items-center justify-center no-underline", className);
    return href.startsWith("/") ? (
      <Link href={href} className={linkClass} onClick={props.onClick as React.MouseEventHandler<HTMLAnchorElement> | undefined}>
        {children}
      </Link>
    ) : (
      <a href={href} className={linkClass}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" {...props} className={cn(base, "cursor-pointer", className)}>
      {children}
    </button>
  );
}
