# Auntified — Boilerplate Plan

## Stack

| Layer            | Choice                                   | Notes                                              |
| ---------------- | ---------------------------------------- | -------------------------------------------------- |
| Framework        | **Next.js** (App Router, TypeScript)     | `src/` dir, route handlers act as the backend API  |
| Backend / DB     | **Firebase Admin SDK** (`firebase-admin`)| Server-only: Firestore, Auth, Storage              |
| State            | **Zustand**                              | Client/UI state + small client cache; per-request stores for anything seeded from the server |
| HTTP client      | **Axios**                                | Client components only, one shared instance for `/api/*` |
| Icons            | **react-icons**                          | Re-exported from one central file                  |
| Styling          | **Tailwind CSS** (v4)                    | Theme tokens in `globals.css` via `@theme`         |

**Extras (small, recommended):**
`clsx` + `tailwind-merge` (for `cn()`), `server-only` / `client-only` (build-time guards against code crossing the boundary), `zod` (request/env validation), `prettier` + `prettier-plugin-tailwindcss`.

---

## How the pieces connect

There are two read paths and one write path. Picking the right one is what prevents duplicate fetching.

```
READ (default) — Server Component
  page.tsx ──► server/queries/* (React cache) ──► repositories ──► firebase-admin
            └─► passes plain DTOs as props / seeds a store provider

READ (client-only, e.g. search, infinite scroll, polling)
  Component ──► store action (skips if loading/fresh) ──► services ──► axios (in-flight dedupe) ──► /api/*

WRITE
  Component ──► service (axios) ──► app/api/**/route.ts (withHandler) ──► repositories ──► firebase-admin
            └─► patch the store / router.refresh() with the response (no blind full refetch)
```

Rules:
- **Client never imports `firebase-admin`.** `src/server/**`, `src/lib/firebase/**`, `src/lib/env.server.ts` start with `import "server-only"`. The build fails if one is pulled into a client bundle.
- **Server Components never call their own API over HTTP.** They call `server/queries` directly. Using axios from the server adds an extra network hop, drops cookies, and fetches twice.
- **Components never call axios directly.** They go through a service or a store action.
- **Route handlers never touch Firestore directly.** They call a repository.
- **Nothing leaves the server raw.** Repositories return DTOs (whitelisted fields, Timestamps → ISO strings).
- **No magic strings.** Routes, endpoints, collection names, messages and storage keys live in `src/constants`.

---

## Folder structure

```
.
├── .env.local                    # secrets (git-ignored)
├── .env.example                  # documented keys, no values
├── proxy.ts                      # route protection (named middleware.ts on Next ≤15)
├── next.config.ts
├── tsconfig.json                 # path alias: "@/*" → "src/*"
└── src/
    ├── app/
    │   ├── (public)/             # login, landing, etc.
    │   ├── (protected)/
    │   │   └── layout.tsx        # getCurrentUser() → <AuthStoreProvider user={...}>
    │   ├── api/
    │   │   ├── auth/session/route.ts
    │   │   └── users/
    │   │       ├── route.ts      # GET list, POST create
    │   │       └── [id]/route.ts # GET, PATCH, DELETE
    │   ├── layout.tsx
    │   ├── providers.tsx         # client providers (toasts)
    │   ├── loading.tsx
    │   ├── error.tsx
    │   ├── not-found.tsx
    │   └── globals.css           # tailwind import + @theme tokens
    │
    ├── components/
    │   ├── ui/                   # dumb, reusable primitives
    │   │   ├── Button.tsx  Input.tsx  Textarea.tsx  Select.tsx  Checkbox.tsx
    │   │   ├── Modal.tsx  Card.tsx  Badge.tsx  Avatar.tsx  Tooltip.tsx  Dropdown.tsx
    │   │   ├── Spinner.tsx  Skeleton.tsx  EmptyState.tsx  Pagination.tsx  Table.tsx
    │   │   └── index.ts          # barrel export
    │   ├── layout/               # Header, Sidebar, Footer, Container, PageHeader
    │   ├── feedback/             # Toast/Toaster, ErrorBoundary, ConfirmDialog
    │   ├── forms/                # FormField (label + input + error), FormActions
    │   └── icons.ts              # central react-icons map
    │
    ├── features/                 # optional: feature-scoped UI (e.g. features/users/UserTable.tsx)
    │
    ├── constants/
    │   ├── routes.ts             # page paths
    │   ├── endpoints.ts          # API paths used by services
    │   ├── collections.ts        # Firestore collection names
    │   ├── messages.ts           # user-facing success/error strings
    │   ├── config.ts             # app name, page size, timeouts, stale time
    │   ├── storage-keys.ts       # localStorage / persist keys
    │   └── index.ts
    │
    ├── lib/
    │   ├── env.server.ts         # server-only, zod-validated secrets
    │   ├── env.client.ts         # NEXT_PUBLIC_* only
    │   ├── firebase/
    │   │   └── admin.ts          # admin app singleton → db, adminAuth
    │   └── api/
    │       ├── client.ts         # client-only: axios instance, interceptors, deduped get()
    │       ├── handler.ts        # withHandler() wrapper for route handlers
    │       ├── errors.ts         # ApiError class + error codes
    │       └── response.ts       # ok() / fail() helpers → standard shape
    │
    ├── server/                   # server-only business logic
    │   ├── repositories/
    │   │   ├── base.repository.ts   # generic CRUD + DTO mapping + cursor pagination
    │   │   └── users.repository.ts
    │   ├── queries/
    │   │   └── users.queries.ts  # React cache()-wrapped reads for Server Components
    │   └── auth/
    │       └── session.ts        # getCurrentUser() (cached), requireUser()
    │
    ├── services/                 # client-side API calls (axios)
    │   ├── auth.service.ts
    │   └── users.service.ts
    │
    ├── store/
    │   ├── create-store.ts       # helper for global client-only stores
    │   ├── ui.store.ts           # global: sidebar, modals, theme (never written on server)
    │   ├── users.store.ts        # global: client cache w/ status + fetchedAt
    │   ├── auth.store.ts         # per-request: vanilla store factory
    │   ├── auth-provider.tsx     # context provider + useAuthStore hook
    │   └── index.ts
    │
    ├── hooks/
    │   ├── useAsync.ts           # { run, data, error, loading }, ignores results after unmount
    │   ├── useDebounce.ts
    │   ├── useDisclosure.ts      # { isOpen, open, close, toggle }
    │   ├── useClickOutside.ts
    │   ├── useMediaQuery.ts
    │   ├── useLocalStorage.ts
    │   └── useMounted.ts         # hydration-safe rendering
    │
    ├── utils/
    │   ├── cn.ts                 # clsx + tailwind-merge
    │   ├── format.ts             # dates, currency, numbers, truncate, initials
    │   ├── string.ts             # slugify, capitalize
    │   ├── object.ts             # pick, omit, isEmpty
    │   ├── array.ts              # groupBy, uniqBy, chunk
    │   ├── firestore.ts          # Timestamp → ISO, doc → DTO
    │   ├── validators.ts         # email, phone, password rules
    │   └── index.ts
    │
    └── types/
        ├── api.ts                # ApiResponse<T>, Paginated<T>, ApiErrorShape
        ├── models.ts             # User, UserDTO, etc. (shared client + server)
        └── index.ts
```

---

## Centralised pieces (the core of the boilerplate)

### 1. Standard API response shape — `types/api.ts`
Every route returns the same envelope, so the axios interceptor can unwrap it once.

```ts
export type ApiSuccess<T> = { success: true; data: T; message?: string };
export type ApiFailure = { success: false; error: { code: string; message: string } };
export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export type Paginated<T> = { items: T[]; nextCursor: string | null };
```

### 2. Env split — `lib/env.server.ts` / `lib/env.client.ts`
```ts
// env.server.ts
import "server-only";
export const env = z.object({
  FIREBASE_PROJECT_ID: z.string(),
  FIREBASE_CLIENT_EMAIL: z.string(),
  FIREBASE_PRIVATE_KEY: z.string(),
  SESSION_COOKIE_NAME: z.string().default("session"),
  SESSION_EXPIRES_DAYS: z.coerce.number().default(5),
}).parse(process.env);

// env.client.ts — only NEXT_PUBLIC_* ever goes here
export const publicEnv = { APP_URL: process.env.NEXT_PUBLIC_APP_URL! };
```

### 3. Firebase Admin singleton — `lib/firebase/admin.ts`
`getApps()` stops dev hot reload from creating a new admin app (and leaking connections) on every save.

```ts
import "server-only";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { env } from "@/lib/env.server";

const app =
  getApps()[0] ??
  initializeApp({
    credential: cert({
      projectId: env.FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });

export const db = getFirestore(app);   // don't call db.settings() — throws on hot reload
export const adminAuth = getAuth(app);
```

### 4. Route handler wrapper — `lib/api/handler.ts` + `response.ts`
One place for try/catch, auth, CSRF origin check, and safe error output.

```ts
export function withHandler<T>(
  fn: (req: NextRequest, ctx: { params: Promise<Record<string, string>>; user?: SessionUser }) => Promise<T>,
  opts: { auth?: boolean } = {}
) {
  return async (req: NextRequest, ctx: { params: Promise<Record<string, string>> }) => {
    try {
      if (req.method !== "GET") assertSameOrigin(req);        // CSRF guard for mutations
      const user = opts.auth ? await requireUser() : undefined;
      return ok(await fn(req, { ...ctx, user }));
    } catch (err) {
      return fail(err);
    }
  };
}

// response.ts — never leak stack traces / Firestore internals to the client
export function fail(err: unknown) {
  if (err instanceof ApiError) return NextResponse.json({ success: false, error: { code: err.code, message: err.message } }, { status: err.status });
  console.error(err);
  return NextResponse.json({ success: false, error: { code: "INTERNAL", message: MESSAGES.GENERIC_ERROR } }, { status: 500 });
}

// usage — app/api/users/route.ts
export const GET = withHandler((req) => usersRepo.list({ cursor: req.nextUrl.searchParams.get("cursor") }), { auth: true });
```

### 5. Base repository — `server/repositories/base.repository.ts`
Generic CRUD. Every read goes through a `toDTO` mapper, so new Firestore fields are private until you add them to the DTO.

```ts
import "server-only";

export function createRepository<Doc, DTO extends { id: string }>(
  collection: string,
  toDTO: (id: string, data: Doc) => DTO           // whitelist fields + Timestamp → ISO
) {
  const col = db.collection(collection);
  const map = (s: FirebaseFirestore.DocumentSnapshot) => toDTO(s.id, s.data() as Doc);

  return {
    // cursor pagination — never read a whole collection
    list: async ({ cursor, limit = CONFIG.PAGE_SIZE }: { cursor?: string | null; limit?: number } = {}): Promise<Paginated<DTO>> => {
      let q = col.orderBy("createdAt", "desc").limit(limit + 1);
      if (cursor) q = q.startAfter(await col.doc(cursor).get());
      const docs = (await q.get()).docs;
      const items = docs.slice(0, limit).map(map);
      return { items, nextCursor: docs.length > limit ? items.at(-1)!.id : null };
    },
    getById: async (id: string) => {
      const snap = await col.doc(id).get();
      if (!snap.exists) throw ApiError.notFound();
      return map(snap);
    },
    // one round trip for many ids (avoids N+1 reads)
    getMany: async (ids: string[]) =>
      ids.length ? (await db.getAll(...ids.map((id) => col.doc(id)))).filter((s) => s.exists).map(map) : [],
    create: async (data: Omit<Doc, "createdAt" | "updatedAt">) => { /* add + serverTimestamp, return DTO */ },
    update: async (id: string, data: Partial<Doc>) => { /* update + updatedAt, return DTO */ },
    remove: async (id: string) => col.doc(id).delete(),
  };
}

// server/repositories/users.repository.ts
export const usersRepo = createRepository<UserDoc, UserDTO>(COLLECTIONS.USERS, (id, d) => ({
  id, name: d.name, email: d.email, createdAt: toISO(d.createdAt),   // no role/internal fields unless needed
}));
```

### 6. Server queries — `server/queries/users.queries.ts`
`cache()` dedupes reads within a single request. If the layout, `generateMetadata` and the page all ask for the same user, Firestore is read once.

```ts
import "server-only";
import { cache } from "react";

export const getUser = cache((id: string) => usersRepo.getById(id));
export const listUsers = cache((cursor?: string) => usersRepo.list({ cursor }));
```

### 7. Session — `server/auth/session.ts`
```ts
import "server-only";

export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const token = (await cookies()).get(env.SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const decoded = await adminAuth.verifySessionCookie(token, true);   // true = check revoked
    return { uid: decoded.uid, email: decoded.email ?? null };
  } catch {
    return null;
  }
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw ApiError.unauthorized();
  return user;
}
```

### 8. Axios client — `lib/api/client.ts`
```ts
import "client-only";

export const api = axios.create({ baseURL: "/api", timeout: CONFIG.API_TIMEOUT, withCredentials: true });

api.interceptors.response.use(
  (res) => res.data.data,                 // unwrap envelope → callers get T
  (err) => {
    const e = err.response?.data?.error ?? { code: "NETWORK_ERROR", message: MESSAGES.GENERIC_ERROR };
    // hard redirect: no logout API call (so no 401 loop), and it wipes all in-memory client state
    if (err.response?.status === 401 && location.pathname !== ROUTES.LOGIN) location.assign(ROUTES.LOGIN);
    return Promise.reject(e);
  }
);

// GET dedupe: concurrent identical calls share one request (covers StrictMode double effects too)
const inflight = new Map<string, Promise<unknown>>();
export function get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const key = `${url}?${JSON.stringify(params ?? {})}`;
  if (!inflight.has(key)) {
    inflight.set(key, api.get(url, { params }).finally(() => inflight.delete(key)));  // map never grows
  }
  return inflight.get(key) as Promise<T>;
}
```

### 9. Services — `services/users.service.ts`
```ts
export const usersService = {
  list: (cursor?: string) => get<Paginated<UserDTO>>(ENDPOINTS.USERS, { cursor }),
  get: (id: string) => get<UserDTO>(ENDPOINTS.USER(id)),
  create: (body: CreateUser) => api.post<never, UserDTO>(ENDPOINTS.USERS, body),
  update: (id: string, body: UpdateUser) => api.patch<never, UserDTO>(ENDPOINTS.USER(id), body),
  remove: (id: string) => api.delete(ENDPOINTS.USER(id)),
};
```

### 10. Zustand: two kinds of store

**a) Global client-only stores** (`create-store.ts`). Use these only for state that is never written on the server: UI flags and client caches.
On the server a module-level store is shared by every request. If it ever held user data, one user could see another's.

```ts
export const createStore = <T>(name: string, init: StateCreator<T>, persistKey?: string) =>
  create<T>()(devtools(persistKey ? (persist(init, { name: persistKey, skipHydration: true }) as any) : init, { name }));
// persisted stores: call store.persist.rehydrate() in a client effect → no hydration mismatch
// only persist UI prefs (theme, sidebar). Never persist user data / PII.
```

**b) Per-request stores for server-seeded data** (`auth.store.ts` + `auth-provider.tsx`). Following the Zustand Next.js guide, the store is created once per provider mount and seeded from the server, so the client never has to fetch `/api/me`.

```ts
// auth.store.ts
export const createAuthStore = (user: SessionUser | null) =>
  createVanillaStore<AuthState>()((set) => ({ user, setUser: (user) => set({ user }) }));

// auth-provider.tsx
"use client";
export function AuthStoreProvider({ user, children }: { user: SessionUser | null; children: ReactNode }) {
  const [store] = useState(() => createAuthStore(user));
  return <AuthCtx.Provider value={store}>{children}</AuthCtx.Provider>;
}
export const useAuthStore = <T,>(sel: (s: AuthState) => T) => useStore(useContext(AuthCtx)!, sel);

// app/(protected)/layout.tsx (server)
const user = await getCurrentUser();          // cached, same read the page uses
return <AuthStoreProvider user={user}>{children}</AuthStoreProvider>;
```

**Client cache store pattern** (`users.store.ts`). Fetch actions skip the request when one is already loading or the data is still fresh. Mutations patch the store from their response instead of refetching the whole list.

```ts
fetchUsers: async ({ force = false } = {}) => {
  const { status, fetchedAt } = get();
  if (status === "loading") return;
  if (!force && fetchedAt && Date.now() - fetchedAt < CONFIG.STALE_TIME) return;
  set({ status: "loading" });
  try {
    const page = await usersService.list();
    set({ items: page.items, nextCursor: page.nextCursor, status: "success", fetchedAt: Date.now() });
  } catch (error) { set({ status: "error", error }); }
},
updateUser: async (id, body) => {
  const updated = await usersService.update(id, body);
  set((s) => ({ items: s.items.map((u) => (u.id === id ? updated : u)) }));
},
```

Selector rule: select primitives, or wrap object/array selections in `useShallow`. That prevents extra re-renders and "getSnapshot should be cached" loops.

### 11. Hooks that can't leak
- `useAsync`: tracks the latest call and ignores results after unmount or when a newer call starts (no stale overwrites, no setState after unmount).
- `useClickOutside`, `useMediaQuery`, `useLocalStorage`: every `addEventListener` gets a matching remove in the effect cleanup.
- Toasts and debounces: `clearTimeout` on unmount.
- Any `store.subscribe()` outside React stores and calls its unsubscribe.

### 12. Constants — `constants/*`
```ts
export const ROUTES = { HOME: "/", LOGIN: "/login", DASHBOARD: "/dashboard" } as const;
export const ENDPOINTS = { USERS: "/users", USER: (id: string) => `/users/${id}`, SESSION: "/auth/session" } as const;
export const COLLECTIONS = { USERS: "users" } as const;
export const MESSAGES = { GENERIC_ERROR: "Something went wrong.", SAVED: "Saved." } as const;
export const CONFIG = { APP_NAME: "Auntified", PAGE_SIZE: 20, API_TIMEOUT: 15_000, STALE_TIME: 60_000 } as const;
```

### 13. Icons — `components/icons.ts`
Swap icon packs in one file; components import semantic names only. Named imports from one subpath (`react-icons/fi`) keep the bundle small.
```ts
import { FiX, FiMenu, FiSearch, FiChevronDown, FiTrash2, FiEdit2, FiPlus, FiCheck, FiAlertCircle } from "react-icons/fi";
export const Icons = {
  close: FiX, menu: FiMenu, search: FiSearch, chevronDown: FiChevronDown,
  delete: FiTrash2, edit: FiEdit2, add: FiPlus, check: FiCheck, error: FiAlertCircle,
} as const;
```

### 14. Tailwind tokens — `app/globals.css`
```css
@import "tailwindcss";

@theme {
  --color-primary: #4f46e5;
  --color-primary-foreground: #ffffff;
  --color-surface: #ffffff;
  --color-muted: #6b7280;
  --color-danger: #dc2626;
  --radius-card: 0.75rem;
  --font-sans: "Inter", system-ui, sans-serif;
}
```
UI primitives use these tokens (`bg-primary`, `text-muted`), never raw hex. Variants live in a small map inside each component (e.g. `Button` → `variant: "primary" | "secondary" | "ghost" | "danger"`, `size: "sm" | "md" | "lg"`, `loading`, `leftIcon`).

---

## Auth flow (admin-SDK based)

1. User signs in (see open decision below) → gets a Firebase ID token.
2. Client `POST /api/auth/session` with the ID token.
3. Route verifies it with `adminAuth.verifyIdToken()` and sets a session cookie from `adminAuth.createSessionCookie()`. Cookie flags: `httpOnly`, `secure` (prod), `sameSite: "lax"`, `path: "/"`.
4. `proxy.ts` only checks the cookie **exists** for `(protected)` routes (fast, no Firestore call) → redirects to `ROUTES.LOGIN` otherwise.
5. Real verification happens server-side: `getCurrentUser()` in layouts/pages (cached per request) and `withHandler({ auth: true })` in API routes.
6. `(protected)/layout.tsx` seeds `AuthStoreProvider` with the user, so there is no client-side "who am I" fetch.
7. Logout: `DELETE /api/auth/session` clears the cookie and calls `adminAuth.revokeRefreshTokens(uid)`, then `location.assign(ROUTES.LOGIN)`. The full reload drops every in-memory store, and persisted UI keys are cleared.

---

## Leak & duplicate-fetch checklist

| Risk | Guard |
| --- | --- |
| Admin SDK / secrets in client bundle | `server-only` imports; `env.server.ts` vs `env.client.ts`; secrets never prefixed `NEXT_PUBLIC_` |
| Server code using axios | `client-only` in `lib/api/client.ts` → build error |
| Cross-user data via shared Zustand store on server | Global stores never written on server; server-seeded data uses per-request provider stores |
| Sensitive Firestore fields reaching client | Repositories return DTOs only (whitelist mapper) |
| Stack traces / internals in API errors | `fail()` returns generic 500 for non-`ApiError` |
| PII in localStorage | Only UI prefs persisted; logout clears storage keys |
| CSRF on cookie auth | `sameSite: lax` + same-origin check on non-GET in `withHandler` |
| Firebase app re-init on hot reload | `getApps()` singleton, no `db.settings()` |
| Listener / timer / setState-after-unmount leaks | Cleanup in every hook; `useAsync` ignores stale results |
| Inflight map growing | Entry deleted in `.finally()` |
| Same data fetched by layout + page + metadata | `cache()` in `server/queries` and `getCurrentUser` |
| Server component fetching own API | Rule: call `server/queries` directly |
| Two components fetching the same list | In-flight GET dedupe + store `status` check |
| Refetching on every mount | `fetchedAt` + `STALE_TIME` |
| Refetching whole list after a mutation | Patch store from mutation response (or `router.refresh()` for server-rendered data) |
| Whole-collection reads / N+1 | Cursor pagination; `getMany` via `db.getAll` |
| Client fetching current user on load | Seeded from server via `AuthStoreProvider` |

---

## Environment — `.env.example`
```
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
SESSION_COOKIE_NAME=session
SESSION_EXPIRES_DAYS=5
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Conventions

- **Naming:** components `PascalCase.tsx`, hooks `useThing.ts`, everything else `kebab-case.ts` with a suffix (`users.service.ts`, `auth.store.ts`, `users.repository.ts`, `users.queries.ts`).
- **Imports:** always via `@/` alias; barrels (`index.ts`) for `components/ui`, `constants`, `utils`, `types`. Don't add barrels for `server/` (keeps client/server code clearly apart).
- **Server vs client:** default to Server Components and do reads there; add `"use client"` only for interactivity, stores and hooks.
- **Errors:** throw `ApiError.badRequest() / unauthorized() / notFound()` on the server; surface `error.message` via toast on the client.
- **Formatting:** Prettier + Tailwind class sorting; ESLint from `create-next-app`.

---

## Setup order

1. `npx create-next-app@latest . --ts --tailwind --eslint --app --src-dir --import-alias "@/*"`
2. `npm i firebase-admin zustand axios react-icons clsx tailwind-merge server-only client-only zod`
3. `npm i -D prettier prettier-plugin-tailwindcss`
4. `.env.example`, `lib/env.server.ts`, `lib/env.client.ts`, `lib/firebase/admin.ts`
5. `types/*`, `lib/api/{errors,response,handler}.ts`
6. `constants/*`, `utils/*`
7. `server/repositories/*`, `server/queries/*`, `server/auth/session.ts`
8. `app/api/users/*` and `app/api/auth/session` routes
9. `lib/api/client.ts`, `services/*`
10. `store/*` (global + per-request auth provider)
11. `components/ui/*`, `components/icons.ts`, layout + feedback components
12. `proxy.ts`, `(protected)/layout.tsx`, `providers.tsx`, `error.tsx`, `not-found.tsx`
13. Smoke test: list users server-rendered, create one from the client, confirm one network call per action and the list updates without a refetch

---

## Open decisions

- **Sign-in method.** The Admin SDK can verify tokens and mint session cookies, but it can't sign a user in with a password. Options: (a) add the client `firebase` SDK for sign-in only, or (b) call the Firebase Auth REST API (`signInWithPassword`) from a route handler. (a) is simpler and supports Google/OAuth providers.
- **Client cache.** The store + in-flight dedupe pattern covers normal CRUD screens. If you end up with many client-side reads (polling, infinite lists, background refetch, optimistic updates everywhere), switch server state to TanStack Query and keep Zustand for UI state only.
- **Dark mode.** Add a `dark` variant on the `@theme` tokens now if it's needed, since retrofitting is more work.
