import { cn } from "@/utils";

type ProgressBarProps = {
  value: number;
  label?: string;
  className?: string;
  fillClassName?: string;
};

export function ProgressBar({ value, label = "Savings goal progress", className, fillClassName }: ProgressBarProps) {
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn("flex h-[10px] rounded-[5px] bg-track", className)}
    >
      <div className={cn("rounded-[5px] bg-sea", fillClassName)} style={{ width: `${value}%` }}></div>
    </div>
  );
}
