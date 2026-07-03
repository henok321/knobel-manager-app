# Manage Game Owners — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a game owner add and remove co-owners by email, from the game-detail UI.

**Architecture:** Backend gains `POST /games/{gameID}/owners` and `DELETE /games/{gameID}/owners/{ownerSub}`, guarded by the existing `IsOwner` peer check. Emails are resolved live via Firebase Admin (`GetUserByEmail` on add, batched `GetUsers` on read) — never stored. Frontend adds an "Owners" tab rendering the resolved emails with add/remove controls.

**Tech Stack:** Go (net/http, gorm, oapi-codegen, Firebase Admin SDK v4, goose, testcontainers) · React 19 + RTK Query + Mantine v9 + i18next.

## Global Constraints

- Firebase is the only user directory — no users table. Resolve email↔UID via `*auth.Client`.
- Owners are equal peers; any owner may add/remove any owner. No primary owner.
- Email resolution on reads is **best-effort**: on failure, return the owner without an email; never fail the game read.
- Backend spec must merge to `main` before the frontend regen reproduces — **backend PR merges first**.
- Both repos work on branch `feature/manage-game-owners`.
- Frontend: no `any`; handle `undefined` from indexed access; exhaustive `switch` + `assertNever`; no manual memoization; new i18n keys in **both** `en/` and `de/`; server data only via RTK Query hooks from `src/store/api.ts`.
- Backend: `make lint` and `make test` must pass; regenerate with `make openapi-generate` (never hand-edit `gen/`).

---

## Phase A — Backend (`knobel-manager-service`)

### Task A1: OpenAPI spec + regenerate

**Files:**
- Modify: `openapi/openapi.yaml` (schemas `GameOwner`, new `AddOwnerRequest`; two new paths)
- Regenerated: `gen/api/api.gen.go`

**Produces:** `api.GameOwner.Email *string`; `api.AddOwnerRequest{ Email string }`; `ServerInterface.AddOwner(w, r, gameID int)` and `RemoveOwner(w, r, gameID int, ownerSub string)`; `AddOwnerJSONRequestBody`.

- [ ] **Step 1: Add `email` to `GameOwner` and add `AddOwnerRequest`** (already applied — verify present):

```yaml
    GameOwner:
      type: object
      properties:
        gameID: { type: integer, example: 1 }
        ownerSub: { type: string, example: sub-1 }
        email:
          type: string
          description: Resolved live from Firebase; absent if the user cannot be resolved.
          example: owner@example.org
      required: [ gameID, ownerSub ]
    AddOwnerRequest:
      type: object
      properties:
        email: { type: string, example: owner@example.org }
      required: [ email ]
```

- [ ] **Step 2: Add the two paths** (insert after the `/games/{gameID}/setup` block):

```yaml
  /games/{gameID}/owners:
    parameters:
      - { name: gameID, in: path, required: true, schema: { type: integer } }
    post:
      operationId: addOwner
      tags: [ Games ]
      summary: Add an owner to a game by email
      security: [ { bearerAuth: [ ] } ]
      requestBody:
        required: true
        content:
          application/json:
            schema: { $ref: '#/components/schemas/AddOwnerRequest' }
      responses:
        '200': { description: Owner added; updated game returned, content: { application/json: { schema: { $ref: '#/components/schemas/GameResponse' } } } }
        '400': { description: Invalid request }
        '403': { description: Not owner of the game }
        '404': { description: Game not found }
        '409': { description: User is already an owner }
        '422': { description: No user found for the given email }
  /games/{gameID}/owners/{ownerSub}:
    parameters:
      - { name: gameID, in: path, required: true, schema: { type: integer } }
      - { name: ownerSub, in: path, required: true, schema: { type: string } }
    delete:
      operationId: removeOwner
      tags: [ Games ]
      summary: Remove an owner from a game
      security: [ { bearerAuth: [ ] } ]
      responses:
        '200': { description: Owner removed; updated game returned, content: { application/json: { schema: { $ref: '#/components/schemas/GameResponse' } } } }
        '403': { description: Not owner of the game }
        '404': { description: Game or owner not found }
        '409': { description: Cannot remove the last owner }
```

- [ ] **Step 3: Regenerate**

Run: `make openapi-generate`
Expected: `gen/api/api.gen.go` now contains `AddOwner`/`RemoveOwner` in `ServerInterface`, `AddOwnerRequest`, and `Email *string` on `GameOwner`. `git diff gen/` shows only additive changes.

- [ ] **Step 4: Verify it still builds**

Run: `go build ./...`
Expected: FAILS — `apiServer` no longer satisfies `api.ServerInterface` (missing `AddOwner`/`RemoveOwner`). This is the expected red state; Task A6 makes it pass.

- [ ] **Step 5: Commit**

```bash
git add openapi/openapi.yaml gen/api/api.gen.go
git commit -m "feat(api): add owner add/remove operations to spec"
```

### Task A2: Domain errors

**Files:** Modify `pkg/apperror/error.go`

**Produces:** `apperror.ErrUserNotFound`, `apperror.ErrAlreadyOwner`, `apperror.ErrLastOwner`.

- [ ] **Step 1: Add the errors**

```go
	ErrUserNotFound         = errors.New("no user found for the given email")
	ErrAlreadyOwner         = errors.New("user is already an owner")
	ErrLastOwner            = errors.New("cannot remove the last owner")
```

- [ ] **Step 2: Build & commit**

```bash
go build ./pkg/apperror/ && git add pkg/apperror/error.go && git commit -m "feat: add owner-management domain errors"
```

### Task A3: Firebase user lookup seam + mock

**Files:**
- Modify: `api/middleware/auth.go` (widen `FirebaseAuth`)
- Modify: `integrationtests/mock/auth_mock.go` (implement new methods)

**Interfaces produced:**
- `middleware.FirebaseAuth` now also has `GetUserByEmail(ctx, email string) (*auth.UserRecord, error)` and `GetUsers(ctx, identifiers []auth.UserIdentifier) (*auth.GetUsersResult, error)`.

- [ ] **Step 1: Widen the interface** in `api/middleware/auth.go`:

```go
type FirebaseAuth interface {
	VerifyIDToken(ctx context.Context, idToken string) (*auth.Token, error)
	GetUserByEmail(ctx context.Context, email string) (*auth.UserRecord, error)
	GetUsers(ctx context.Context, identifiers []auth.UserIdentifier) (*auth.GetUsersResult, error)
}
```

- [ ] **Step 2: Teach the mock to resolve emails deterministically** — email local-part = UID, so `sub-2@example.org` ⇄ `sub-2`. Replace `integrationtests/mock/auth_mock.go`:

```go
package mock

import (
	"context"
	"fmt"
	"strings"

	"firebase.google.com/go/v4/auth"
)

type FirebaseAuthMock struct{}

func (m FirebaseAuthMock) VerifyIDToken(_ context.Context, idToken string) (*auth.Token, error) {
	if idToken == "health-check-invalid-token" {
		return nil, fmt.Errorf("invalid token")
	}
	return &auth.Token{UID: idToken, Claims: map[string]any{"email": idToken + "@example.org"}}, nil
}

// GetUserByEmail resolves "<uid>@example.org" -> uid. Unknown domains => not found.
func (m FirebaseAuthMock) GetUserByEmail(_ context.Context, email string) (*auth.UserRecord, error) {
	uid, ok := strings.CutSuffix(email, "@example.org")
	if !ok || uid == "" || uid == "ghost" {
		return nil, fmt.Errorf("user not found") // Firebase returns an error the service maps to ErrUserNotFound
	}
	return userRecord(uid), nil
}

// GetUsers echoes back a record per requested UID identifier.
func (m FirebaseAuthMock) GetUsers(_ context.Context, identifiers []auth.UserIdentifier) (*auth.GetUsersResult, error) {
	result := &auth.GetUsersResult{}
	for _, id := range identifiers {
		if uid, ok := id.(auth.UIDIdentifier); ok {
			result.Users = append(result.Users, userRecord(uid.UID))
		}
	}
	return result, nil
}

func userRecord(uid string) *auth.UserRecord {
	return &auth.UserRecord{UserInfo: &auth.UserInfo{UID: uid, Email: uid + "@example.org"}}
}
```

- [ ] **Step 3: Build & commit**

```bash
go build ./... 2>&1 | head   # still red on apiServer only
git add api/middleware/auth.go integrationtests/mock/auth_mock.go
git commit -m "feat: widen FirebaseAuth with user lookup + update mock"
```

### Task A4: Repository add/remove

**Files:** Modify `pkg/game/repository.go`

**Interfaces produced:**
- `(*GamesRepository) AddOwner(ctx, gameID int, sub string) error`
- `(*GamesRepository) RemoveOwner(ctx, gameID int, sub string) error`

- [ ] **Step 1: Add the methods**

```go
func (r *GamesRepository) AddOwner(ctx context.Context, gameID int, sub string) error {
	return r.db.WithContext(ctx).Create(&entity.GameOwner{GameID: gameID, OwnerSub: sub}).Error
}

func (r *GamesRepository) RemoveOwner(ctx context.Context, gameID int, sub string) error {
	return r.db.WithContext(ctx).
		Where("game_id = ? AND owner_sub = ?", gameID, sub).
		Delete(&entity.GameOwner{}).Error
}
```

- [ ] **Step 2: Build & commit**

```bash
go build ./pkg/game/ && git add pkg/game/repository.go && git commit -m "feat: repository add/remove owner"
```

### Task A5: Service add/remove owner

**Files:** Modify `pkg/game/service.go`

**Interfaces produced:**
- `game.UserLookup` interface (subset of `middleware.FirebaseAuth`, defined here to avoid importing `middleware`).
- `NewGamesService(repo *GamesRepository, users UserLookup) *GamesService`.
- `(*GamesService) AddOwner(ctx, gameID int, callerSub, email string) (entity.Game, error)`
- `(*GamesService) RemoveOwner(ctx, gameID int, callerSub, targetSub string) (entity.Game, error)`

- [ ] **Step 1: Add the lookup interface + field + constructor arg**

```go
import "firebase.google.com/go/v4/auth" // add to imports

type UserLookup interface {
	GetUserByEmail(ctx context.Context, email string) (*auth.UserRecord, error)
}

type GamesService struct {
	repo  *GamesRepository
	users UserLookup
}

func NewGamesService(repo *GamesRepository, users UserLookup) *GamesService {
	return &GamesService{repo, users}
}
```

- [ ] **Step 2: Add `AddOwner` and `RemoveOwner`**

```go
func (s *GamesService) AddOwner(ctx context.Context, gameID int, callerSub, email string) (entity.Game, error) {
	game, err := s.FindByID(ctx, gameID, callerSub) // enforces exists + caller IsOwner
	if err != nil {
		return entity.Game{}, err
	}

	record, err := s.users.GetUserByEmail(ctx, email)
	if err != nil {
		return entity.Game{}, apperror.ErrUserNotFound
	}

	if entity.IsOwner(game, record.UID) {
		return entity.Game{}, apperror.ErrAlreadyOwner
	}

	if err := s.repo.AddOwner(ctx, gameID, record.UID); err != nil {
		return entity.Game{}, err
	}

	return s.repo.FindByID(ctx, gameID)
}

func (s *GamesService) RemoveOwner(ctx context.Context, gameID int, callerSub, targetSub string) (entity.Game, error) {
	game, err := s.FindByID(ctx, gameID, callerSub)
	if err != nil {
		return entity.Game{}, err
	}

	if !entity.IsOwner(game, targetSub) {
		return entity.Game{}, entity.ErrGameNotFound // target isn't an owner => 404
	}

	if len(game.Owners) <= 1 {
		return entity.Game{}, apperror.ErrLastOwner
	}

	if err := s.repo.RemoveOwner(ctx, gameID, targetSub); err != nil {
		return entity.Game{}, err
	}

	return s.repo.FindByID(ctx, gameID)
}
```

- [ ] **Step 3: Build** (routes.go still calls old `NewGamesService` signature → expect red)

Run: `go build ./pkg/game/`
Expected: PASS for the package. `go build ./...` still red on `routes` + `apiServer` (fixed in A6).

- [ ] **Step 4: Commit**

```bash
git add pkg/game/service.go && git commit -m "feat: service add/remove owner with email resolution"
```

### Task A6: Handlers, owner-email enrichment, routing

**Files:**
- Modify: `api/handlers/games_handler.go` (constructor gains lookup; `AddOwner`, `RemoveOwner`, `enrichOwnerEmails`; call enrich in all game responses)
- Modify: `api/routes/routes.go` (pass `authClient` to service + handler constructors)

**Interfaces consumed:** A1 generated types; A5 service methods; A3 `middleware.FirebaseAuth`.

- [ ] **Step 1: Handler constructor gains the lookup** — in `games_handler.go`:

```go
type GamesHandler struct {
	gamesService *game.GamesService
	users        middleware.FirebaseAuth
}

func NewGamesHandler(gamesService *game.GamesService, users middleware.FirebaseAuth) *GamesHandler {
	return &GamesHandler{gamesService, users}
}
```

- [ ] **Step 2: Add the enrichment helper** — one batched `GetUsers`, best-effort:

```go
// enrichOwnerEmails fills GameOwner.Email from Firebase, best-effort.
// On any lookup failure the games are returned unchanged (owners without email).
func (h *GamesHandler) enrichOwnerEmails(ctx context.Context, games ...*api.Game) {
	seen := map[string]struct{}{}
	var ids []auth.UserIdentifier
	for _, g := range games {
		for _, o := range g.Owners {
			if _, ok := seen[o.OwnerSub]; ok {
				continue
			}
			seen[o.OwnerSub] = struct{}{}
			ids = append(ids, auth.UIDIdentifier{UID: o.OwnerSub})
		}
	}
	if len(ids) == 0 {
		return
	}

	result, err := h.users.GetUsers(ctx, ids)
	if err != nil {
		slog.WarnContext(ctx, "owner email enrichment failed", "error", err)
		return
	}

	emailByUID := make(map[string]string, len(result.Users))
	for _, u := range result.Users {
		emailByUID[u.UID] = u.Email
	}
	for _, g := range games {
		for i := range g.Owners {
			if email, ok := emailByUID[g.Owners[i].OwnerSub]; ok && email != "" {
				g.Owners[i].Email = &email
			}
		}
	}
}
```

Add imports: `"context"` and `"firebase.google.com/go/v4/auth"`.

- [ ] **Step 3: Call enrich before writing every game response** — in `GetGames`, `GetGame`, `CreateGame`, `UpdateGame`. Pattern for `GetGame` (single):

```go
	apiGame := entityGameToAPIGame(gameByID)
	h.enrichOwnerEmails(ctx, &apiGame)
	response := api.GameResponse{Game: apiGame}
```

For `GetGames` (list), collect pointers then enrich in one call:

```go
	apiGames := make([]api.Game, len(allGames))
	ptrs := make([]*api.Game, len(allGames))
	for i, entry := range allGames {
		apiGames[i] = entityGameToAPIGame(entry)
		ptrs[i] = &apiGames[i]
	}
	h.enrichOwnerEmails(ctx, ptrs...)
	response := api.GamesResponse{Games: apiGames}
```

- [ ] **Step 4: Add the two handlers** (follow `CreateTeam`/`DeleteTeam` shape):

```go
func (h *GamesHandler) AddOwner(writer http.ResponseWriter, request *http.Request, gameID int) {
	ctx := request.Context()
	userContext, ok := middleware.UserFromContext(ctx)
	if !ok {
		JSONError(writer, "User context not found", http.StatusInternalServerError)
		return
	}

	body := api.AddOwnerRequest{}
	if err := json.NewDecoder(request.Body).Decode(&body); err != nil {
		JSONError(writer, err.Error(), http.StatusBadRequest)
		return
	}
	if body.Email == "" {
		JSONError(writer, "Missing required fields", http.StatusBadRequest)
		return
	}

	updated, err := h.gamesService.AddOwner(ctx, gameID, userContext.Sub, body.Email)
	if err != nil {
		switch {
		case errors.Is(err, apperror.ErrNotOwner):
			JSONError(writer, "forbidden", http.StatusForbidden)
		case errors.Is(err, entity.ErrGameNotFound):
			JSONError(writer, "Game not found", http.StatusNotFound)
		case errors.Is(err, apperror.ErrAlreadyOwner):
			JSONError(writer, "Already an owner", http.StatusConflict)
		case errors.Is(err, apperror.ErrUserNotFound):
			JSONError(writer, "No user found for the given email", http.StatusUnprocessableEntity)
		default:
			JSONError(writer, "Internal server error", http.StatusInternalServerError)
		}
		return
	}

	apiGame := entityGameToAPIGame(updated)
	h.enrichOwnerEmails(ctx, &apiGame)
	writer.Header().Set("Content-Type", "application/json")
	writer.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(writer).Encode(api.GameResponse{Game: apiGame}); err != nil {
		slog.ErrorContext(ctx, "Could not write body", "error", err)
	}
}

func (h *GamesHandler) RemoveOwner(writer http.ResponseWriter, request *http.Request, gameID int, ownerSub string) {
	ctx := request.Context()
	userContext, ok := middleware.UserFromContext(ctx)
	if !ok {
		JSONError(writer, "User context not found", http.StatusInternalServerError)
		return
	}

	updated, err := h.gamesService.RemoveOwner(ctx, gameID, userContext.Sub, ownerSub)
	if err != nil {
		switch {
		case errors.Is(err, apperror.ErrNotOwner):
			JSONError(writer, "forbidden", http.StatusForbidden)
		case errors.Is(err, entity.ErrGameNotFound):
			JSONError(writer, "Game or owner not found", http.StatusNotFound)
		case errors.Is(err, apperror.ErrLastOwner):
			JSONError(writer, "Cannot remove the last owner", http.StatusConflict)
		default:
			JSONError(writer, "Internal server error", http.StatusInternalServerError)
		}
		return
	}

	apiGame := entityGameToAPIGame(updated)
	h.enrichOwnerEmails(ctx, &apiGame)
	writer.Header().Set("Content-Type", "application/json")
	writer.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(writer).Encode(api.GameResponse{Game: apiGame}); err != nil {
		slog.ErrorContext(ctx, "Could not write body", "error", err)
	}
}
```

- [ ] **Step 5: Wire constructors** in `api/routes/routes.go` `setup()`:

```go
	gameService := game.NewGamesService(game.NewGamesRepository(app.database), app.authClient)
	// ...
	gamesHandler := handlers.NewGamesHandler(gameService, app.authClient)
```

(`tablesHandler` also uses `gameService`; unchanged — it already receives the service value.)

- [ ] **Step 6: Build**

Run: `go build ./...`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add api/handlers/games_handler.go api/routes/routes.go
git commit -m "feat: owner add/remove handlers + live email enrichment"
```

### Task A7: Integration tests

**Files:**
- Create: `integrationtests/owners_test.go`
- Create: `integrationtests/test_data/games_setup_two_owners.sql`

**Consumes:** the harness in `integration_test.go`; auth mock from A3 (`Bearer sub-1` = owner of game 1 in `games_setup.sql`; email `sub-2@example.org` ⇄ UID `sub-2`).

- [ ] **Step 1: Two-owner fixture** — `games_setup_two_owners.sql` (base `games_setup.sql` seeds game 1 owned by `sub-1`; append a second owner):

```sql
INSERT INTO games (id, game_name, team_size, table_size, number_of_rounds, status)
VALUES (1, 'Game 1', 4, 4, 2, 'setup');
INSERT INTO game_owners (game_id, owner_sub) VALUES (1, 'sub-1'), (1, 'sub-2');
```

- [ ] **Step 2: Write the test table** (`owners_test.go`) — mirror `teams_test.go` structure:

```go
package integrationtests

import (
	"database/sql"
	"net/http"
	"testing"

	_ "github.com/lib/pq"
)

func TestOwners(t *testing.T) {
	tests := map[string]testCase{
		"Add owner by email": {
			method: "POST", endpoint: "/games/1/owners",
			requestBody:    `{"email":"sub-2@example.org"}`,
			requestHeaders: map[string]string{"Authorization": "Bearer sub-1"},
			expectedStatusCode: http.StatusOK,
			setup: func(db *sql.DB) { executeSQLFile(t, db, "./test_data/games_setup.sql") },
			assertions: func(t *testing.T, db *sql.DB) {
				var n int
				_ = db.QueryRow("SELECT count(*) FROM game_owners WHERE game_id=1 AND owner_sub='sub-2'").Scan(&n)
				if n != 1 {
					t.Fatalf("expected sub-2 to be an owner, got %d rows", n)
				}
			},
		},
		"Add owner unknown email": {
			method: "POST", endpoint: "/games/1/owners",
			requestBody:    `{"email":"ghost@example.org"}`,
			requestHeaders: map[string]string{"Authorization": "Bearer sub-1"},
			expectedStatusCode: http.StatusUnprocessableEntity,
			setup: func(db *sql.DB) { executeSQLFile(t, db, "./test_data/games_setup.sql") },
		},
		"Add owner already owner": {
			method: "POST", endpoint: "/games/1/owners",
			requestBody:    `{"email":"sub-1@example.org"}`,
			requestHeaders: map[string]string{"Authorization": "Bearer sub-1"},
			expectedStatusCode: http.StatusConflict,
			setup: func(db *sql.DB) { executeSQLFile(t, db, "./test_data/games_setup.sql") },
		},
		"Add owner not owner": {
			method: "POST", endpoint: "/games/1/owners",
			requestBody:    `{"email":"sub-3@example.org"}`,
			requestHeaders: map[string]string{"Authorization": "Bearer sub-2"},
			expectedStatusCode: http.StatusForbidden,
			setup: func(db *sql.DB) { executeSQLFile(t, db, "./test_data/games_setup.sql") },
		},
		"Remove owner": {
			method: "DELETE", endpoint: "/games/1/owners/sub-2",
			requestHeaders: map[string]string{"Authorization": "Bearer sub-1"},
			expectedStatusCode: http.StatusOK,
			setup: func(db *sql.DB) { executeSQLFile(t, db, "./test_data/games_setup_two_owners.sql") },
			assertions: func(t *testing.T, db *sql.DB) {
				var n int
				_ = db.QueryRow("SELECT count(*) FROM game_owners WHERE game_id=1 AND owner_sub='sub-2'").Scan(&n)
				if n != 0 {
					t.Fatalf("expected sub-2 removed, got %d rows", n)
				}
			},
		},
		"Remove last owner": {
			method: "DELETE", endpoint: "/games/1/owners/sub-1",
			requestHeaders: map[string]string{"Authorization": "Bearer sub-1"},
			expectedStatusCode: http.StatusConflict,
			setup: func(db *sql.DB) { executeSQLFile(t, db, "./test_data/games_setup.sql") },
		},
		"Remove owner not present": {
			method: "DELETE", endpoint: "/games/1/owners/sub-9",
			requestHeaders: map[string]string{"Authorization": "Bearer sub-1"},
			expectedStatusCode: http.StatusNotFound,
			setup: func(db *sql.DB) { executeSQLFile(t, db, "./test_data/games_setup_two_owners.sql") },
		},
	}

	dbConn, teardownDatabase := setupTestDatabase(t)
	defer teardownDatabase()
	db, err := sql.Open("postgres", dbConn)
	if err != nil {
		t.Fatalf("Failed to open database connection: %v", err)
	}
	defer db.Close()
	runGooseUp(t, db)
	server, teardown := setupTestServer(t)
	defer teardown(server)

	for name, tc := range tests {
		t.Run(name, func(t *testing.T) {
			if tc.setup != nil {
				tc.setup(db)
			}
			defer executeSQLFile(t, db, "./test_data/cleanup.sql")
			newTestRequest(t, tc, server, db)
		})
	}
}
```

- [ ] **Step 3: Run**

Run: `make test` (or `go test ./integrationtests/ -run TestOwners -v`)
Expected: all subtests PASS. (Requires Docker for testcontainers.)

- [ ] **Step 4: Lint & commit**

```bash
make lint && git add integrationtests/owners_test.go integrationtests/test_data/games_setup_two_owners.sql
git commit -m "test: owner add/remove integration coverage"
```

---

## Phase B — Frontend (`knobel-manager-app`)

### Task B1: Regenerate client + wire cache tags/hooks

**Files:**
- Modify (temporarily): `src/store/openapi-config.ts`
- Regenerated: `src/store/generatedApi.ts`
- Modify: `src/store/api.ts`

**Produces:** `useAddOwnerMutation`, `useRemoveOwnerMutation`; `GameOwner.email?: string`; `AddOwnerApiArg`, `RemoveOwnerApiArg`.

- [ ] **Step 1: Point the codegen at the local spec (temporary)** — in `openapi-config.ts` set:

```ts
  schemaFile: '/Users/brinkmann/git/private/knobel-manager-service/openapi/openapi.yaml',
```

- [ ] **Step 2: Regenerate, then restore the URL**

```bash
pnpm api:gen
```

Then revert `schemaFile` back to `'https://raw.githubusercontent.com/henok321/knobel-manager-service/main/openapi/openapi.yaml'`.
Expected: `generatedApi.ts` gains `addOwner`/`removeOwner` mutations, `GameOwner.email?`, and the two arg types. Confirm arg shape: `AddOwnerApiArg = { gameId: number; addOwnerRequest: AddOwnerRequest }`, `RemoveOwnerApiArg = { gameId: number; ownerSub: string }` (adjust names in later steps if codegen differs).

- [ ] **Step 3: Enhance tags + export hooks** in `src/store/api.ts` — add inside `endpoints`:

```ts
    addOwner: {
      invalidatesTags: (_result, _error, arg) => [{ type: 'Game', id: arg.gameId }],
    },
    removeOwner: {
      invalidatesTags: (_result, _error, arg) => [{ type: 'Game', id: arg.gameId }],
    },
```

And add to the export block:

```ts
  useAddOwnerMutation,
  useRemoveOwnerMutation,
```

- [ ] **Step 4: Typecheck & commit**

```bash
pnpm check   # tsc + biome + i18n gates
git add src/store/generatedApi.ts src/store/api.ts src/store/openapi-config.ts
git commit -m "feat(store): add owner mutations"
```

### Task B2: i18n keys (en + de)

**Files:** Modify `src/i18n/locales/en/gameDetail.json` and `src/i18n/locales/de/gameDetail.json`

- [ ] **Step 1: Add `tabs.owners`** to both files' `tabs` object — EN `"owners": "Owners"`, DE `"owners": "Besitzer"`.

- [ ] **Step 2: Add an `owners` section.** EN:

```json
  "owners": {
    "title": "Owners",
    "description": "Owners can manage this game. Add a co-owner by their email address.",
    "you": "You",
    "emailLabel": "Email address",
    "emailPlaceholder": "name@example.com",
    "add": "Add owner",
    "remove": "Remove",
    "removeConfirmTitle": "Remove owner",
    "removeConfirmMessage": "Remove {{email}} as an owner of this game?",
    "cancel": "Cancel",
    "added": "Owner added",
    "removed": "Owner removed",
    "errorAlreadyOwner": "This person is already an owner.",
    "errorUserNotFound": "No user found with that email address.",
    "errorGeneric": "Could not update owners. Please try again."
  }
```

DE (same keys): title "Besitzer", description "Besitzer können dieses Spiel verwalten. Füge einen Mitbesitzer über seine E-Mail-Adresse hinzu.", you "Du", emailLabel "E-Mail-Adresse", emailPlaceholder "name@example.com", add "Besitzer hinzufügen", remove "Entfernen", removeConfirmTitle "Besitzer entfernen", removeConfirmMessage "{{email}} als Besitzer dieses Spiels entfernen?", cancel "Abbrechen", added "Besitzer hinzugefügt", removed "Besitzer entfernt", errorAlreadyOwner "Diese Person ist bereits Besitzer.", errorUserNotFound "Kein Benutzer mit dieser E-Mail-Adresse gefunden.", errorGeneric "Besitzer konnten nicht aktualisiert werden. Bitte versuche es erneut."

- [ ] **Step 3: Verify & commit**

```bash
pnpm check   # i18next status/extract/lint must pass
git add src/i18n/locales/en/gameDetail.json src/i18n/locales/de/gameDetail.json
git commit -m "i18n: owners panel keys (en, de)"
```

### Task B3: OwnersPanel component

**Files:** Create `src/pages/games/panels/OwnersPanel/OwnersPanel.tsx`

**Consumes:** `useAddOwnerMutation`, `useRemoveOwnerMutation` (B1); `useAuth` (`src/auth/useAuth.ts`); `Game`/`GameOwner` types.

- [ ] **Step 1: Implement the panel**

```tsx
import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Group,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAuth } from '../../../../auth/useAuth';
import Icon from '../../../../shared/Icon';
import { useAddOwnerMutation, useRemoveOwnerMutation } from '../../../../store/api.ts';
import type { Game, GameOwner } from '../../../../store/generatedApi.ts';

interface OwnersPanelProps {
  game: Game;
}

const OwnersPanel = ({ game }: OwnersPanelProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [addOwner, { isLoading: isAdding }] = useAddOwnerMutation();
  const [removeOwner] = useRemoveOwnerMutation();

  const singleOwner = game.owners.length <= 1;

  const handleAdd = async () => {
    const value = email.trim();
    if (!value) {
      return;
    }
    try {
      await addOwner({ gameId: game.id, addOwnerRequest: { email: value } }).unwrap();
      setEmail('');
      notifications.show({ message: t('gameDetail:owners.added'), color: 'green' });
    } catch (error) {
      const status =
        error && typeof error === 'object' && 'status' in error
          ? (error as { status: number }).status
          : undefined;
      const message =
        status === 409
          ? t('gameDetail:owners.errorAlreadyOwner')
          : status === 422
            ? t('gameDetail:owners.errorUserNotFound')
            : t('gameDetail:owners.errorGeneric');
      notifications.show({ message, color: 'red' });
    }
  };

  const confirmRemove = (owner: GameOwner) => {
    const label = owner.email ?? owner.ownerSub;
    modals.openConfirmModal({
      title: t('gameDetail:owners.removeConfirmTitle'),
      children: <Text size="sm">{t('gameDetail:owners.removeConfirmMessage', { email: label })}</Text>,
      labels: { confirm: t('gameDetail:owners.remove'), cancel: t('gameDetail:owners.cancel') },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await removeOwner({ gameId: game.id, ownerSub: owner.ownerSub }).unwrap();
          notifications.show({ message: t('gameDetail:owners.removed'), color: 'green' });
        } catch {
          notifications.show({ message: t('gameDetail:owners.errorGeneric'), color: 'red' });
        }
      },
    });
  };

  return (
    <Stack gap="md">
      <div>
        <Text fw={600}>{t('gameDetail:owners.title')}</Text>
        <Text c="dimmed" size="sm">{t('gameDetail:owners.description')}</Text>
      </div>

      <Stack gap="xs">
        {game.owners.map((owner) => {
          const isSelf = owner.ownerSub === user?.uid;
          return (
            <Card key={owner.ownerSub} padding="sm" withBorder>
              <Group justify="space-between">
                <Group gap="xs">
                  <Text size="sm">{owner.email ?? owner.ownerSub}</Text>
                  {isSelf && <Badge color="cobalt" size="sm">{t('gameDetail:owners.you')}</Badge>}
                </Group>
                <ActionIcon
                  aria-label={t('gameDetail:owners.remove')}
                  color="red"
                  disabled={singleOwner}
                  onClick={() => confirmRemove(owner)}
                  variant="subtle"
                >
                  <Icon name="trash" />
                </ActionIcon>
              </Group>
            </Card>
          );
        })}
      </Stack>

      <Group align="flex-end" gap="sm">
        <TextInput
          flex={1}
          label={t('gameDetail:owners.emailLabel')}
          onChange={(event) => setEmail(event.currentTarget.value)}
          placeholder={t('gameDetail:owners.emailPlaceholder')}
          type="email"
          value={email}
        />
        <Button loading={isAdding} onClick={() => void handleAdd()}>
          {t('gameDetail:owners.add')}
        </Button>
      </Group>
    </Stack>
  );
};

export default OwnersPanel;
```

- [ ] **Step 2: Verify `Icon` "trash" name.** Run: `grep -n "trash\|IconTrash" src/shared/Icon.tsx`. If the Icon component uses a different name/API, match `TeamsPanel`'s existing usage instead (copy how it renders its delete icon).

- [ ] **Step 3: Typecheck & commit**

```bash
pnpm check
git add src/pages/games/panels/OwnersPanel/OwnersPanel.tsx
git commit -m "feat: OwnersPanel component"
```

### Task B4: Wire the tab

**Files:** Modify `src/pages/games/GameDetail/GameViewContent.tsx`

- [ ] **Step 1: Import + register the tab**

```tsx
import OwnersPanel from '../panels/OwnersPanel/OwnersPanel';
// ...
const GAME_TYPES = ['teams', 'rounds', 'rankings', 'owners'] as const;
```

- [ ] **Step 2: Add tab + panel** (after the rankings tab / panel):

```tsx
          <Tabs.Tab value="owners">{t('gameDetail:tabs.owners')}</Tabs.Tab>
```

```tsx
        <Tabs.Panel pt="md" value="owners">
          <OwnersPanel game={game} />
        </Tabs.Panel>
```

(`getDefaultTab`'s `switch` is keyed on `GameStatus`, not `GameTab`, so adding a tab does not require an `assertNever` arm there.)

- [ ] **Step 3: Verify & commit**

```bash
pnpm check
git add src/pages/games/GameDetail/GameViewContent.tsx
git commit -m "feat: owners tab in game detail"
```

- [ ] **Step 4: Manual end-to-end**

Run `pnpm local` (local backend) or `pnpm prod`. Open a game → Owners tab. Verify: your row shows the "You" badge; add a real teammate email → row appears with their email; remove is disabled when you're the only owner; removing a co-owner asks for confirm; unknown email shows the not-found error.

---

## Self-Review

- **Spec coverage:** email→UID add (A5), UID→email display (A6 enrich), endpoints (A1), guards last/already/not-found (A5+A7), peer auth reuse (A5 via `FindByID`), no migration/no stored email (confirmed — no entity/model changes), frontend tab+panel+hooks+i18n (B1–B4), best-effort enrichment (A6). Covered.
- **Placeholder scan:** none — all steps carry real code/commands.
- **Type consistency:** `NewGamesService(repo, users)` (A5) matches routes wiring (A6-S5); `NewGamesHandler(service, users)` (A6-S1) matches (A6-S5); `enrichOwnerEmails(ctx, ...*api.Game)` used consistently; frontend arg names flagged for codegen confirmation in B1-S2.
- **Risk:** RTK codegen arg names (`addOwnerRequest`) and `Icon` "trash" name are the two spots to confirm against generated output during execution (called out inline).
