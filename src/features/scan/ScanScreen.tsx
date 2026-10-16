"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { BottomNav, Screen } from "@/components/layout";
import { AuntieBao } from "@/components/mascot";
import { Button, FIELD_BASE, FIELD_VARIANTS } from "@/components/ui";
import { LIMITS } from "@/constants";
import { DEMO_SCAM_SMS } from "@/constants/demo";
import { MessageVerdict } from "@/features/verdicts";
import { scanService } from "@/services/scan.service";
import type { ScanRequest, ScanResult } from "@/types/scan";
import { cn, errorMessage } from "@/utils";
import { SmsHistory, useSmsHistory } from "./SmsHistory";

const PANEL = "flex flex-col rounded-[24px] border-[2.5px] border-ink px-[24px] py-[20px] shadow-hard-md";
const IMAGE_TYPES = "image/png,image/jpeg,image/webp,image/heic,image/heif";

type Image = NonNullable<ScanRequest["image"]> & { name: string };

/** A file as base64 without its data: prefix. */
function readBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/** The scanner's state, held once for the page: mobile and desktop render side by side (one hidden by CSS). */
function useScan() {
  // Demo Fire opens /scan?sample=1: start with a scam text and scan it once.
  const sample = useSearchParams().get("sample") === "1";
  const [text, setText] = useState(() => (sample ? DEMO_SCAM_SMS : ""));
  const [image, setImage] = useState<Image | null>(null);
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);

  const scan = useCallback(async (body: ScanRequest) => {
    setPending(true);
    try {
      setResult(await scanService.scan(body));
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setPending(false);
    }
  }, []);

  async function pick(file: File | undefined) {
    if (!file) return setImage(null);
    if (file.size > LIMITS.UPLOAD_BYTES) return toast.error("That screenshot is over 4 MB. Try a smaller one.");
    try {
      setImage({ name: file.name, mimeType: file.type, data: await readBase64(file) });
    } catch {
      toast.error("Couldn't read that file. Try another screenshot.");
    }
  }

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed && !image) return toast.error("Paste the message or add a screenshot first.");
    void scan({ ...(trimmed && { text: trimmed }), ...(image && { image: { mimeType: image.mimeType, data: image.data } }) });
  }

  // Ref guard: Strict Mode runs effects twice in dev, and each run would be a Gemini call.
  const fired = useRef(false);
  useEffect(() => {
    if (!sample || fired.current) return;
    fired.current = true;
    void scan({ text: DEMO_SCAM_SMS });
  }, [sample, scan]);

  return { text, setText, image, pick, pending, result, submit };
}

type Scan = ReturnType<typeof useScan>;

function ScanForm({ id, scan, variant }: { id: string; scan: Scan; variant: "bold" | "soft" }) {
  return (
    <form onSubmit={scan.submit} className="flex flex-col gap-[12px]">
      <label htmlFor={id} className="text-[15px] font-semibold">
        Paste the SMS, WhatsApp or email
      </label>
      <textarea
        id={id}
        rows={6}
        maxLength={LIMITS.SCAN_TEXT}
        placeholder="e.g. Your parcel is held at customs. Pay the fee here: …"
        value={scan.text}
        onChange={(e) => scan.setText(e.target.value)}
        className={cn(FIELD_BASE, FIELD_VARIANTS[variant], "h-auto cursor-text resize-none px-[14px] py-[12px]")}
      />
      <div className="flex flex-col gap-[6px]">
        <label htmlFor={`${id}-image`} className="text-[15px] font-semibold">
          Or add a screenshot <span className="font-medium text-muted">(optional)</span>
        </label>
        <input
          id={`${id}-image`}
          type="file"
          accept={IMAGE_TYPES}
          onChange={(e) => void scan.pick(e.target.files?.[0])}
          className="min-h-[44px] text-[14px] font-medium file:mr-[12px] file:min-h-[40px] file:cursor-pointer file:rounded-full file:border-[2px] file:border-teal file:bg-white file:px-[14px] file:font-semibold file:text-teal"
        />
        {scan.image && <span className="text-[13px] font-medium text-muted">Added {scan.image.name}</span>}
      </div>
      <Button type="submit" className="disabled:opacity-60" disabled={scan.pending}>
        {scan.pending ? "Auntie is reading…" : "Check this message"}
      </Button>
      <p className="m-0 text-[12px] leading-[1.4] font-medium text-muted">Never paste passwords or OTPs. Auntie only reads what you send here.</p>
    </form>
  );
}

function Empty() {
  return (
    <div className="flex items-center gap-[12px]">
      <AuntieBao mood="sleep" width={60} height={56} />
      <p className="m-0 font-display text-[16px] leading-[1.4] font-medium text-muted">
        Got a message asking you to click, pay or verify? Show Auntie before you do anything.
      </p>
    </div>
  );
}

/** Paste or screenshot a message and Auntie says if it's a scam, in the pass, warn and block verdict colours. */
export function ScanScreen() {
  const scan = useScan();
  const history = useSmsHistory();
  return (
    <>
      <main className="hidden min-h-dvh min-w-0 flex-col gap-[24px] bg-white px-[40px] py-[32px] lg:flex">
        <header className="flex flex-col gap-[2px]">
          <span className="text-[13px] font-medium text-muted">Phishing, impersonation, fake links and pressure</span>
          <h1 className="m-0 font-display text-[30px] leading-[1.1] font-bold">Scam scanner</h1>
        </header>
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-start gap-[24px]">
          <section aria-label="Message" className={`${PANEL} gap-[12px]`}>
            <ScanForm id="dscan" scan={scan} variant="soft" />
          </section>
          {scan.result ? (
            <MessageVerdict result={scan.result} />
          ) : (
            <section className={PANEL}>
              <Empty />
            </section>
          )}
        </div>
        <div className={PANEL}>
          <SmsHistory history={history} />
        </div>
      </main>
      <Screen className="lg:hidden">
        <header className="flex h-[64px] flex-none items-center px-[20px]">
          <h1 className="m-0 font-display text-[22px] leading-[1.1] font-bold">Scam scanner</h1>
        </header>
        <main className="flex min-h-0 flex-1 flex-col gap-[18px] overflow-y-auto px-[20px] pb-[20px] *:shrink-0">
          {scan.result ? <MessageVerdict result={scan.result} /> : <Empty />}
          <ScanForm id="scan" scan={scan} variant="bold" />
          <SmsHistory history={history} />
        </main>
        <BottomNav active="scan" />
      </Screen>
    </>
  );
}
