import { cn } from "@/utils";

type AvatarProps = {
  initials: string;
  size: number;
  as?: "span" | "div";
  className?: string;
};

export function Avatar({ initials, size, as: Tag = "span", className }: AvatarProps) {
  return (
    <Tag
      aria-hidden="true"
      className={cn("text-center font-display font-bold", className)}
      style={{ width: size, height: size, borderRadius: size / 2, lineHeight: `${size}px` }}
    >
      {initials}
    </Tag>
  );
}
