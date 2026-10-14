import { Card } from "@/components/ui";

const CONTAINER = "mx-auto w-full max-w-[1120px] px-[16px] lg:px-[40px]";

const SECTIONS = [
  {
    title: "It is a demo",
    body: "Auntified is a demo. It does not connect to any bank, and all the money you see is demo money. Nothing you do here moves real money.",
  },
  {
    title: "Not financial advice",
    body: "Auntie has opinions about your spending, but none of it is financial advice. For real decisions, talk to a qualified professional.",
  },
  {
    title: "Auntie never asks for your secrets",
    body: "Auntie will never ask for your PIN, password or OTP. If anything asking for those claims to be Auntie, it is not.",
  },
  {
    title: "What we store",
    body: "Your account details (name, email and sign-in provider) and what you enter in the app (payees, transfers, expenses and settings). It is kept in Firebase.",
  },
  {
    title: "Agreeing to these terms",
    body: "When you sign up, we record the time you agreed to these terms.",
  },
  {
    title: "Leaving",
    body: "You can stop using Auntified at any time.",
  },
];

export function TermsScreen() {
  return (
    <main className="flex flex-1 flex-col gap-[40px] py-[40px] lg:gap-[56px] lg:py-[64px]">
      <header className={CONTAINER}>
        <div className="flex flex-col gap-[8px]">
          <h1 className="m-0 font-display text-[32px] leading-[1.1] font-bold lg:text-[44px]">Terms</h1>
          <p className="m-0 text-[16px] leading-[1.45] font-medium text-muted lg:text-[18px]">
            Last updated: 14 October 2026
          </p>
        </div>
      </header>

      <div className={CONTAINER}>
        <Card className="flex flex-col gap-[24px] bg-white p-[20px] sm:p-[28px]">
          {SECTIONS.map((section) => (
            <section key={section.title} className="flex flex-col gap-[8px]">
              <h2 className="m-0 font-display text-[18px] leading-[1.2] font-bold">{section.title}</h2>
              <p className="m-0 text-[15px] leading-[1.5] font-medium text-muted">{section.body}</p>
            </section>
          ))}
        </Card>
      </div>
    </main>
  );
}
