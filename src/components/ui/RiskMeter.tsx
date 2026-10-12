import { cn } from "@/utils";

type RiskMeterProps = {
  score: number;
  height?: number;
  radius?: number;
  middle?: "lemon" | "white";
  /** Tailwind ring color class for the marker's 2px ring, e.g. "ring-white" | "ring-sun" | "ring-panel". */
  ring?: string;
  markerHeight?: number;
  className?: string;
};

const MIDDLE = {
  lemon: "bg-lemon shadow-[inset_0_0_0_1px_var(--color-lemon-edge)]",
  white: "bg-white shadow-[inset_0_0_0_1.5px_var(--color-night)]",
};

export function RiskMeter({
  score,
  height = 12,
  radius = 6,
  middle = "lemon",
  ring = "ring-white",
  markerHeight = 20,
  className,
}: RiskMeterProps) {
  return (
    <div
      role="meter"
      aria-label="Risk score"
      aria-valuenow={score}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("relative grid grid-cols-[40fr_30fr_31fr] gap-[3px]", className)}
      style={{ height }}
    >
      <span className="bg-mint" style={{ borderRadius: `${radius}px 2px 2px ${radius}px` }}></span>
      <span className={cn("rounded-[2px]", MIDDLE[middle])}></span>
      <span className="bg-teal" style={{ borderRadius: `2px ${radius}px ${radius}px 2px` }}></span>
      <span
        className={cn("absolute top-[-4px] ml-[-2px] w-[4px] rounded-[2px] bg-night ring-2", ring)}
        style={{ left: `${score}%`, height: markerHeight }}
      ></span>
    </div>
  );
}
