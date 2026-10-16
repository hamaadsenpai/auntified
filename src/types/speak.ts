/** Body of POST /api/speak: text for Auntie to read aloud, in the user's language from settings. */
export type SpeakRequest = { text: string; language: string };

/** A data URL the browser can play in an <audio> element. */
export type SpeakResult = { audio: string };
