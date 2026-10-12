import { cn } from "@/utils";

export type AuntieBaoMood = "meh" | "alarm" | "smug" | "sleep";

type AuntieBaoProps = {
  mood?: AuntieBaoMood;
  width: number;
  height: number;
  className?: string;
};

export function AuntieBao({ mood = "meh", width, height, className }: AuntieBaoProps) {
  const d = (k: AuntieBaoMood) => (mood === k ? "inline" : "none");
  return (
    <span className={cn("flex flex-none", className)} style={{ width, height, minWidth: width }}>
      <svg
        viewBox="0 0 120 112"
        width="100%"
        height="100%"
        role="img"
        aria-label={`Auntie Kumari, ${mood}`}
        style={{ display: "block", overflow: "visible" }}
      >
        <circle cx="60" cy="26" r="14" fill="#3A2A22" stroke="#2B1D14" strokeWidth="3.5"></circle>
        <path d="M14 82 q-10 4 -4 14" fill="none" stroke="#2B1D14" strokeWidth="3.5" strokeLinecap="round"></path>
        <path d="M106 82 q10 4 4 14" fill="none" stroke="#2B1D14" strokeWidth="3.5" strokeLinecap="round"></path>
        <path d="M12 92 C8 60 30 36 60 36 C90 36 112 60 108 92 C106 103 92 107 60 107 C28 107 14 103 12 92 Z" fill="#FFF1D6" stroke="#2B1D14" strokeWidth="3.5"></path>
        <path d="M22 96 C40 102 80 102 98 96" fill="none" stroke="#F2D7A8" strokeWidth="5" strokeLinecap="round"></path>
        <path d="M24 58 C28 42 44 35 60 35 C76 35 92 42 96 58 C86 50 74 48 60 52 C46 48 34 50 24 58 Z" fill="#3A2A22" stroke="#2B1D14" strokeWidth="3.5" strokeLinejoin="round"></path>
        <ellipse cx="30" cy="85" rx="6" ry="3.5" fill="#FFB49C"></ellipse>
        <ellipse cx="90" cy="85" rx="6" ry="3.5" fill="#FFB49C"></ellipse>
        <g display={d("meh")}><path d="M41 70 a5 5 0 0 0 10 0 Z" fill="#2B1D14"></path><path d="M69 70 a5 5 0 0 0 10 0 Z" fill="#2B1D14"></path><path d="M39 70 h14 M67 70 h14" stroke="#2B1D14" strokeWidth="3" strokeLinecap="round"></path><path d="M54 91 q6 -3 12 0" fill="none" stroke="#2B1D14" strokeWidth="3" strokeLinecap="round"></path></g>
        <g display={d("alarm")}><circle cx="46" cy="71" r="4" fill="#2B1D14"></circle><circle cx="74" cy="71" r="4" fill="#2B1D14"></circle><path d="M38 60 l12 3 M82 60 l-12 3" stroke="#2B1D14" strokeWidth="3" strokeLinecap="round"></path><ellipse cx="60" cy="91" rx="5" ry="6" fill="#2B1D14"></ellipse><path d="M101 44 q6 9 0 12 q-6 -3 0 -12 Z" fill="#9AD8F2" stroke="#2B1D14" strokeWidth="2.5" strokeLinejoin="round"></path></g>
        <g display={d("smug")}><path d="M40 72 q6 -6 12 0 M68 72 q6 -6 12 0" fill="none" stroke="#2B1D14" strokeWidth="3" strokeLinecap="round"></path><path d="M52 88 q8 6 15 -3" fill="none" stroke="#2B1D14" strokeWidth="3" strokeLinecap="round"></path></g>
        <g display={d("sleep")}><path d="M40 69 q6 6 12 0 M68 69 q6 6 12 0" fill="none" stroke="#2B1D14" strokeWidth="3" strokeLinecap="round"></path><circle cx="60" cy="91" r="2.6" fill="#2B1D14"></circle><text className="font-display" x="98" y="30" fontFamily="Fredoka, sans-serif" fontWeight="700" fontSize="16" fill="#2B1D14">z</text><text className="font-display" x="108" y="16" fontFamily="Fredoka, sans-serif" fontWeight="700" fontSize="11" fill="#2B1D14">z</text></g>
        <circle cx="46" cy="70" r="10.5" fill="#FFFFFF" fillOpacity=".25" stroke="#2B1D14" strokeWidth="2.5"></circle>
        <circle cx="74" cy="70" r="10.5" fill="#FFFFFF" fillOpacity=".25" stroke="#2B1D14" strokeWidth="2.5"></circle>
        <path d="M56.5 69 q3.5 -3 7 0" fill="none" stroke="#2B1D14" strokeWidth="2.5"></path>
      </svg>
    </span>
  );
}
