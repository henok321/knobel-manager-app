# AGENTS.md

Tournament manager for the dice game "Knobeln" — React 19 + TypeScript + RTK Query + Mantine v9, built with Vite. Auth
via Firebase JWT; all domain data from a separate backend (knobel-manager-service).

## Commands

```bash
nvm use                 # Node 26 (.nvmrc); corepack enable required for pnpm
pnpm install

pnpm local              # dev server, proxies /api → localhost:8080
pnpm local:remote       # dev server, proxies /api → deployed API (VITE_API_URL in .env.production)
pnpm fix                # biome check --write . (auto-fix lint + format; no separate lint script)
pnpm check              # CI gate: tsc --noEmit && biome ci && i18next status/lint/extract --ci — run before declaring work done
pnpm test               # node --test, native runner (no jest); single file: pnpm exec node --test <path>
pnpm test:e2e           # Playwright; NOT in CI; writes real data to whatever /api proxies to
pnpm knip               # unused files/exports/deps audit (CI runs it)
pnpm api:gen            # regenerate src/store/api.gen.ts from live backend OpenAPI spec
pnpm build              # tsc -b && vite build --mode production
pnpm deploy             # build + firebase deploy --only hosting
```

pnpm only — never npm or yarn. CI: `check`, `knip`, `test`, `pnpm audit --prod --audit-level=high`, and
`validate-client` (re-runs `api:gen`, fails on drift). Push to `main` deploys to Firebase hosting; PRs get a preview
channel.

## Hard rules

- **`src/store/api.gen.ts` is generated — never edit.** Run `pnpm api:gen && pnpm fix` and commit the result; CI
  re-generates and fails on drift.
- **`src/store/baseApi.ts` is the codegen input — never overwrite.** It's also the only HTTP client (attaches Firebase
  JWT via `prepareHeaders`); don't add fetch/axios elsewhere.
- Cache tags are hand-wired in `src/store/api.ts` (`enhanceEndpoints`), not generated — wire `invalidatesTags` for every
  new mutation there. Only two tag types (`Game`, `Tables`) by design; tags follow the client's nested read model.
- Import domain types from `api.gen.ts`; consume hooks from `api.ts`.
- **No manual memoization** (`React.memo`/`useMemo`/`useCallback`) — React Compiler is enabled and the codebase has
  none.
- **No dynamic i18n keys** — `t()` only with static literal keys; branch with `switch` + `assertNever()` (from
  `src/utils/assertNever.ts`) over union variants.
- New i18n keys must be added to **both** `src/i18n/locales/en/` and `de/` before referencing them (EN is the type
  source of truth; missing keys fail `tsc`). When `pnpm check` fails on `extract --ci` (unused keys, sort order), run
  `pnpm exec i18next-cli extract` to apply changes.
- `src/auth/firebaseConfig.ts` is intentionally checked in — Firebase API keys are public (secured via domain
  restrictions); don't "fix" it.
- Filenames follow the file's kind, not its directory: components PascalCase, function modules camelCase (e.g.
  `utils/confirmModal.tsx`).
- Zero comments by default; when unavoidable, one brief line saying *why*.
- No `any`; handle `undefined` from indexed access (`noUncheckedIndexedAccess` is on); exhaustive switches with
  `assertNever`.

## Architecture in one paragraph

Three-file RTK Query chain: `baseApi.ts` (hand-written) → `api.gen.ts` (generated endpoints + all domain types) →
`api.ts` (tag wiring + re-exported hooks). No hand-written slices/selectors — store just registers the API. Routes:
`/login` public, everything else behind `ProtectedRoute`; pages under `src/pages/games/`. Reuse shared components
(`EmptyStateCard`, `RankingsTable`, `ErrorBoundary`, `CenterLoader`) and utils (`notifyError()`, `openConfirmDialog()`,
`rounds.ts`, `rankings.ts`) instead of re-rolling them.

## Gotchas

- Setup mutations 409 after tables are assigned — route new setup-sensitive mutations through
  `useTeamMutations.reportMutationError` (reset-confirm + retry).
- `ScoreEntryModal` must stay conditionally rendered — permanently mounted, it keeps stale per-player state and writes
  the wrong table's score.
- Round-tables query gates on `isLoading`, not `isFetching` (refetch after saving would blank the cards).
- No local backend? Run `pnpm local:remote` instead of `pnpm local`.
- `.env.production` is intentionally tracked — CI builds depend on it. `.env.e2e` (Playwright credentials) is untracked.
- Transitive dep broken upstream → pin in `pnpm-workspace.yaml` `overrides`, not a reinstall.
- Biome allows `!important` only in `src/pages/games/print-views/print.css`.
- E2e first run: `pnpm exec playwright install chromium`; credentials from untracked `.env.e2e` (`E2E_EMAIL`/
  `E2E_PASSWORD`). Read-only tests consume the tournament the lifecycle test publishes — a `--grep` excluding it makes
  them skip. No cleanup; every run leaves an `E2E Turnier <timestamp>` game.

## Git

- Never commit without asking; never push without explicit permission. No Claude attribution in commits.
- lint-staged runs biome on commit (husky pre-commit); `pnpm check` runs on push (pre-push).
