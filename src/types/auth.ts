/** The signed-in user as the server sees it. Safe to pass to Client Components. */
export type SessionUser = {
  uid: string;
  email: string | null;
  name: string | null;
};
