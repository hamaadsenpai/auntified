/** Body of POST /api/roast: the viewer's "this week" window (ISO), so Auntie roasts the same days the page shows. */
export type RoastRequest = { from: string; to: string };

/** Auntie's weekly roast: a few-word badge ("aney...") and a short roast of the week. */
export type RoastResult = { badge: string; roast: string };
