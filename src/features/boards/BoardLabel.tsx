import Link from "next/link";

type BoardLabelProps = {
  href: string;
  num: string;
  children: string;
};

export function BoardLabel({ href, num, children }: BoardLabelProps) {
  return (
    <div className="flex items-center gap-[8px] text-[12px] font-medium text-muted">
      <Link
        href={href}
        className="rounded-[5px] bg-night px-[7px] py-[3px] font-mono text-[11px] font-semibold text-white no-underline"
      >
        {num}
      </Link>
      {children}
    </div>
  );
}
