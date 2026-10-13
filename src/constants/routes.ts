export const ROUTES = {
  LANDING: "/",
  FEATURES: "/features",
  LOGIN: "/login",
  SIGNUP: "/signup",
  ONBOARDING: "/onboarding",
  HOME: "/home",
  ROAST: "/roast",
  ASK: "/ask",
  PATTERNS: "/patterns",
  PAY: "/pay",
  PAY_REVIEW: "/pay/review",
  PAY_CHECK: "/pay/check",
  PAY_WARN: "/pay/warn",
  PAY_BLOCKED: "/pay/blocked",
  PAY_BLOCKED_WHY: "/pay/blocked/why",
  PAYEE: (id: string) => `/payees/${id}`,
  LEDGER: "/ledger",
  SETTINGS: "/settings",
  DEMO: "/demo",
  EVAL: "/eval",
  PLUGIN: "/plugin",
  KIT: "/kit",
  MASCOT: "/mascot",
} as const;

/** A pay-flow route for one transfer, e.g. withTransfer(ROUTES.PAY_REVIEW, id) → "/pay/review?id=…". */
export const withTransfer = (route: string, id: string) => `${route}?id=${encodeURIComponent(id)}`;
