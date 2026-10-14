"use client";

import { useId, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui";
import { LIMITS } from "@/constants";
import { statementService } from "@/services/statement.service";
import { useExpensesStore } from "@/store";
import type { StatementUpload as Upload } from "@/types/expense";
import { errorMessage } from "@/utils";

/** The statement's type from its MIME type, or its extension when the browser gives none (common for CSV). */
function typeOf(file: File): Upload["mimeType"] | null {
  if (file.type === "application/pdf" || /\.pdf$/i.test(file.name)) return "application/pdf";
  if (file.type === "text/csv" || /\.csv$/i.test(file.name)) return "text/csv";
  return null;
}

/** Uploads a PDF or CSV bank statement; Auntie reads it into categorised spending and spots recurring bills. */
export function StatementUpload({ onClose }: { onClose: () => void }) {
  const id = useId();
  const [file, setFile] = useState<File | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const mimeType = file && typeOf(file);
    if (!file || !mimeType) return toast.error("Pick a PDF or CSV statement.");
    if (file.size > LIMITS.UPLOAD_BYTES) return toast.error("That file is over 4 MB. Try one month at a time.");
    setPending(true);
    try {
      const data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
      const res = await statementService.upload({ mimeType, data });
      await useExpensesStore.getState().load(true);
      const recurring = res.recurring.length ? ` Recurring: ${res.recurring.slice(0, 4).join(", ")}${res.recurring.length > 4 ? "…" : ""}.` : "";
      toast.success(`Added ${res.added} ${res.added === 1 ? "expense" : "expenses"}${res.skipped ? `, skipped ${res.skipped} already logged` : ""}.${recurring}`);
      onClose();
    } catch (err) {
      toast.error(errorMessage(err));
      setPending(false);
    }
  }

  return (
    <form onSubmit={(e) => void submit(e)} className="flex flex-col gap-[12px]">
      <label htmlFor={id} className="text-[14px] font-semibold">
        Bank statement (PDF or CSV)
      </label>
      <input
        id={id}
        type="file"
        accept=".pdf,.csv,application/pdf,text/csv"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="min-h-[44px] text-[14px] font-medium file:mr-[12px] file:min-h-[40px] file:cursor-pointer file:rounded-full file:border-[2px] file:border-teal file:bg-white file:px-[14px] file:font-semibold file:text-teal"
      />
      <p className="m-0 text-[13px] font-medium text-muted">
        Auntie sorts each payment into a category and marks bills and subscriptions that repeat. Ones you already logged are skipped.
      </p>
      <div className="flex gap-[12px]">
        <Button variant="secondary" className="flex-1" disabled={pending} onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1 disabled:opacity-60" disabled={pending}>
          {pending ? "Reading…" : "Import"}
        </Button>
      </div>
    </form>
  );
}
