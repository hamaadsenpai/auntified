# Audit — whole app (src/, firestore.rules, next.config.ts) — 2026-10-13

## Findings

### F1 — Post-login redirect accepts off-site URLs
**Severity:** HIGH
**Category:** security
**Location:** src/services/auth.service.ts:79-81, src/features/auth/AuthCard.tsx:36
**Feature:** After sign-in, send the user to the same-site path in `?next=`, otherwise to /home.
**Problem:** safeNextPath only checks the first two characters, so `?next=/%09/evil.example` passes (it starts with "/" then a tab); the URL parser strips the tab, location.assign resolves it to `//evil.example`, and a freshly signed-in user is sent to an attacker's site.
**Fix:** In safeNextPath, return the fallback when raw is null; otherwise build a URL from raw with location.origin as the base inside try/catch, return the fallback when the build throws or when the URL's origin is not location.origin, and return its pathname + search + hash when it matches.

### F2 — Gemini check endpoint has no per-user limit
**Severity:** HIGH
**Category:** security
**Location:** src/app/api/pay/check/route.ts:15-22, src/server/check/quick-check.ts:68-91
**Feature:** One paid Gemini call per turn of Auntie's quick check, for signed-in users.
**Problem:** Anyone can sign up for free and call POST /api/pay/check in a loop. Each call is a Gemini request, retried and then failed over to a second model, with no rate limit or quota, so the project's API key can be drained without limit.
**Fix:** Add a transactional per-uid counter in users.repository (fields checkWindowStart, checkCount on users/{uid}; reset when the window is older than 1 hour; throw ApiError(429, "RATE_LIMITED", …) at 30 calls) and call it as the first line of the route handler, before the body is parsed.

### F3 — Logout navigates as if it succeeded when the session was not cleared
**Severity:** HIGH
**Category:** security
**Location:** src/services/auth.service.ts:50-52, src/features/settings/LogoutButton.tsx:12-22
**Feature:** Log out revokes the session server-side, clears the cookie and sends the user to /login.
**Problem:** signOut ignores the response and a rejected fetch, and LogoutButton navigates to /login in `finally`. If the DELETE fails (offline, network error), the httpOnly cookie stays valid while the UI shows the user as logged out, which matters on a shared device.
**Fix:** Make authService.signOut throw when fetch rejects or res.ok is false. In LogoutButton, clear storage and call location.assign only after it succeeds; in catch, set pending to false and render an inline role="alert" message telling the user that logout failed and to try again.

### F4 — Pay inputs are thrown away, and Auntie scores a fixed transfer
**Severity:** HIGH
**Category:** consistency
**Location:** src/features/pay/AmountPad.tsx:54, src/features/pay/AmountPad.tsx:112, src/features/pay/PayScreen.tsx:22, src/features/pay/PayScreen.tsx:42, src/features/pay/PayDesktop.tsx:44, src/features/pay/PayDesktop.tsx:65, src/features/pay/PayDesktop.tsx:73, src/features/pay/PayDesktop.tsx:82, src/features/pay/PayDesktop.tsx:101, src/features/pay/ReviewScreen.tsx:14, src/features/pay/ReviewScreen.tsx:22, src/features/pay/ReviewScreen.tsx:41, src/features/pay/CheckScreen.tsx:40, src/features/pay/CheckDesktop.tsx:73, src/features/pay/CheckDesktop.tsx:77, src/server/check/transfer.ts:16, src/server/check/quick-check.ts:69
**Feature:** The user enters an amount, payee and reference, reviews that transfer, and Auntie checks it.
**Problem:** The amount, payee choice and reference live only in local component state. Review, Check and the server always use S$1,850 to Kelvin Tan, so a user who sends S$50 to Mum is reviewed and questioned about a different transfer.
**Fix:** Keep the draft transfer in a client store that all the pay screens read and write, and send payeeId, amountSgd and reference to /api/pay/check. The server builds TransferFacts from a server-side record of demo payees instead of DEMO_TRANSFER (Phase 2 and 3 tasks).

### F5 — Verdict screens ignore the live check result
**Severity:** HIGH
**Category:** consistency
**Location:** src/features/pay/QuickCheckProvider.tsx:9-13, src/features/pay/QuickCheckProvider.tsx:46-59, src/features/pay/CheckScreen.tsx:119, src/features/pay/CheckDesktop.tsx:144, src/features/verdicts/WarnScreen.tsx:10, src/features/verdicts/WarnScreen.tsx:16, src/features/verdicts/WarnScreen.tsx:20, src/features/verdicts/WarnScreen.tsx:41, src/features/verdicts/BlockedScreen.tsx:13, src/features/verdicts/BlockedScreen.tsx:17, src/features/verdicts/ScoreScreen.tsx:5-15, src/features/verdicts/ScoreScreen.tsx:20-30
**Feature:** After Gemini's verdict, show that verdict's score, reasons and transfer on the warn, blocked or score page.
**Problem:** The verdict only picks a route. The warn page always shows S$480 to Jia Hui Lim with a score of 54, and the blocked and score pages always show 86. The score page's rule points (+20/+15/+11) also don't match scoreRules (+16/+10/+12/+8). A "pass" goes to /home with nothing recorded.
**Fix:** Save the final CheckResult (with the rule flags) and the checked transfer in a client store when done is true. Render the warn, blocked and score pages from it, and keep the current demo values as a fallback when the store is empty.

### F6 — The warn screen cannot pay or cancel
**Severity:** HIGH
**Category:** ux
**Location:** src/features/verdicts/WarnScreen.tsx:43, src/features/verdicts/WarnScreen.tsx:60, src/features/verdicts/WarnScreen.tsx:61
**Feature:** Typing the confirmation phrase lets the user pay anyway; Cancel abandons the transfer.
**Problem:** "Pay anyway" and "Cancel" have no handler or href, and the confirmation input is never read or checked, so the user is stuck on this verdict page.
**Fix:** Make the screen a client component, control the input, and enable "Pay anyway" only when the input, trimmed and upper-cased, equals "SEND <whole amount>". Then clear the transfer store and navigate to ROUTES.HOME. Give Cancel href={ROUTES.HOME}.

### F7 — The blocked screen is a dead end on mobile
**Severity:** HIGH
**Category:** ux
**Location:** src/features/verdicts/BlockedScreen.tsx:9, src/features/verdicts/BlockedScreen.tsx:57
**Feature:** Explains the block and lets the user call their contact, appeal or leave.
**Problem:** The screen has no back header, no bottom nav and no home link, and "Appeal this block" has no handler or href. On phones, the only ways out are a phone call or the score page, whose back button returns here.
**Fix:** Add a Link to ROUTES.HOME labelled "Back to home" under "See how she scored it". Render "Appeal this block" with disabled and aria-disabled="true" until an appeal flow exists.

### F8 — Cancel and payee controls in the pay flow do nothing
**Severity:** HIGH
**Category:** ui
**Location:** src/features/pay/ReviewScreen.tsx:60, src/features/pay/PayDesktop.tsx:57, src/features/pay/PayDesktop.tsx:124, src/features/pay/PayScreen.tsx:22-36, src/features/pay/PayScreen.tsx:42-46
**Feature:** Cancel a transfer, add or pick a payee.
**Problem:** "Cancel transfer" and "Cancel" have no handler or href. "Add a payee" links back to the page it is on. The mobile "To" card announces a dialog (aria-haspopup) that doesn't exist. The recent-payee buttons have no handler, and aria-pressed is hard-coded to Kelvin.
**Fix:** Give both Cancel buttons href={ROUTES.HOME}. Render "Add a payee" as a disabled control until an add-payee flow exists. Make the mobile "To" card a non-interactive display of the selected payee. Make the recent-payee buttons set the payee in the transfer store, with aria-pressed taken from the store.

### F9 — Ask Auntie chat is not wired, and Enter reloads the page
**Severity:** HIGH
**Category:** bug
**Location:** src/features/ask/AskMobile.tsx:28, src/features/ask/AskMobile.tsx:40-42, src/features/ask/AskMobile.tsx:45-61, src/features/home/HomeDesktop.tsx:82-104
**Feature:** Type or tap a suggested question and get Auntie's answer about your ledger.
**Problem:** Neither form has an onSubmit, and Send is type="button". Each form has a single text input, so pressing Enter submits it as a GET to the current URL, which reloads the page and loses the text. Send, the suggestion chips and "Play her reply aloud" do nothing.
**Fix:** Add POST /api/ask using withHandler({auth:true}), a zod transcript schema matching /api/pay/check, the same per-uid limit as T1.2, and generate() with a system prompt built from the demo ledger. Add askService. Turn AskMobile and the HomeDesktop chat form into client components with transcript state, an onSubmit that calls preventDefault and sends the message, chips that send their own label, and the speaker button disabled.

### F10 — Settings for tone, language and voice are never saved
**Severity:** HIGH
**Category:** bug
**Location:** src/features/settings/SettingsScreen.tsx:22, src/features/settings/SettingsScreen.tsx:29, src/features/settings/SettingsScreen.tsx:40, src/features/settings/SettingsScreen.tsx:59-69, src/features/settings/SettingsDesktop.tsx:38, src/features/settings/SettingsDesktop.tsx:53, src/features/settings/SettingsDesktop.tsx:71
**Feature:** The user picks Auntie's tone, language and whether voice replies are on.
**Problem:** These are uncontrolled inputs that nothing reads, so every choice resets on reload. The mobile voice-replies switch hard-codes aria-checked="true", has no handler and cannot be turned off. Mobile and desktop disagree with each other after any change.
**Fix:** Add a persisted preferences store (tone, language, voiceReplies). Render these controls through shared client components that read and write the store on both layouts, and clear that store on logout.

### F11 — Settings "Change" and "Edit" open unrelated screens
**Severity:** HIGH
**Category:** ux
**Location:** src/features/settings/SettingsScreen.tsx:71-80, src/features/settings/SettingsScreen.tsx:81-90, src/features/settings/SettingsDesktop.tsx:99, src/features/settings/SettingsDesktop.tsx:112
**Feature:** Change the trusted contact; edit the savings goal.
**Problem:** "Change" (trusted contact) opens /pay/blocked, a "Payment stopped" alert. "Edit" (savings goal) opens /roast. Neither lets the user change anything.
**Fix:** Replace each of the four Links with a non-link row or label, and render "Change" and "Edit" as disabled controls until a contact editor and a goal editor exist.

### F12 — History filter chips don't filter
**Severity:** HIGH
**Category:** ui
**Location:** src/features/ledger/LedgerScreen.tsx:14-21, src/features/ledger/LedgerDesktop.tsx:49-56
**Feature:** Filter the decision log by All, Payments, Roasts or Blocks.
**Problem:** The chips have no handler, aria-pressed is fixed to "All", and the list always shows every entry.
**Fix:** Make both components client components with filter state. Show Payments as tag ≠ "roast", Roasts as tag = "roast" and Blocks as tag = "blocked". Set aria-pressed and the active styling from the state.

### F13 — Other action buttons do nothing
**Severity:** HIGH
**Category:** ui
**Location:** src/features/roast/RoastMobile.tsx:47, src/features/roast/RoastDesktop.tsx:71, src/features/roast/RoastDesktop.tsx:72, src/features/payees/PayeeScreen.tsx:60, src/features/payees/PayeeScreen.tsx:61, src/features/pay/CheckScreen.tsx:127, src/features/pay/CheckDesktop.tsx:154, src/features/demo/DemoScreen.tsx:49, src/features/demo/DemoScreen.tsx:56, src/features/demo/DemoScreen.tsx:71, src/features/demo/DemoScreen.tsx:79
**Feature:** Cancel a subscription, ask Auntie about the roast, report or remove a payee, answer by voice, and run the demo controls.
**Problem:** Every button listed has no onClick or href. Desktop "Ask Auntie about it" has no href, while the mobile version links to /ask.
**Fix:** Give desktop "Ask Auntie about it" href={ROUTES.ASK} and Demo "Fire" href={ROUTES.PAY_REVIEW}. Render the rest with disabled and aria-disabled="true" until each has a backend.

## Plan

### Phase 1 — Security
- **T1.1** Harden the post-login redirect — fixes F1 — src/services/auth.service.ts:79-81 — Rewrite safeNextPath to compare origins with a URL parsed against location.origin inside try/catch; return pathname + search + hash on a match, otherwise the fallback — done when: signing in from /login?next=/%09/example.com lands on /home, and /login?next=/pay lands on /pay.
- **T1.2** Rate-limit Gemini calls per user — fixes F2 — src/server/repositories/users.repository.ts (new export consumeCheckQuota), src/app/api/pay/check/route.ts:16 — Add a transaction on users/{uid} that resets checkWindowStart/checkCount when the window is older than 1 hour, throws ApiError(429, "RATE_LIMITED", "Auntie needs a break. Try again later.") when checkCount ≥ 30, and otherwise increments it; await it with user.uid first in the handler — done when: the 31st POST within an hour returns 429 RATE_LIMITED and the check screen shows that message.
- **T1.3** Make logout fail visibly — fixes F3 — src/services/auth.service.ts:50-52, src/features/settings/LogoutButton.tsx:12-22 — signOut throws on fetch rejection or !res.ok; LogoutButton clears storage and calls location.assign only on success, and on failure resets pending and shows an inline role="alert" error — done when: with the network offline, Log out leaves the user on Settings with an error, and online it lands on /login with the cookie gone.

### Phase 2 — Shared state and check API contract
- **T2.1** Add the transfer draft store — fixes F4 — src/store/transfer.store.ts (new), src/store/index.ts — Use createStore (not persisted) with payeeId (default "kelvin-tan"), amountSgd (default 1850), reference (default "Investment slot deposit"), setPayee, setAmountSgd, setReference and reset; export a client-side DEMO_PAYEES list (kelvin-tan, mum, jia-hui-lim, ravi with initials, name, account mask, meta) from src/features/pay/payees.ts (new) — done when: the store and the list import cleanly and tsc passes.
- **T2.2** Add the check result store — fixes F5 — src/store/check.store.ts (new), src/store/index.ts — Use createStore (not persisted) with result: CheckResult | null, transfer snapshot { payeeId, amountSgd, reference } | null, setOutcome and clear — done when: the store imports cleanly and tsc passes.
- **T2.3** Score the submitted transfer on the server — fixes F4, F5 — src/server/check/transfer.ts:15-25, src/server/check/quick-check.ts:68-70, src/server/check/quick-check.ts:106-117, src/app/api/pay/check/route.ts:6-12, src/types/check.ts:7-23, src/services/check.service.ts:6 — Replace DEMO_TRANSFER with DEMO_PAYEES keyed by the same four ids (name, payeeAgeMinutes, priorTransfersToPayee, scamReports; shared medianTransferSgd 120 and availableSgd 2184.6). Extend the zod body with transfer { payeeId: enum of the keys, amountSgd: number > 0 and ≤ 10,000,000, reference: trimmed string ≤ 140 }. Change runQuickCheck to take (transcript, transfer) and build TransferFacts from it. Add flags: string[] to CheckResult and return rules.flags. Add transfer to CheckRequest — done when: a POST for 50 to "mum" returns a rulesScore with no "First transfer" flag, and a POST without transfer returns 400.

### Phase 3 — Wire the payment flow screens
- **T3.1** Write the amount to the store — fixes F4 — src/features/pay/AmountPad.tsx:53-57, src/features/pay/AmountPad.tsx:111-128 — Seed both inners from the store's amountSgd (converted to the current currency). On every keypad press, and on AmountField blur, call setAmountSgd(Number(value) / currency.rate) — done when: typing 50 on the keypad or in the desktop field and opening Review shows 50 in the chosen currency.
- **T3.2** Wire mobile payee selection — fixes F4, F8 — src/features/pay/PayScreen.tsx:7-12, src/features/pay/PayScreen.tsx:22-68 — Add "use client". Build RECENT from DEMO_PAYEES. Each recent button calls setPayee(id), with aria-pressed set to (payeeId === id). Replace the "To" button with a div showing the selected payee's avatar, name and a New tag when its meta says new, with no aria-haspopup — done when: tapping Mum updates the To card and Review shows Mum.
- **T3.3** Wire the desktop pay form and review panel — fixes F4, F8 — src/features/pay/PayDesktop.tsx:9-13, src/features/pay/PayDesktop.tsx:36-66, src/features/pay/PayDesktop.tsx:73-101, src/features/pay/PayDesktop.tsx:124 — Add "use client". Drive the radios with checked={payeeId === p.id} and onChange setPayee. Make the reference input controlled by the store. Render the review panel amount, payee and reference from the store. Make "Add a payee" a disabled control. Give Cancel href={ROUTES.HOME} — done when: choosing Jia Hui Lim with reference "Dinner" updates the review panel, and Cancel goes to /home.
- **T3.4** Wire the mobile review screen — fixes F4, F8 — src/features/pay/ReviewScreen.tsx:7-63 — Add "use client". Read the amount, payee, account mask and reference from the store and DEMO_PAYEES. Point the payee Link at ROUTES.PAYEE(payeeId) only when payeeId is "kelvin-tan", and render it as a div otherwise. Give "Cancel transfer" href={ROUTES.HOME} — done when: Review shows the amount and payee entered on /pay, and Cancel transfer goes to /home.
- **T3.5** Send the real transfer to the check and keep the outcome — fixes F4, F5, F13 — src/features/pay/QuickCheckProvider.tsx:46-59, src/features/pay/CheckScreen.tsx:40, src/features/pay/CheckScreen.tsx:127-133, src/features/pay/CheckDesktop.tsx:73-77, src/features/pay/CheckDesktop.tsx:154-160 — In ask, include transfer from the transfer store in checkService.next, and call setOutcome(res, transfer) when res.done is true. Render the header amount and payee from the store. Set disabled and aria-disabled="true" on both mic buttons — done when: a check on 50 to Mum shows "50 to Mum" in the header, and after the verdict the check store holds that result.
- **T3.6** Render the warn screen from the outcome and wire its actions — fixes F5, F6 — src/features/verdicts/WarnScreen.tsx:7-63 — Add "use client". Read result and transfer from the check store, falling back to the current demo values when empty. Show the score, reasons as the "things that worry her" list, the payee and the amount. Use the label "Type SEND <whole amount> to pay anyway". Control the input. Enable "Pay anyway" only on an exact match, then call transfer reset and check clear, then router.push(ROUTES.HOME). Give Cancel href={ROUTES.HOME} — done when: after a warn verdict on 480 to Jia Hui Lim, typing "SEND 480" enables Pay anyway and it lands on /home, and Cancel lands on /home.
- **T3.7** Render the blocked screen from the outcome and add an exit — fixes F5, F7 — src/features/verdicts/BlockedScreen.tsx:7-69 — Add "use client". Read score, amount and payee from the check store, falling back to the demo values. Render "Appeal this block" with disabled and aria-disabled="true". Add a Link to ROUTES.HOME labelled "Back to home" after "See how she scored it" — done when: a block verdict shows its own score and payee, and the phone layout can reach /home from the page.
- **T3.8** Render the score explainer from the outcome — fixes F5 — src/features/verdicts/ScoreScreen.tsx:5-30 — Add "use client". When the check store has a result, render the title as "Why <score>", the header as "Rules <rulesScore> + Model <modelScore>", the RiskMeter as score, rule signals as result.flags, model flags as result.reasons, and the threshold row marked as the verdict; otherwise keep the current demo arrays — done when: after a live check, the explainer's numbers equal the check screen's numbers.

### Phase 4 — Remaining dead controls and settings
- **T4.1** Build the Ask Auntie chat — fixes F9 — src/app/api/ask/route.ts (new), src/server/ask/ask.ts (new), src/services/ask.service.ts (new), src/constants/auth.ts:11-15, src/features/ask/AskMobile.tsx:7-64, src/features/home/HomeDesktop.tsx:82-104 — Add ENDPOINTS.ASK "/api/ask". The route uses withHandler({auth:true}) with a zod transcript (same shape and limits as /api/pay/check) and consumeCheckQuota, and calls generate() with a system prompt containing the ledger ENTRIES and leaks. The service posts through api. AskMobile and a new client HomeAskForm (used in HomeDesktop) keep the transcript in state; onSubmit calls preventDefault and sends; chips send their own text; the speaker button is disabled — done when: pressing Enter or tapping a chip on /ask or desktop /home shows Auntie's reply without a page reload.
- **T4.2** Persist tone, language and voice, and fix the settings links — fixes F10, F11 — src/constants/storage-keys.ts:1-3, src/store/preferences.store.ts (new), src/store/StoreHydration.tsx:9-16, src/features/settings/ToneOptions.tsx (new), src/features/settings/LanguageSelect.tsx (new), src/features/settings/VoiceSwitch.tsx (new), src/features/settings/SettingsScreen.tsx:19-97, src/features/settings/SettingsDesktop.tsx:30-75, src/features/settings/SettingsDesktop.tsx:99-114, src/features/settings/LogoutButton.tsx:18 — Add STORAGE_KEYS.PREFERENCES "auntie-ledger:preferences". Create a createPersistedStore with tone ("roast"), language ("Singlish"), voiceReplies (true) and setters, and rehydrate it in StoreHydration alongside currency. Build the three client controls (mobile and desktop variants by prop) bound to the store, and use them in place of the uncontrolled inputs. Replace the four "Change"/"Edit" Links with plain rows whose action is a disabled control. Clear the preferences storage on logout — done when: choosing Gentle, Manglish and voice off on mobile survives a reload and shows the same values on desktop, and Change/Edit no longer navigate.
- **T4.3** Make the history filters work — fixes F12 — src/features/ledger/LedgerScreen.tsx:1-53, src/features/ledger/LedgerDesktop.tsx:1-98 — Add "use client" and filter state ("All" | FILTERS[number]). Filter ENTRIES: Payments means tag !== "roast", Roasts means tag === "roast", Blocks means tag === "blocked". Each chip sets the state, with aria-pressed and the teal styling following the state — done when: tapping Blocks shows only the two Blocked rows on both layouts.
- **T4.4** Fix the roast actions — fixes F13 — src/features/roast/RoastMobile.tsx:47, src/features/roast/RoastDesktop.tsx:71-74 — Give desktop "Ask Auntie about it" href={ROUTES.ASK}. Set disabled and aria-disabled="true" on both "Cancel StreamPlus" buttons — done when: desktop "Ask Auntie about it" opens /ask, and Cancel StreamPlus shows as disabled.
- **T4.5** Disable the payee actions that have no backend — fixes F13 — src/features/payees/PayeeScreen.tsx:60-61 — Set disabled and aria-disabled="true" on "Report this payee" and "Remove payee" — done when: both render as disabled.
- **T4.6** Wire or disable the demo controls — fixes F13 — src/features/demo/DemoScreen.tsx:49, src/features/demo/DemoScreen.tsx:56, src/features/demo/DemoScreen.tsx:71, src/features/demo/DemoScreen.tsx:79 — Give "Fire" href={ROUTES.PAY_REVIEW}. Set disabled and aria-disabled="true" on Seed, Jump and Reset — done when: Fire opens /pay/review, and the other three show as disabled.

## Executor rules
Change only what a task specifies. No refactors, renames, formatting, or new dependencies. Do not alter public APIs or schemas unless told. Stop and report if a task conflicts with the actual file.
