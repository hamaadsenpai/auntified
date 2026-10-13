import { getCurrentUser } from "@/server/auth/session";

/** Who is signed in. Reads the session, so render it inside <Suspense fallback={<AccountFallback />}>. */
export async function AccountDetails() {
  const user = await getCurrentUser();
  return <AccountView primary={user?.name ?? user?.email ?? "Not signed in"} secondary={user?.name ? user.email : null} />;
}

export function AccountFallback() {
  return <AccountView primary="…" secondary={null} />;
}

function AccountView({ primary, secondary }: { primary: string; secondary: string | null }) {
  return (
    <span className="flex min-w-0 flex-col gap-[2px]">
      <span className="text-[13px] font-medium text-muted">Signed in as</span>
      <span className="truncate text-[16px] font-semibold">{primary}</span>
      {secondary && <span className="truncate text-[13px] font-medium text-muted">{secondary}</span>}
    </span>
  );
}
