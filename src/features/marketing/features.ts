import { ROUTES } from "@/constants";

export type MarketingFeature = {
  key: string;
  title: string;
  summary: string;
  points: string[];
  href?: string;
};

export const MARKETING_FEATURES: MarketingFeature[] = [
  {
    key: "check",
    title: "Scam check before you pay",
    summary: "Auntie asks a few questions before a risky transfer leaves your account.",
    points: ["Who is this payee to you?", "Were you told to pay today?", "Auntie never asks for your PIN, password or OTP."],
    href: ROUTES.PAY,
  },
  {
    key: "verdicts",
    title: "Warn or block",
    summary: "Each transfer gets a risk score. Unusual ones get a warning, scams get blocked.",
    points: ["Warnings for odd timing, like paying after 10pm", "Blocks on payees that look like scams", "A plain score explainer for every verdict"],
    href: ROUTES.PAY,
  },
  {
    key: "roast",
    title: "Weekly roast",
    summary: "A weekly read of your spending, with a forecast and a few cuts to make.",
    points: ["Leaks like unused subscriptions", "Forecast savings for the month", "One tap to act on a cut"],
    href: ROUTES.ROAST,
  },
  {
    key: "ask",
    title: "Ask Auntie",
    summary: "Ask if you can afford something. She answers from your ledger only.",
    points: ["Answers after rent and your goal", "She can read her reply aloud", "No guessing, only your own data"],
    href: ROUTES.ASK,
  },
  {
    key: "patterns",
    title: "Your patterns",
    summary: "See where this week runs above your normal, category by category.",
    points: ["Food delivery, rides and short eats", "This week against your usual", "Median transfer, p95 and usual hours"],
    href: ROUTES.PATTERNS,
  },
  {
    key: "ledger",
    title: "Decision log",
    summary: "Every roast and verdict in one place, newest first.",
    points: ["Risk score for every payment", "Passed, overridden, cancelled or blocked", "Filter by payments, roasts or blocks"],
    href: ROUTES.LEDGER,
  },
  {
    key: "settings",
    title: "Your tone, language and currency",
    summary: "Pick how blunt Auntie is, the language she speaks and the currency you see.",
    points: ["Rupees first, plus 32 more currencies", "Sri Lankan English, English, Sinhala or Tamil", "Roast or Gentle tone"],
    href: ROUTES.SETTINGS,
  },
];
