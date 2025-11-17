---
applyTo:
  - 'src/**/*.tsx'
  - 'src/**/*.jsx'
excludeAgent:
  - coding
---

# React Component Review Rules

Review React components for patterns specific to this codebase.

## Component Structure

- **Functional components only** - No new class components except ErrorBoundary
- **Props interface required** - Every component must have explicit Props type
- **File location matters**:
  - Page components: `src/pages/{page}/`
  - Shared components: `src/components/` or `src/shared/`
  - Page-specific: `src/pages/{page}/components/` or `src/pages/{page}/panels/`

## React 19 Patterns

- **Lazy loading**: All route components use `lazy(() => import(...))`
- **Suspense fallback**: Use `<CenterLoader />` for loading states
- **No React imports**: React 19 auto-imports JSX runtime

## Hooks

- **Custom hooks abstract RTK Query**: Don't expose raw query hooks
- **Complete dependency arrays**: ESLint enforces exhaustive-deps
- **Memoize callbacks**: Use `useCallback` for functions passed as props
- **Memoize expensive computations**: Use `useMemo` for derived state

## Context Usage

- **Validate provider**: Custom hooks must throw if called outside provider
- **Memoize context value**: Prevent unnecessary re-renders
- **AuthContext**: For user auth state
- **ActiveGameContext**: For selected game with localStorage sync

## Critical Rules

- ❌ No hardcoded UI text (must use i18n)
- ❌ No `any` types (use proper typing)
- ❌ No class components (except ErrorBoundary)
- ❌ No deep nesting (>3 levels - extract components)
- ❌ Components >300 lines (split into smaller components)
