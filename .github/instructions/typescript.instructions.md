---
applyTo:
  - 'src/**/*.ts'
  - 'src/**/*.tsx'
excludeAgent:
  - coding
---

# TypeScript Review Rules

Strict TypeScript configuration with comprehensive safety checks enabled.

## Type Safety (noUncheckedIndexedAccess)

- **Array access**: Always check for `undefined` before using indexed access
- **Object access**: Use optional chaining `?.` or explicit checks
- **Safe pattern**: `(map[key] || defaultValue)` for Record access
- **Prefer**: `find()` over indexed access when possible

```typescript
// ✅ Good
const player = players.find((p) => p.id === id);
if (player) {
  // use player
}

// ❌ Bad
const player = players[0]; // Could be undefined
player.name; // Type error with noUncheckedIndexedAccess
```

## Error Handling (useUnknownInCatchVariables)

- **Catch blocks**: Parameters are `unknown` type
- **Type check first**: Use `instanceof` before accessing properties

```typescript
// ✅ Good
try {
  await mutation().unwrap();
} catch (error) {
  const message = error instanceof Error ? error.message : 'Unknown error';
  notifications.show({ color: 'red', message });
}

// ❌ Bad
catch (error) {
  notifications.show({ message: error.message }); // Type error
}
```

## Generated Types

- **Never edit**: Files in `src/generated/` are auto-generated
- **Import from**: `src/generated/api.ts` for API types
- **Regenerate**: Run `npm run api:gen` when backend changes
- **Use enums**: Import from `src/api/types.ts` (GameStatusEnum, etc.)

## Critical Rules

- ❌ No `any` type usage (use `unknown` with type guards)
- ❌ No manual API type definitions (use generated)
- ❌ No string literals for enums (use GameStatusEnum.InProgress)
- ❌ No unchecked array/object access
- ❌ No implicit returns (all code paths must return)
- ✅ Use `import type` for type-only imports
