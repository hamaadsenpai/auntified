# Auntified UI: Handoff

The build is **UI only**. There is no backend, Firebase Admin, axios or API routes yet: those are still the plan in `BOILERPLATE.md`. The Firebase client SDK is set up for sign-in only (`src/lib/firebase/client.ts`, config in `.env.local`) but nothing calls it yet. Every screen is a static copy of the design references, using the demo data from those references.

- **Source of truth:** `design/Auntie Ledger.dc.html` and `design/Auntie Bao.dc.html`, copied from `~/Downloads/Auntie Ledger UI mockups/`.
- **Stack:** Next.js 16.4 (App Router, Turbopack), React 19.3, Tailwind CSS 4.3, TypeScript, `clsx` + `tailwind-merge`.
- **Run it:**
  - `npm run dev` (development)
  - `npm run build && npm start` (production)
  - `npm run lint`

---

## Task checklist

- [x] Copy the references into `design/`
- [x] Scaffold Next.js. `BOILERPLATE.md`, `graft/`, `design/` and `.ignore` were not touched, and `.gitignore` was merged.
- [x] Design tokens in `src/app/globals.css` (`@theme`): 21 colors, Fredoka/Nunito/mono fonts, hard offset shadows `shadow-hard-{xs,sm,md,lg}`
- [x] Fonts through `next/font` in `src/app/layout.tsx`
- [x] Mascot `AuntieBao`, an exact copy of the reference SVG with 4 moods
- [x] Icons (`src/components/icons.tsx`), the exact SVGs from the reference
- [x] Shared UI parts: Button, Chip, Tag, AuntieBubble, UserBubble, NudgeCard, Card, ProgressBar, RiskMeter, Avatar, Input
- [x] Layout: `Screen`, `BackHeader`, `BottomNav` (mobile) and `Sidebar` (desktop)
- [x] 01 Home + D1 desktop → `/home` (moved from `/`, which is now the landing page)
- [x] 02 Weekly roast + D2 desktop → `/roast`
- [x] 03 Ask Auntie → `/ask`
- [x] 04 Your patterns → `/patterns`
- [x] 05 Pay + D3 desktop → `/pay`
- [x] 06 Transfer review + D3 desktop → `/pay/review`
- [x] 07 Interrogation + D4 desktop → `/pay/check`
- [x] 08 Warn tier → `/pay/warn`
- [x] 09 Blocked → `/pay/blocked`
- [x] 10 Score explainer → `/pay/blocked/why`
- [x] 11 Payee detail → `/payees/kelvin-tan`
- [x] 12 Decision log → `/ledger`
- [x] 13 Settings → `/settings`
- [x] 14 Demo controls → `/demo`
- [x] 15 Eval results → `/eval`
- [x] 16 Bank plug-in → `/plugin`
- [x] 17 UI kit → `/kit`
- [x] M1 Mascot board → `/mascot`
- [x] Public pages (`(public)` group, shared `PublicHeader` + `PublicFooter`, 1120px content width):
  - Landing → `/`
  - Features → `/features` (cards from `src/features/marketing/features.ts`)
  - Log in → `/login`
  - Sign up → `/signup`
  - Demo only: the forms submit to `/home` and their fields have no `name`, so nothing typed ends up in the URL.
- [x] Checks:
  - `tsc`, `lint` and `build` are clean, with 28/28 pages generated (four public pages included).
  - Every route returns 200.
  - Every link points to a route that exists.
  - No raw hex colors in `className`.
- [x] Text check: all 22 reference sections have **0 missing words, phrases or aria labels** on their routes.
- [x] Screenshots spot-checked at 390×844 (Home, Pay, Interrogation, Blocked) and 1440×900 (Home): they match the references.

---

## How it fits together

```
src/
├── app/
│   ├── layout.tsx            fonts, metadata, globals.css
│   ├── globals.css           @theme tokens + base styles that copy the reference's <style>
│   ├── (public)/layout.tsx   PublicHeader + PublicFooter for / /features /login /signup
│   ├── (public)/…/page.tsx   thin route files → src/features/landing, marketing, auth
│   ├── (app)/layout.tsx      desktop Sidebar (lg+) + content
│   ├── (app)/…/page.tsx      thin route files → src/features/*
│   └── (boards)/…            /eval /plugin /kit /mascot (cream canvas, 48px padding)
├── components/
│   ├── ui/                   shared UI parts (barrel: @/components/ui)
│   ├── layout/               Screen, BackHeader, BottomNav, Sidebar, PublicHeader, PublicFooter
│   ├── mascot/AuntieBao.tsx
│   └── icons.tsx
├── features/                 landing, marketing, auth, home, roast, ask, pay, verdicts, payees, patterns, ledger, settings, demo, boards
├── constants/                ROUTES, APP_NAME
└── utils/cn.ts               clsx + tailwind-merge, extended for the custom shadow and font tokens
```

### Mobile and desktop

| Width | Behaviour |
| --- | --- |
| Under `lg` (phones) | Each phone screen fills the viewport (`<Screen>`, `h-dvh`). The `<main>` area scrolls. The bottom nav appears on Home, Pay, Ledger and You, as in the design. |
| `lg` and up | The 240px desktop sidebar appears. Home, Roast, Pay/Review and Check use their D1–D4 desktop layouts. Every other screen shows inside a centered 390×844 phone frame on the cream background, because there is no desktop design for it. |
| Boards | Shown at their fixed design widths (1000px / 1440px). They scroll sideways on small screens. |

### Styling rules used throughout

- Colors only come from tokens (`bg-teal`, `text-muted`, `border-ink` and so on).
- Font sizes are always exact pixel values (`text-[13px]`).
- Line-height is the browser's `normal`, set globally to match the reference. It is only overridden where the reference sets one.
- Links are teal and underlined by default, like the reference. `no-underline` is added wherever the reference turns the underline off.

---

### Money and currency

- Every amount is stored as a number in **SGD** and rendered with `<Money sgd={1850} />` (`whole` for round figures like goals). Never write `S$` into the markup.
- The user picks a currency in Settings (`CurrencyPicker`). There are 33 currencies across Southeast Asia, South Asia, East Asia and Oceania, listed in `src/constants/currencies.ts`. Each one has its own symbol, decimals, lakh grouping and a **fixed demo rate**, not a live one.
- The choice is kept in a persisted Zustand store (`src/store/currency.store.ts`). `<StoreHydration />` in the root layout loads it after the first render, so pages are prerendered in SGD and switch currency once they load.
- Formatting helpers live in `src/utils/format.ts`. Inside `<option>` only plain text is allowed, so call `formatMoney()` there instead of using `<Money>` (see `FromAccountSelect`).
- The mobile keypad (`pay/AmountPad.tsx`) works. Zero-decimal currencies get a `000` key in place of `.`. The amount resets when the currency changes, and the Review, Check and Blocked screens still show the scripted S$1,850 scenario.

### Dropdowns

- Use `Select` from `@/components/ui` (`variant="bold" | "soft"`). It is a real `<select>` with our chevron. Chromium also gets a styled dropdown through `appearance: base-select` (`globals.css`), and other browsers fall back to their native list.

## Deliberate differences from the reference

1. **Scrolling.** Mobile `<main>` areas (and the Ledger list) scroll. The reference has fixed 844px frames with hidden overflow. The `*:shrink-0` class stops fixed-height children from being squashed.
2. **Desktop pages fill the viewport** instead of a fixed 1440×900 frame. The reference's canvas labels ("01 Home" and so on) are not shown. Boards 15–17 do keep their label row.
3. **Link mapping.** The reference links between screens with `#` anchors; these became real routes. Three targets in the reference don't exist, so I chose:
   - D1 "Your patterns" (`#d7`) → `/patterns`
   - D1 "Open ledger" (`#d6`) → `/ledger`
   - The D3 payee card (`#d6`) → `/payees/kelvin-tan`

   Nothing links to `/demo`, as in the reference.
4. **Browser defaults restored.** Tailwind's reset removes some browser defaults that the reference relied on, so they were added back:
   - button padding `1px 6px`, wherever the reference doesn't set its own
   - placeholder color `#757575` (in `globals.css`)
5. **Form fields keep their own state** (`defaultChecked` / `defaultValue`). Settings uses `name="tone"` and `id="lang"` in place of the reference's `tone2` / `lang2`.
6. **Buttons and controls don't do anything yet.** That includes the keypad, Cancel StreamPlus, Appeal, Report, Seed, Fire, Jump, Reset, Send, Mic and the filter chips. Typing on the keypad doesn't change the amount.
7. **The sidebar logo wraps onto two lines.** The reference's own sizes leave about 141px for 142px of text.

## Known issues and next steps

- **`/payees/<unknown>`** shows the Next 404 page but returns HTTP **200**. This comes from `cacheComponents: true` in `next.config.ts`, which create-next-app enabled; `dynamicParams = false` can't be used with it. To get a real 404, either turn `cacheComponents` off or add a rule in `proxy.ts`.
- `AGENTS.md` was generated by Next 16 and is rewritten by `next dev`. Leave it.
- There is no git repo yet: run `git init` before the first commit.
- **Wiring the backend later.** Replace the inline demo values in `src/features/*` with props from `server/queries` (Server Components), as `BOILERPLATE.md` describes. Then add client state (keypad amount, filters, toggles) with `"use client"` components and stores. The route and feature structure is already set up for this.
