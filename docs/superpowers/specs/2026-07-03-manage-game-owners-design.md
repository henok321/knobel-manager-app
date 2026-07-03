# Manage Game Owners — Design

**Date:** 2026-07-03
**Repos:** `knobel-manager-app` (frontend), `knobel-manager-service` (backend)
**Branch:** `feature/manage-game-owners` (both repos)

## Context

Games already support multiple owners — the backend stores them as a many-to-many
join table `game_owners(game_id, owner_sub)`, where `owner_sub` is the Firebase UID.
The game creator becomes the sole owner at creation. But there is **no way to add or
remove owners** after that: no endpoints exist, and owners are a read-only field on
the `Game` response showing only opaque UIDs.

Goal: an elegant way to add and remove co-owners of a game from the frontend, keying
on **email** (what a user actually knows about a collaborator), not the UID.

## Constraints discovered

- The frontend generates its API client from the backend OpenAPI spec on GitHub
  **`main`** (`src/store/openapi-config.ts`). So the backend spec must land on `main`
  before the frontend regen reproduces cleanly → **backend PR merges first**.
- The backend has **no users table**. It only ever knows a user's UID + email from
  the verified Firebase JWT. Resolving an arbitrary email → UID requires the Firebase
  Admin SDK (`*auth.Client`, already initialized), which exposes `GetUserByEmail` and
  the batch `GetUsers`.
- Ownership is already gated by `entity.IsOwner(game, sub)`; all owners are equal
  peers (any owner may act). We keep that model — no "primary owner".

## Approach

### Identity: resolve emails live, do not store them

Add by email → backend resolves email → UID via Firebase `GetUserByEmail`, inserts the
join row keyed on UID. Display owners by email → backend resolves UID → email **live**
at read time via a single batched `GetUsers` call.

We deliberately **do not** store the email in `game_owners`. Storing it would be a
denormalization cache to avoid a Firebase read — but Firebase is the source of truth
for identity and is already on every request (the auth middleware verifies the token
against Firebase on each call). A stored copy adds a migration and goes stale when a
user changes their email. Live resolution keeps one source of truth and no migration.

Resolution is **best-effort**: if the lookup fails or a UID can't be resolved, the
owner is returned without an email and the frontend falls back to showing the UID.
Game reads stay as resilient as they are today.

### Backend (`knobel-manager-service`)

- **OpenAPI** (`openapi/openapi.yaml`): add optional `email` to `GameOwner`; add
  `AddOwnerRequest { email }`; add `POST /games/{gameID}/owners` (`addOwner`, 200 →
  `GameResponse`) and `DELETE /games/{gameID}/owners/{ownerSub}` (`removeOwner`,
  200 → `GameResponse`). Returning the updated game refreshes the owner list in one
  round-trip. Regenerate via `make openapi-generate`.
- **Errors** (`pkg/apperror`): `ErrUserNotFound` (422 — email not registered),
  `ErrAlreadyOwner` (409), `ErrLastOwner` (409).
- **Firebase lookup**: widen `middleware.FirebaseAuth` with `GetUserByEmail` and
  `GetUsers` (real `*auth.Client` already satisfies them; the integration mock gains
  two methods). Define a subset interface `game.UserLookup` so the service does not
  import `middleware`. Inject `authClient` into both the games service (add path) and
  the games handler (read-path enrichment).
- **Service** (`pkg/game/service.go`): `AddOwner` (load game → `IsOwner(caller)` →
  `GetUserByEmail` → already-owner guard → insert → reload) and `RemoveOwner` (load →
  `IsOwner(caller)` → owner-exists check → last-owner guard → delete → reload).
- **Repository** (`pkg/game/repository.go`): `AddOwner`, `RemoveOwner` — simple
  create/delete on `game_owners`, mirroring existing queries.
- **Handlers** (`api/handlers/games_handler.go`): `AddOwner` / `RemoveOwner` following
  the `CreateTeam` / `DeleteTeam` shape. One helper `enrichOwnerEmails(ctx, ...*api.Game)`
  — dedupe owner subs → one batched `GetUsers` → fill `GameOwner.Email` — applied
  before writing every game response (`GetGames`, `GetGame`, `CreateGame`, `UpdateGame`,
  `AddOwner`, `RemoveOwner`). Owners appear only on these responses, all in this one file.
- **Routes** (`api/routes/routes.go`): pass `authClient` into the two constructors. No
  manual route wiring — oapi-codegen registers the new operations from the regenerated
  `ServerInterface`.

### Frontend (`knobel-manager-app`)

- Regenerate `generatedApi.ts` (temporarily point `openapi-config.ts.schemaFile` at
  the local spec for the one-off regen, then restore the GitHub-`main` URL; the
  committed file reproduces once the backend spec is on `main`).
- `store/api.ts`: enhance `addOwner` / `removeOwner` with
  `invalidatesTags: [{ type: 'Game', id: arg.gameId }]` (same as the team mutations);
  export `useAddOwnerMutation`, `useRemoveOwnerMutation`.
- `GameViewContent.tsx`: add `'owners'` to `GAME_TYPES`; a `<Tabs.Tab>` +
  `<Tabs.Panel>` rendering `<OwnersPanel game={game} />`.
- New `panels/OwnersPanel/OwnersPanel.tsx`: list `owner.email ?? owner.ownerSub`, a
  "you" `Badge` where `ownerSub === user.uid` (`useAuth()`); inline email `TextInput`
  + Add button → `addOwner`; red `IconTrash` per row → `modals.openConfirmModal` →
  `removeOwner`; remove disabled when `owners.length <= 1`; errors → `notifications.show`.
  **No status gating** — co-organizers can be added at any game status.
- i18n: `owners.*` keys + `tabs.owners` in **both** `en/` and `de/` `gameDetail.json`.

## Deliberately skipped (YAGNI)

- No invite / pending-acceptance flow — direct add; the backend resolves the email now.
- No primary/role distinction — owners remain peers, as today.
- No UID→email cache — live lookup per read; add a TTL cache only if game reads
  measurably get hot (`ponytail:` ceiling noted in code).

## Verification

- **Backend:** `make openapi-generate`, `make lint`, `make test`; service unit tests
  for the three guards (last-owner, already-owner, email-not-found); drive
  `POST` / `DELETE /games/{id}/owners` against the local server with a real token.
- **Frontend:** `pnpm check` (tsc + biome + i18n gates); `pnpm local` against the local
  backend, exercise the Owners tab end-to-end — add by email, "you" badge,
  remove-confirm, last-owner disabled, error on unknown email.

## Rollout ordering

1. Backend PR merges to `main` first (spec lands, frontend regen depends on it).
2. Frontend PR merges after; its committed `generatedApi.ts` matches the merged spec.
