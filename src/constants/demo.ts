/** The scam payment Fire sends through the real check. The /demo copy reads these, so it stays true. */
export const DEMO_FIRE = { AMOUNT_SGD: 1850, PAYEE_AGE_MIN: 6 } as const;

/** How far Jump can move the demo clock. */
export const DEMO_JUMPS = [
  { hours: 1, label: "Plus 1 hour" },
  { hours: 24, label: "Plus 24 hours" },
  { hours: 168, label: "Plus 7 days" },
] as const;
