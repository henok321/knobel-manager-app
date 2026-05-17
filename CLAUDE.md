# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Knobel Manager is a tournament management application for the dice game "Knobeln" (also known as "Schocken"). React 19 +
TypeScript + Redux Toolkit + Mantine UI v9, built with Vite. Auth is delegated to Firebase (JWT); all domain data comes
from a separate backend service ([knobel-manager-service](https://github.com/henok321/knobel-manager-service)). Auth
flow diagram: see README.md.

## Development Commands

```bash
nvm install && nvm use          # Node 26 (per .nvmrc)
npm install -g corepack        # Node 26+ no longer bundles corepack
corepack enable                # required for pnpm
pnpm install
```

```bash
# Dev servers
pnpm local               # vite --mode development (proxies /api → VITE_API_URL, default localhost:8080)
pnpm prod                # vite --mode production (talks to deployed API)

# Quality (one entry point each — there are no separate `lint`/`format` scripts)
pnpm fix                 # biome check --write .  (auto-fix lint + format)
pnpm check               # tsc --noEmit && biome ci . && i18next-cli status && i18next-cli lint && i18next-cli extract --ci
pnpm test                # jest (single file: pnpm test <path>;   watch: pnpm test --watch)
pnpm knip                # unused-files/deps audit (--strict)
pnpm knip:fix            # knip --fix --format (auto-remove unused exports/files)

# Build & deploy
pnpm build               # tsc -b && vite build --mode production
pnpm deploy              # build + firebase deploy --only hosting

# Code generation (overwrites src/generated — never edit by hand)
pnpm api:gen             # @hey-api/openapi-ts; pulls spec from https://api.knobel-manager.de/openapi.yaml
```

`pnpm fix` covers everything Biome handles. `pnpm check` is the gate that mirrors CI — run it before declaring work
done. lint-staged runs `tsc --noEmit`, `i18next-cli lint`, and `biome check --write` on commit (Husky `pre-commit`).

## Architecture

### State management — normalized Redux

Redux Toolkit with `createEntityAdapter` per slice. Four slices live under `src/slices/`: `games`, `teams`, `players`,
`tables`. Each has `actions.ts` (async thunks), `slice.ts` (reducers + selectors + `extraReducers`), and `hooks.ts`
(`useGames`, `useTeams`, `usePlayers`, `useTables`).

Relationships are stored as **ID arrays** (e.g. `Game.teams: number[]`, `Team.players: number[]`), not nested objects.
Entity types live in `src/slices/types.ts`. Cross-slice coordination — e.g. creating a team appending its ID to the
parent game's `teams` array, or deleting a team removing the ID — is done via `extraReducers`. When you add a new
mutation, mirror this pattern: the mutation lives in its own slice, but parent slices subscribe via `extraReducers` to
stay in sync. There's a `cross-slice.test.ts` at `src/slices/cross-slice.test.ts` that locks in this behavior.

Async thunks use the standard `pending/fulfilled/rejected` lifecycle. Selectors are memoized with `createSelector`.
Cross-slice utilities sit at `src/slices/actions.ts` (`fetchAll`, `resetStore`) and `src/slices/normalize.ts`.

### Auth

Firebase Auth (`src/auth/`):
- `AuthContext.tsx` exposes `loginAction` / `logOut` via React Context.
- `useAuth.ts` is the consumer hook.
- `ProtectedRoute.tsx` wraps protected routes; redirects to `/login` if unauthenticated.
- `firebaseConfig.ts` is intentionally checked in — Firebase API keys are public and secured via domain restrictions.
- `src/api/apiClient.ts` is the only HTTP client; it creates a `@hey-api/client-fetch` client with an `auth` callback
  that attaches the Firebase JWT to every request. Don't bypass it.

### Routing (React Router v7)

`/login` (public), `/` → `/games`, `/games`, `/games/:gameID`, `/games/:gameID/print`. Everything except `/login` is
gated by `<ProtectedRoute>` (see `src/App.tsx`). Page components are lazy-loaded with `React.lazy`.

### API client

`src/api/apiClient.ts` is the single entry point. Base URL is `VITE_API_URL` (env). In dev, Vite proxies `/api/*`
to the backend with a path rewrite (`/api/games` → `/games`), see `vite.config.ts`. In Jest (jsdom), MSW handlers in
`src/test/handlers/` intercept absolute URLs at `http://localhost/api`.

Generated types and clients live in `src/generated/` (produced by `pnpm api:gen` from the deployed OpenAPI spec via
`@hey-api/openapi-ts` with the `@hey-api/client-fetch` plugin). **Never edit `src/generated/` by hand** — changes are
overwritten on regeneration. Use `src/generated/types.gen.ts` for request/response typing.

### Internationalization — type-safe i18next

Config: `src/i18n/i18nConfig.ts` (runtime, `fallbackLng: 'en'`). Detection order: query string → localStorage → cookie →
browser. Translation files: `src/i18n/locales/{en,de}/*.json`. Extract config: `i18next.config.ts`.

Type augmentation in `src/i18n/i18next.d.ts` types `CustomTypeOptions` against EN's JSON via `typeof`. `defaultNS` is
declared as an array of all namespaces, so `t('namespace:key')` is type-checked. EN is the source of truth.

**Layered enforcement** (each layer covers a different concern):

| Concern                            | Caught by                                     | Stage                       |
| ---------------------------------- | --------------------------------------------- | --------------------------- |
| EN has the key                     | `tsc --noEmit` (type augmentation against EN) | edit-time                   |
| DE has the key (structurally)      | `i18next-cli extract --ci`                    | `pnpm check`                |
| Every secondary locale is complete | `i18next-cli status`                          | `pnpm check`                |
| No hardcoded strings in code       | `i18next-cli lint`                            | `pnpm check` + lint-staged  |
| Runtime safety net                 | `fallbackLng: 'en'`                           | runtime                     |

`tsc` validates only the *source* language by design — that mirrors the workflow: author EN keys first, translate DE
later. `extract --ci` and `status` are what guarantee DE catches up before merge.

**Adding new keys**: write the key in both `en/<namespace>.json` AND `de/<namespace>.json` manually before referencing
it in code. `pnpm fix` no longer auto-creates empty placeholders — that was removed deliberately so missing keys
surface as `tsc` errors instead.

**Cleaning drift**: when `pnpm check` fails on `extract --ci` (unused keys, sort order), run
`pnpm exec i18next-cli extract` to apply the changes.

**Avoid dynamic keys**: never call `t()` with a template literal (`` t(`status.${variant}`) ``). Type augmentation
only validates static literal keys, and the extractor can't see them. Branch on the variant with a `switch` (or lookup
map), call `t()` with a static literal in each arm, and end the switch with `assertNever(value)` from
`src/utils/assertNever.ts` — adding a new variant then fails `tsc` until every branch is wired up.

**Adding a new locale**: add it to `locales` in `i18next.config.ts` and to `supportedLngs` in `i18nConfig.ts`. `status`
covers all configured locales automatically. Type augmentation doesn't change (still EN).

**Debugging missing keys**: `pnpm exec i18next-cli status de --hide-translated`.

### Layout structure

`src/App.tsx` is the composition root. The persistent shell is `src/shared/layout/Layout.tsx` (wraps `Header` + page
content + `Footer`); `src/shared/userMenu/` holds the language picker, color-scheme toggle, and user menu. Page entry
points are under `src/pages/` — `Login.tsx` and `games/{Games,GameDetail,GameForm,PrintView}.tsx` plus subdirs
`panels/`, `components/`, and `print-views/` for the game-detail interior. Shared utilities sit at `src/utils/`
(currently `assertNever.ts`, `gameStatusHelpers.tsx`).

## TypeScript

`tsconfig.json` is strict, with `noUncheckedIndexedAccess`, `noImplicitOverride`, `noUnusedLocals`/`Parameters`,
`useUnknownInCatchVariables`, `noFallthroughCasesInSwitch`, `allowUnreachableCode: false`, and module resolution
`bundler` (Vite). Implications:

- Array/object access returns `T | undefined` — handle it explicitly. Don't paper over with non-null assertions unless
  the invariant is genuinely enforced upstream (Biome leaves `noNonNullAssertion` off, but use sparingly).
- Catch variables are `unknown` — narrow before use.
- No `any`. Biome enforces `noExplicitAny: error`.
- Use `assertNever` in switch defaults over union types so adding a variant breaks the build.

## Testing

Jest + ts-jest + jsdom. Setup: `jest.setup.js`. Test files: `*.test.{ts,tsx}` / `*.spec.{ts,tsx}` co-located with the
code under test. CSS imports map to `identity-obj-proxy`; static assets to `__mocks__/fileMock.js`. MSW handlers for
HTTP mocking live in `src/test/handlers/`. The Redux cross-slice contract has dedicated tests at
`src/slices/cross-slice.test.ts` — when changing entity relationships, update or add to those.

## Environment

`.env.development` and `.env.production` provide `VITE_API_URL`:
- dev: `http://localhost:8080`
- prod: `https://api.knobel-manager.de`

If the local backend isn't reachable at `http://localhost:8080/health`, fall back to `pnpm prod` (deployed API).

## Package manager

**pnpm only** (`packageManager: pnpm@11.1.2`, enforced by `engines`). Never use `npm` or `yarn`; package scripts must
shell out via `pnpm` (e.g. `pnpm exec ...`).

## Development Guidelines

### Communication

- German honesty: don't sugar-coat questions or answers, be direct and pragmatic.

### Git workflow

- **NEVER** commit without asking first.
- **NEVER EVER** push without explicit permission.
- Brief, descriptive commit messages. **Never list Claude as an author / co-author.**

### Code quality

- Senior-engineer standard: clean design, modularity, clear boundaries.
- Balance DRY with locality — prefer clarity over premature abstraction.
- Tests live next to the code under test.
- Comments explain *why* (non-obvious constraints, domain decisions). Don't narrate *what* the code does — let the
  identifiers carry that.

### Component design

- Single responsibility, composition over inheritance.
- Heavy logic belongs in hooks or utilities, not components.
- `React.memo` for expensive pure components; `useCallback`/`useMemo` only when re-render churn is real.
- Keep `useEffect` dependency arrays correct — stale closures are a recurring class of bug here.

### Type safety

- No `any`. Use domain types or `unknown` + type guards.
- Always handle `undefined` from indexed access.
- Discriminated unions for variants; reach for `Pick`/`Omit`/`Record`/`Partial` rather than re-defining shapes.
- Type event handlers explicitly (`React.ChangeEvent<...>`, `React.MouseEvent<...>`).
- Exhaustive `switch` over unions, ending with `assertNever(value)`. Especially valuable for `GameStatus`, `GameTab`,
  async-thunk status, and any `t()` lookup keyed off a union.

### Localization

- No inline strings. Always `useTranslation()` + a static literal key.
- New keys go in **both** `en/` and `de/` JSON files.
- Namespaced keys, `page.section.label` pattern.

## Code Review Lenses

When reviewing or writing non-trivial changes, apply three lenses:

1. **Frontend / UX** — component boundaries respect SRP; Mantine layout primitives (Grid, Card, breakpoints) used
   correctly; empty states have clear CTAs; status badges consistent; primary card actions full-width; HTTP only via
   `apiClient.ts`; user-friendly errors with graceful 404 handling.
2. **React patterns** — hooks + typed props + composition; no prop drilling (use Redux/Context); correct effect deps;
   memoization where churn is evident; keyboard / ARIA accessibility; route params typed; protected routes wrapped.
3. **TypeScript** — zero `any`; explicit `undefined` handling; discriminated unions; selectors typed and memoized;
   event handlers typed; invalid states made unrepresentable.
