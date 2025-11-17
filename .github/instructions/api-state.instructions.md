---
applyTo:
  - 'src/api/**/*.ts'
  - 'src/store/**/*.ts'
  - 'src/hooks/**/*.ts'
excludeAgent: ['coding']
---

# API & State Management Review Rules

RTK Query-based architecture with normalized data patterns.

## RTK Query Patterns

- **No Redux slices**: All server state through RTK Query
- **Use generated hooks**: From `src/api/rtkQueryApi.ts`
- **Mutations unwrap**: Always use `.unwrap()` for error handling

```typescript
// ✅ Good
try {
  await createTeam({ gameId, name }).unwrap();
  notifications.show({ color: 'green', title: 'Success' });
} catch (error) {
  notifications.show({
    color: 'red',
    message: error instanceof Error ? error.message : 'Error',
  });
}

// ❌ Bad
const result = await createTeam({ gameId, name }); // No unwrap
// Silent failure, no error handling
```

## Cache Invalidation

- **Configure tags**: Use `providesTags` and `invalidatesTags`
- **Cross-entity**: Team mutations invalidate `Games` tag
- **Optimistic updates**: Use `onQueryStarted` for instant UI feedback

## Data Normalization

- **Store IDs, not objects**: `teams: number[]` not `teams: Team[]`
- **Use selectors**: Import from `src/api/normalizedSelectors.ts`
- **Memoize with createSelector**: Prevent unnecessary recalculations

```typescript
// ✅ Good - Normalized
interface Game {
  id: number;
  teams: number[]; // ID references
}

// ❌ Bad - Nested objects
interface Game {
  id: number;
  teams: Team[]; // Full objects
}
```

## Custom Hooks

- **Abstract RTK Query**: Don't expose raw query hooks
- **Return clean interface**: Not `{ ...useGetGamesQuery() }`
- **Wrap mutations**: In `useCallback` with proper deps
- **Validate context**: Throw error if used outside provider

## Critical Rules

- ❌ No Redux slices (RTK Query only)
- ❌ No direct Axios calls (use RTK Query)
- ❌ No mutations without `.unwrap()`
- ❌ No nested state objects (normalize to IDs)
- ❌ Missing cache invalidation
- ✅ All selectors must use `createSelector`
