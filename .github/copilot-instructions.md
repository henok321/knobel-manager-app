# GitHub Copilot – Code Review Instructions (Repo-wide)

> **Goal:** Precise, actionable reviews for a React 19 + TypeScript app using Redux Toolkit (normalized state) and
> Mantine v8. Apply the three lenses below and follow the rubric and response format.

## Project Context (what matters)

- **Framework:** React 19 (functional components, hooks)
- **Language:** TypeScript (strict, `noUncheckedIndexedAccess` enabled)
- **State:** Redux Toolkit + `createEntityAdapter` (normalized entities, relations by IDs, cross-slice updates via
  `extraReducers`)
- **UI:** Mantine v8 + PostCSS
- **Routing:** React Router v7 with protected routes
- **API:** Axios client with Firebase JWT interceptor, types from `src/generated/`
- **i18n:** i18next, all user-facing strings must be translation keys in `src/i18n/locales/{en,de}/…`

---

## Lenses (use all 3)

### 1) Frontend-Developer Lens (architecture & UX)

- Check component boundaries, single responsibility, composition over inheritance.
- Verify responsive layouts follow Mantine patterns (Grid, Card, breakpoints).
- Empty states include clear CTAs; status badges consistent; primary actions full-width on cards.
- API integration goes through `src/api/apiClient.ts`; never edit anything in `src/generated/`.
- Errors: user-friendly notifications; handle 404s gracefully.

### 2) React-Pro Lens (React patterns & performance)

- Prefer hooks, typed props, and composition. Avoid prop drilling with context/Redux where appropriate.
- Correct `useEffect` dependencies; avoid stale closures. Memoize expensive pure components (`React.memo`).
- Use `useCallback`/`useMemo` sparingly but where re-render churn is evident.
- Accessibility: labeled inputs, ARIA where needed, keyboard navigable.
- Route params are typed; authenticated routes use `<ProtectedRoute>`; shared layout via `<Layout>`.

### 3) TypeScript-Pro Lens (type safety)

- **No `any`.** Use domain types, `unknown` + type guards only if needed.
- Always handle `undefined` from indexed/object access (`noUncheckedIndexedAccess`).
- Prefer discriminated unions and utility types (`Pick`, `Omit`, `Record`, `Partial`) where helpful.
- Selectors are typed and memoized; thunk generics filled; entity adapter types used correctly.
- Make invalid states unrepresentable; narrow early; keep inference strong.

---

## Non-Negotiables (hard rules)

- ❌ **No inline user-facing text.** Always `useTranslation()` with i18n keys.
- ❌ Do not modify `src/generated/`.
- ✅ Collections use `createEntityAdapter`. Relationships stored as ID arrays, not nested objects.
- ✅ API types come from `src/generated/models/`. Check request/response alignment.
- ✅ Check for `undefined` on any array/dictionary access and optional chains.
- ✅ Keep code self-documenting; comments only for non-obvious decisions.

---

## Review Rubric (what to look for)

### A. State Management (Redux Toolkit)

- Uses entity adapters for CRUD; selectors exported; cross-slice updates via `extraReducers`.
- Normalization: e.g. `Game.teamIds: number[]` not `Team[]`.
- Async flows use `createAsyncThunk` with `pending/fulfilled/rejected` states and typed payloads.

### B. React & UI

- Components are focused; heavy logic extracted to hooks.
- Mantine components & theme used idiomatically; responsive breakpoints correct.
- Error/empty/loading states present (`Loader`, `CenterLoader` where appropriate).

### C. TypeScript

- Zero `any`; strict null checks satisfied; discriminated unions where variants exist.
- Event handlers correctly typed (`React.ChangeEvent`, `React.MouseEvent`, etc.).
- Selectors & thunks have explicit, correct return types.

### D. API & Routing

- Calls go through the typed API client; interceptor handles auth (no manual token plumb).
- 4xx/5xx handled with user-visible feedback and safe fallbacks.
- Routes typed; protected routes enforced; no leaking private routes.

### E. i18n

- All strings are keys in the correct namespace (`page.section.label`).
- New keys added to both `en` and `de`. No hardcoded copy.

### F. Quality & Perf

- Avoid needless renders; verify dependency arrays; large lists virtualized if needed.
- Keep abstractions local; prefer clarity over premature DRY.

---

## Response Format (how Copilot should reply)

- **Title:** Short summary of the main issue(s).
- **Findings:** Numbered list. Each item: **Severity** `[Blocker|Major|Minor|Nit]` · file path:line(s) · concise
  rationale.
- **Fixes:** For each finding, include a minimal patch or code snippet. Use fenced diffs where possible.
- **Checks Passed:** Bulleted list of relevant rubric items that look good.
- **Follow-ups:** Optional risks, tests to add, or performance notes.

**Example snippet format**

```diff
--- a/src/pages/Game/GameCard.tsx
+++ b/src/pages/Game/GameCard.tsx
@@
- <Text>Win rate: {winRate}%</Text>
+ <Text>{t('game.card.winRate', { value: winRate })}</Text>
```
