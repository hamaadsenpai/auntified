import { speakService } from "@/services/speak.service";
import { useSettingsStore } from "@/store/settings.store";

let audio: HTMLAudioElement | null = null;
let latest = 0;

function browserSpeak(text: string) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
}

/** Reads text aloud in Auntie's Gemini voice, or the browser's voice if that fails; a new call interrupts the previous one. */
export function speak(text: string) {
  if (typeof window === "undefined") return;
  const call = ++latest;
  audio?.pause();
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  const { language } = useSettingsStore.getState().settings;
  speakService
    .speak({ text, language })
    .then((res) => {
      // A newer call has started while this one was loading.
      if (call !== latest) return;
      audio = new Audio(res.audio);
      return audio.play();
    })
    .catch(() => {
      if (call === latest) browserSpeak(text);
    });
}
