import Link from "next/link";
import { ROUTES } from "@/constants";

export function PublicFooter() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto flex max-w-[1120px] flex-col gap-[12px] px-[16px] py-[24px] text-[13px] font-medium text-muted sm:flex-row sm:items-center sm:justify-between lg:px-[40px]">
        <p className="m-0">An assistant, not a financial adviser. Demo data, no bank connected.</p>
        <nav aria-label="Footer" className="flex gap-[16px]">
          <Link href={ROUTES.FEATURES} className="no-underline">Features</Link>
          <Link href={ROUTES.LOGIN} className="no-underline">Log in</Link>
          <Link href={ROUTES.SIGNUP} className="no-underline">Sign up</Link>
        </nav>
      </div>
    </footer>
  );
}
