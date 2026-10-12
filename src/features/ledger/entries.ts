import type { TagVariant } from "@/components/ui";
import { ROUTES } from "@/constants";

export const FILTERS = ["Payments", "Roasts", "Blocks"];

export const ENTRIES: {
  date: string;
  time: string;
  title: string;
  amount: number;
  suffix?: string;
  score?: string;
  tag: TagVariant;
  label: string;
  href?: string;
}[] = [
  { date: "11 Oct", time: "23:52", title: "Kelvin Tan", amount: 1850, score: "86", tag: "blocked", label: "Blocked", href: ROUTES.PAYEE("kelvin-tan") },
  { date: "11 Oct", time: "23:48", title: "Kelvin Tan", amount: 50, score: "58", tag: "outline", label: "Cancelled", href: ROUTES.PAYEE("kelvin-tan") },
  { date: "11 Oct", time: "20:00", title: "Weekly roast", amount: 102.48, suffix: " leaked", tag: "roast", label: "Roast", href: ROUTES.ROAST },
  { date: "9 Oct", time: "23:40", title: "Jia Hui Lim", amount: 480, score: "54", tag: "outline", label: "Overridden" },
  { date: "7 Oct", time: "09:12", title: "Mum", amount: 300, score: "8", tag: "passed", label: "Passed" },
  { date: "4 Oct", time: "20:00", title: "Weekly roast", amount: 88.1, suffix: " leaked", tag: "roast", label: "Roast" },
  { date: "28 Sep", time: "21:15", title: "Parcel fee link", amount: 2.99, score: "81", tag: "blocked", label: "Blocked" },
  { date: "27 Sep", time: "20:00", title: "Weekly roast", amount: 121.6, suffix: " leaked", tag: "roast", label: "Roast" },
];
