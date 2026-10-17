import toast from "react-hot-toast";
import { speakService } from "@/services/speak.service";
import { useSettingsStore } from "@/store/settings.store";
import { errorMessage } from "./error";

let audio: HTMLAudioElement | null = null;
let latest = 0;

/** Reads text aloud in Auntie's Gemini voice. Call it only from a click; a new call interrupts the previous one. */
export function speak(text: string) {
  const call = ++latest;
  audio?.pause();
  const { language } = useSettingsStore.getState().settings;
  speakService
    .speak({ text, language })
    .then((res) => {
      // A newer call has started while this one was loading.
      if (call !== latest) return;
      audio = new Audio(res.audio);
      return audio.play();
    })
    .catch((err) => {
      if (call === latest) toast.error(errorMessage(err));
    });
}
