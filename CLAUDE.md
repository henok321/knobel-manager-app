# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Knobel Manager is a tournament management application for the dice game "Knobeln" (also known as "Schocken"). Built with
React and TypeScript, it uses Firebase Authentication with JWT tokens and communicates with a backend API provided
by [Knobel Manager Service](https://github.com/henok321/knobel-manager-service).

**Architecture Overview**: See the Mermaid diagram in README.md for a visual representation of the auth flow:
Web App ↔ Firebase Auth (JWT) ↔ Backend Service.

## Development Commands

### Environment Setup

```bash
# Install NodeJS version from .nvmrc
nvm install && nvm use

# Install dependencies
npm install
```

### Development Servers

```bash
# Run with local API
npm run local

# Run with production API
npm run prod
```

### Build and Quality

```bash
# Build for production
npm run build

# Run all linters and formatters (auto-fix)
npm run fix

# Run linters separately
npm run lint          # ESLint (check only)
npm run lint:fix      # ESLint (auto-fix)
npm run format        # Prettier

# Run tests
npm test              # Run all tests
npm test <path>       # Run specific test file
npm test --watch      # Run tests in watch mode
```

### Deployment

```bash
# Build and deploy to Firebase
npm run deploy
```

### Maintenance

```bash
# Check for unused files/dependencies
npm run knip          # Strict check
npm run knip:fix      # Auto-remove unused files

# Update dependencies interactively
npx npm-check-updates -u -i
npx npm-check-updates -u -i -t minor  # Update to latest minor versions only

# Clean build artifacts and dependencies
npm run clean         # Remove node_modules and dist directories
npm ci                # Clean install after removing node_modules
```

## Architecture

### State Management

The application uses Redux Toolkit with **normalized state** using `createEntityAdapter`:

- **Store** (`src/store/store.ts`): Combines 4 separate reducers: `games`, `teams`, `players`, `tables`
- **Normalized Structure**: Each entity type has its own slice with `createEntityAdapter`
  - `games` slice stores games with ID references (`Game.teams: number[]`)
  - `teams` slice stores teams with ID references (`Team.players: number[]`)
  - `players` slice stores individual players
  - `tables` slice stores tables with scores
- **Cross-Slice Updates**: Uses `extraReducers` for coordination
  - Example: Creating a team updates the parent game's `teams` array
  - Example: Deleting a team removes its ID from the game's `teams` array
- **Hooks**: Each slice has dedicated hooks
  - `useGames()` - Game CRUD operations
  - `useTeams()` - Team operations
  - `usePlayers()` - Player operations
  - `useTables()` - Table and score operations

**Key Redux Patterns:**

- **Entity Adapters**: Each slice uses `createEntityAdapter` for CRUD operations
- **ID References**: Relationships stored as ID arrays, not nested objects
- **Immer Updates**: Redux Toolkit's Immer handles immutable updates automatically
- **Memoized Selectors**: Uses `createSelector` for performance (e.g., `selectActiveGame`)
- **Cross-Slice Coordination**: `extraReducers` keep related entities synchronized
- **Type Safety**: Custom types in `src/slices/types.ts` define the normalized structure
- **Async Operations**: Uses `createAsyncThunk` with `pending/fulfilled/rejected` states for API calls

### Authentication

Firebase Authentication is used throughout the app:

- **AuthContext** (`src/auth/AuthContext.tsx`): Provides authentication state and actions (`loginAction`, `logOut`) via
  React Context
- **useAuth** hook (`src/auth/useAuth.ts`): Access authentication state from any component
- **ProtectedRoute** (`src/auth/ProtectedRoute.tsx`): Wrapper for routes requiring authentication; redirects to `/login`
  if not authenticated
- **API Interceptor** (`src/api/apiClient.ts`): Axios interceptor automatically attaches Firebase JWT token to all API
  requests
- **Firebase Config** (`src/auth/firebaseConfig.ts`): Configuration is checked into source control (API key is public and secured via Firebase domain restrictions)

### Routing

React Router v7 with route-based code organization:

- `/login` - Public login page
- `/` - Dashboard/Home page (protected) - Shows active game overview and stats
- `/games` - Games management page (protected) - Grid view with search and filters
- `/games/:gameId` - Game detail page (protected) - Full tournament management interface

All protected routes use the `<ProtectedRoute>` component wrapper.

### API Client

Axios-based API client (`src/api/apiClient.ts`) configured with:

- Base URL from environment variable `VITE_API_URL`
- Request interceptor that adds Firebase JWT token to Authorization header
- Typed API functions for games, teams, and players
- **Type Definitions**: All API types come from `src/generated/models/` - use these for request/response typing
- **Development Proxy**: Vite proxies `/api` requests to the backend (see `vite.config.ts`)
  - In development: API calls to `/api/*` are proxied to `VITE_API_URL`
  - Path rewrite: `/api/games` becomes `/games` on the backend
  - In tests (Node environment): Uses absolute URL `http://localhost/api`

### Styling

- **Mantine UI** v8 - Component library with built-in theming
- **PostCSS** - CSS processing with Mantine preset

### Internationalization

i18next with browser language detection:

- Configuration: `src/i18n/i18nConfig.ts`
- Translations: `src/i18n/locales/{en,de}/*.json`
- Detection order: query string → localStorage → cookie → browser navigator

### Project Structure

```
src/
├── api/           # API client and type definitions
├── auth/          # Authentication context, hooks, Firebase config
├── components/    # Shared components (GameViewContent, ErrorBoundary, etc.)
├── generated/     # Auto-generated TypeScript client from OpenAPI spec (DO NOT EDIT)
│   ├── apis/      # API endpoint classes
│   └── models/    # TypeScript type definitions
├── i18n/          # i18next configuration and translations
├── pages/         # Route-based page components
│   ├── home/      # Home page with TeamForm
│   ├── games/     # Games page with GameForm, GameDetail, and panels
│   │   ├── panels/       # TeamsPanel, RoundsPanel, RankingsPanel
│   │   └── components/   # Game-specific components
│   └── Login.tsx  # Login page
├── shared/        # Shared layout components (Layout, Header, CenterLoader)
├── slices/        # Redux state management (normalized with entity adapters)
│   ├── actions.ts      # Cross-slice actions (fetchAll, resetStore)
│   ├── types.ts        # Normalized entity type definitions
│   ├── games/          # Games slice
│   │   ├── actions.ts  # Game-specific async thunks
│   │   ├── slice.ts    # Slice with reducers, selectors, extraReducers
│   │   └── hooks.ts    # useGames hook
│   ├── teams/          # Teams slice (similar structure)
│   ├── players/        # Players slice (similar structure)
│   └── tables/         # Tables slice (similar structure)
├── store/         # Redux store configuration
├── utils/         # Utility functions (rankingsMapper, scoreAggregator)
├── App.tsx        # Root component with routing
└── main.tsx       # Application entry point
```

### OpenAPI Code Generation

The project uses OpenAPI Generator to create TypeScript API clients from the backend's OpenAPI specification:

```bash
# Regenerate API client from latest OpenAPI spec
npm run api:gen
```

This command:

- Fetches the OpenAPI spec from the deployed backend service
- Generates TypeScript types and API client classes in `src/generated/`
- Creates separate directories for models (`src/generated/models/`) and APIs (`src/generated/apis/`)

**Important**: Never manually edit files in `src/generated/` - they will be overwritten on the next generation.

### UI Design

The application follows modern dashboard design patterns with Mantine UI:

#### Dashboard/Home Page (`/`)

Clean dashboard interface showing:

- **Stats Cards**: Total games, teams, and active game count
- **Active Game Card**: Featured card with game details and quick actions
    - Game configuration summary (team size, table size, rounds, teams)
    - "Manage Game" button linking to detail page
    - "Add Team" button (when in setup mode)
- **Recent Games**: Grid of recent games with quick navigation
- **Empty State**: Prominent CTA when no active game

#### Games Page (`/games`)

Modern grid layout with powerful filtering:

- **Search**: Real-time search by game name
- **Filters**: Segmented control for All/Active/Setup
- **Grid View**: Responsive 3-column grid (1 on mobile, 2 on tablet)
- **Game Cards**: Consistent card design with all key info visible
    - Status badges
    - Game configuration
    - Team count
    - Full-width "View Details" button
    - Action buttons (Activate, Delete)
- **Empty States**: Context-aware messages for no games or no results

#### Game Detail Page (`/games/:gameId`)

Full tournament management interface with three tabs:

1. **Teams Tab**:
    - Add teams during the setup phase
    - View all teams and their players
    - Edit team and player names (even after game starts)
    - Team/player IDs are preserved for matchmaking

2. **Rounds Tab**:
    - **Setup Phase**: Shows "Setup Matchmaking" button to generate tables
    - Calls `POST /games/{gameID}/setup` to trigger backend matchmaking
    - **After Setup**: Select round from dropdown
    - View all tables for selected round
    - See player assignments per table (from backend matchmaking)
    - Enter/edit scores for each table
    - Scores are saved per player per table
    - Proper error handling for 404s before setup

3. **Rankings Tab**:
    - Team rankings (aggregated player scores)
    - Player rankings (individual totals across all rounds)
    - Automatically calculated from entered scores
    - Real-time updates when scores change

#### Key Components

- **Home.tsx**: Dashboard with stats and active game overview
- **Games.tsx**: Games list with search, filters, and grid layout
- **GameDetail.tsx**: Main game page with tab navigation
- **GameViewContent.tsx**: Game detail view with tabs and status management
- **panels/TeamsPanel.tsx**: Team management with inline editing
- **panels/RoundsPanel.tsx**: Round/table display with score entry
- **panels/RankingsPanel.tsx**: Calculated rankings display
- **components/ScoreEntryModal.tsx**: Modal for entering scores

## Testing

Jest with ts-jest preset and jsdom environment:

- Test files: `*.test.ts`, `*.test.tsx`, `*.spec.ts`, `*.spec.tsx`
- Setup file: `jest.setup.js`
- CSS imports mocked with `identity-obj-proxy`
- Static assets mocked via `__mocks__/fileMock.js`

## Environment Variables

Create `.env.development` and `.env.production` files:

- `VITE_API_URL` - Backend API base URL
  - Development: `http://localhost:8080`
  - Production: `https://api.knobel-manager.de`

## Git Hooks

Husky + lint-staged runs ESLint and Prettier on staged files before each commit.

## Key Dependencies

- **React 19** with react-router-dom v7
- **Redux Toolkit** for state management
- **Firebase** v12 for authentication
- **Mantine** v8 for UI components
- **Axios** for HTTP requests
- **i18next** for internationalization
- **MSW** for API mocking in tests

## TypeScript Configuration

Strict mode is enabled with comprehensive type checking:

- `strict: true` (enables all strict checks)
- `noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`, `noImplicitReturns`, `noImplicitThis`
- `noUncheckedIndexedAccess` for safe array/object access (prevents `undefined` access bugs)
- `noUnusedLocals`, `noUnusedParameters` for cleaner code
- `noFallthroughCasesInSwitch` to catch switch statement bugs
- `noImplicitOverride` to enforce explicit override declarations
- `allowUnreachableCode: false` to catch dead code
- `useUnknownInCatchVariables: true` for safer error handling
- Module resolution: "bundler" (Vite-compatible)

## Troubleshooting

### API Connection Issues

- If `npm run local` fails to connect: Check if backend is running at `http://localhost:8080/health`
- If local backend is unavailable: Use `npm run prod` to connect to deployed API
- 404 errors on `/api/*` routes: Vite proxy may not be running - restart dev server
- Authentication errors: Check Firebase token is being attached in browser Network tab

### State Management Issues

- Stale data after API calls: Ensure Redux actions properly update all affected slices and that `extraReducers` handle cross-slice updates
- Missing related entities: Check that entity IDs are correctly stored in relationship arrays (e.g., `game.teams: number[]`) and that the corresponding entities exist in their slices
- Selector returns `undefined`: Verify entity IDs exist in the appropriate slice and are correctly typed as numbers
- Cross-slice sync issues: Check `extraReducers` in slices to ensure parent entities update when child entities are created/deleted

### Build/Test Issues

- TypeScript errors with `undefined`: Check `noUncheckedIndexedAccess` - array/object access requires explicit checks
- Jest import errors: Check `transformIgnorePatterns` in `jest.config.js` for ESM module handling
- Vite build fails: Run `npm run clean` then `npm install` to clear build cache

## Development Guidelines

### Communication Style

- Conversation attitude/tone: Do not sugar coat questions and answers - use German honesty
- Be direct and pragmatic in technical discussions

### Git Workflow

- NEVER commit without asking first
- Use brief, descriptive commit messages
- Never use Claude as an author
- NEVER EVER push changes without explicit permission

### Code Quality

- You are a senior engineer - focus on clean design, modularity, and clear boundaries
- Write clean code balancing DRY and locality principles
- Prefer clarity to abstractions unless the domain truly requires the abstraction
- Module tests should be in the same module as the implementation using standard patterns and naming structures
- Use descriptive code and avoid comments that explain the function of the code unless technical or domain decisions are ambiguous or exceptional and need further context to understand the code

### Component Design

- Focus on single responsibility and composition over inheritance
- Extract complex logic into custom hooks
- Keep components focused - heavy logic should live in hooks or utility functions
- Use `React.memo` for expensive pure components; `useCallback`/`useMemo` where re-render churn is evident
- Ensure proper `useEffect` dependencies to avoid stale closures

### Type Safety

- **Never use `any`** - use domain types or `unknown` with type guards
- Always handle `undefined` from array/object access (`noUncheckedIndexedAccess` is enabled)
- Prefer discriminated unions for variants; use utility types (`Pick`, `Omit`, `Record`, `Partial`)
- Event handlers must be correctly typed (`React.ChangeEvent`, `React.MouseEvent`, etc.)

### Performance

- Avoid needless re-renders - verify `useEffect` dependency arrays
- For large lists, consider virtualization
- Keep abstractions local - prefer clarity to premature optimization

### Localization

- Never use inline translations - always use i18n JSON files and language keys

### Environment Configuration

- `npm run local` requires the local backend started
- `npm run prod` uses the deployed API
- If the local API at `localhost:8080/health` is not available, try to use the prod API

## Known UX Issues

### Current Implementation Status (Last analyzed: 2026-01-15)

**Home Page (`/`) - Partial Implementation:**
- Currently only shows empty state with CTAs when no active game exists
- **Missing**: Dashboard view with stats cards (total games, teams, active game count)
- **Missing**: Active Game Card with configuration summary and quick actions
- **Missing**: Recent Games grid when games exist

**Navigation Warnings:**
- React Router v7 throws console warnings: "You should call navigate() in React.useEffect()"
- Occurs when clicking active game selector dropdown and navigating from multiple pages
- Does not break functionality but indicates improper navigation hook usage

**API Performance Issues:**
- Multiple duplicate API requests observed (6+ identical calls to same endpoint)
- No evidence of request deduplication or caching strategy
- Should implement React Query or manual memoization for `/api/games/{id}/rounds/{round}/tables` endpoints

**Game Detail Page:**
- "Spiel abschließen" button remains disabled without visual feedback or tooltip explaining why
- No loading states shown during API calls (should use skeletons or spinners)
- Score entry modal number inputs work but could be more touch-friendly for mobile tournament use

**Headers and Layout:**
- Active game dropdown works but could benefit from loading indicator
- Language selector present but not thoroughly tested

### Performance Optimization Opportunities

- Implement request deduplication for table data fetching
- Add loading skeletons for initial page loads
- Consider lazy loading for route components
- Memoize expensive selector computations in Redux

### Accessibility Reminders

- Verify screen reader compatibility with status indicators (visual-only cues)
- Test keyboard navigation through score entry modal
- Ensure color contrast ratios meet WCAG AA standards
- Add ARIA live regions for score updates and status changes

See `ux-improvement.md` for detailed analysis and improvement recommendations.