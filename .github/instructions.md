# GitHub Copilot Code Review Instructions

Review pull requests for Knobel Manager App against project patterns and standards.

## Project Context

- **Stack**: React 19 + TypeScript + Redux Toolkit (RTK Query) + Mantine UI v8
- **Backend**: Knobel Manager Service (OpenAPI auto-generated types)
- **Auth**: Firebase Authentication with JWT tokens
- **i18n**: i18next with English and German locales
- **Strict TypeScript**: `noUncheckedIndexedAccess`, `useUnknownInCatchVariables`, etc.

## Critical Auto-Fail Rules

These violations must be fixed before merge:

### 1. Internationalization (CRITICAL)

- ❌ **NO hardcoded UI text** - Every user-facing string must use `t('namespace.key')`
- ❌ No inline strings like "Add", "Delete", "Submit", "Error", etc.
- ❌ Template literals with UI text: `` `${count} teams` ``
- ✅ Must use: `t('games.teamCount', { count })`
- ✅ All keys in both `src/i18n/locales/{en,de}/*.json`

### 2. Type Safety (CRITICAL)

- ❌ **NO `any` types** - Use `unknown` with type guards
- ❌ Array/object access without undefined checks (`arr[0]`, `map[key]`)
- ❌ String literals for enums: `'in_progress'` instead of `GameStatusEnum.InProgress`
- ✅ Use generated types from `src/generated/api.ts`
- ✅ Check undefined: `const item = arr.find(...); if (item) { ... }`

### 3. State Management (CRITICAL)

- ❌ **NO Redux slices** - Only RTK Query for server state
- ❌ Direct Axios/fetch calls - Must use RTK Query hooks
- ❌ Mutations without `.unwrap()` - No error handling
- ✅ Use hooks from `src/api/rtkQueryApi.ts`
- ✅ Pattern: `await mutation({...}).unwrap()`

### 4. Generated Code (CRITICAL)

- ❌ **NEVER edit `src/generated/` files** - Auto-generated from OpenAPI
- ✅ Regenerate with `npm run api:gen` when backend changes

## High Priority Patterns

### Component Structure

- Functional components only (no class components except ErrorBoundary)
- Props interface explicitly typed for every component
- File organization:
  - `src/pages/{page}/` - Page components
  - `src/components/` or `src/shared/` - Shared components
  - `src/pages/{page}/components/` - Page-specific components

### Error Handling

- Always wrap mutations in try-catch with `.unwrap()`
- Show errors to users via `notifications.show({ color: 'red', ... })`
- Check error type: `error instanceof Error ? error.message : fallback`
- Never silent failures (empty catch blocks)

```typescript
// ✅ Good
try {
  await createTeam({ gameId, name }).unwrap();
  notifications.show({ color: 'green', title: t('success') });
} catch (error) {
  notifications.show({
    color: 'red',
    message: error instanceof Error ? error.message : t('error'),
  });
}
```

### Data Normalization

- Store ID arrays, not nested objects: `teams: number[]` not `teams: Team[]`
- Use selectors from `src/api/normalizedSelectors.ts`
- Memoize with `createSelector` for performance

### RTK Query Patterns

- Configure cache tags: `providesTags` and `invalidatesTags`
- Cross-entity invalidation: Team mutations invalidate `Games` tag
- Optimistic updates with `onQueryStarted` for instant UI feedback

### Custom Hooks

- Abstract RTK Query implementation details
- Don't expose raw query hooks: `{ ...useGetGamesQuery() }`
- Wrap mutations in `useCallback` with proper dependencies
- Validate context usage: Throw error if used outside provider

### UI with Mantine v8

- Use `Modal` component with `opened`/`onClose` props
- Notifications via `notifications.show()` service
- Confirmations via `modals.openConfirmModal()`
- Native HTML forms with `FormData` API (no Formik/React Hook Form)
- Disabled buttons wrapped in `<Tooltip>` explaining why

### React Patterns

- Lazy load pages: `lazy(() => import(...))`
- Suspense with `<CenterLoader />` fallback
- Memoize callbacks: `useCallback` for functions passed as props
- Memoize expensive computations: `useMemo` for derived state
- Complete dependency arrays (ESLint exhaustive-deps enforced)

### Routing

- Protected routes use `<ProtectedRoute>` wrapper
- Parse URL params as numbers: `Number(gameId)`
- Programmatic navigation with `useNavigate()`

## Medium Priority

### Code Organization

- Imports: external → api → components → types → relative
- Page components: default export
- Utilities: named exports
- No circular imports
- No deep relative paths: `../../../../...`

### Performance

- Use `useCallback` for functions passed as props
- Use `useMemo` for derived state
- Selectors use `createSelector` for memoization
- Don't create functions in render loop

### Testing

- Tests co-located: `*.test.tsx` next to implementation
- AAA pattern: Arrange-Act-Assert
- Mock RTK Query responses correctly
- Test normalization logic

## Common Anti-Patterns

High Priority:

- Nested state objects (normalize to IDs)
- Missing `.unwrap()` on mutations
- Array/object access without undefined checks
- String literals instead of enums
- Missing cache invalidation tags
- Class components for regular components
- Components >300 lines (split into smaller)

Medium Priority:

- Missing tooltips on disabled buttons
- Inline styles instead of Mantine theme
- Form submission via button click instead of form submit
- Functions created in JSX without memoization
- Missing dependency arrays on hooks

## Review Comment Format

```markdown
**[CATEGORY]** Issue Title

Issue: Description
Location: file.tsx:123

Expected:
\`\`\`typescript
// Good example
\`\`\`

Current:
\`\`\`typescript
// Current code
\`\`\`

**Severity**: [CRITICAL | HIGH | MEDIUM | LOW]
```

## Quick Checklist

Every PR must pass:

```text
[ ] No hardcoded UI text (i18n)
[ ] No `any` types
[ ] RTK Query used (not direct API calls)
[ ] Data normalized (ID arrays, not nested objects)
[ ] Mutations use .unwrap() with try-catch
[ ] Errors shown with notifications
[ ] Components in correct directory
[ ] Generated types not manually edited
[ ] All translations in locale files
```

## Path-Specific Rules

Additional rules in `.github/instructions/*.instructions.md`:

- `react-components.instructions.md` - React patterns
- `typescript.instructions.md` - Type safety
- `api-state.instructions.md` - RTK Query & state
- `i18n.instructions.md` - Internationalization
- `ui-patterns.instructions.md` - Mantine UI

These apply automatically based on file patterns.
