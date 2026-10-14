/** Body of POST /api/demo. `hours` is one of DEMO_JUMPS. */
export type DemoAction = { action: "seed" } | { action: "fire" } | { action: "jump"; hours: number } | { action: "reset" };

/** Response of GET and POST /api/demo. `transferId` is the held transfer Fire created. */
export type DemoState = { clockOffsetMs: number; transferId?: string };
