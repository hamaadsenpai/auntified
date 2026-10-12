import { cn } from "@/utils";

type IconProps = {
  size?: number;
  className?: string;
};

export function BackIcon({ size = 22, className }: IconProps) {
  return (
    <svg className={cn("text-teal", className)} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7"></path></svg>
  );
}

export function ChevronRightIcon({ size = 18, className }: IconProps) {
  return (
    <svg className={cn("text-teal", className)} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5l7 7-7 7"></path></svg>
  );
}

export function ChevronDownIcon({ size = 18, className }: IconProps) {
  return (
    <svg aria-hidden="true" className={cn("text-teal", className)} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 9l7 7 7-7"></path></svg>
  );
}

export function SearchIcon({ size = 18, className }: IconProps) {
  return (
    <svg aria-hidden="true" className={cn("text-muted", className)} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="6.5"></circle><path d="M16 16l4.5 4.5"></path></svg>
  );
}

export function CheckIcon({ size = 18, className }: IconProps) {
  return (
    <svg aria-hidden="true" className={cn("text-teal", className)} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"></path></svg>
  );
}

export function SettingsIcon({ size = 20, className }: IconProps) {
  return (
    <svg className={cn("text-teal", className)} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><circle cx="12" cy="12" r="8.5" strokeDasharray="3 2.4"></circle></svg>
  );
}

export function SendIcon({ size = 22, stroke = 2.2, className }: IconProps & { stroke?: number }) {
  return (
    <svg className={cn("text-white", className)} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"></path></svg>
  );
}

export function MicIcon({ size = 20, className }: IconProps) {
  return (
    <svg className={cn("text-teal", className)} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="3" width="6" height="11" rx="3"></rect><path d="M5 11a7 7 0 0 0 14 0M12 18v3"></path></svg>
  );
}

export function SpeakerIcon({ size = 20, className }: IconProps) {
  return (
    <svg className={cn("text-teal", className)} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"><path d="M4 9h4l5-4v14l-5-4H4z"></path><path d="M17 9a4 4 0 0 1 0 6"></path></svg>
  );
}

export function HomeIcon({ size = 20, className }: IconProps) {
  return (
    <svg className={cn("text-teal", className)} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10.5L12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z"></path></svg>
  );
}

export function SendMoneyIcon({ size = 20, className }: IconProps) {
  return (
    <svg className={cn("text-teal", className)} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 4L10 14"></path><path d="M20 4l-6 16-4-6-6-4z"></path></svg>
  );
}

export function HistoryIcon({ size = 20, className }: IconProps) {
  return (
    <svg className={cn("text-teal", className)} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3.5 12a8.5 8.5 0 1 0 2.5-6"></path><path d="M3.5 4v4h4"></path><path d="M12 8v4.5l3 2"></path></svg>
  );
}
