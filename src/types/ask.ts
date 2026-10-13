/** One line of an Ask Auntie chat, in order. */
export type AskTurn = { role: "auntie" | "user"; text: string };

/** Body of POST /api/ask: the chat so far, ending with the user's question. */
export type AskRequest = { transcript: AskTurn[] };

export type AskResult = { reply: string };
