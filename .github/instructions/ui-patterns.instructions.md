---
applyTo:
  - 'src/pages/**/*.tsx'
  - 'src/components/**/*.tsx'
excludeAgent:
  - coding
---

# UI/UX Patterns Review Rules

Mantine UI v8 component library patterns.

## Mantine Components

- **Modals**: Use `Modal` component with `opened`/`onClose` props
- **Notifications**: Use `notifications.show()` service
- **Confirmations**: Use `modals.openConfirmModal()` service
- **Forms**: Native HTML `<form>` with `FormData` API
- **Loading states**: Use `loading` prop on buttons

```typescript
// ✅ Good - Modal
<Modal opened={opened} onClose={close}>
  <form onSubmit={handleSubmit}>
    {/* form content */}
  </form>
</Modal>

// ✅ Good - Notification
notifications.show({
  color: 'green',
  title: t('actions.success'),
  message: t('actions.teamCreated')
});

// ❌ Bad - Custom modal
<div className="modal">...</div>
```

## Forms

- **Native HTML**: Use `<form>` element with `onSubmit`
- **FormData API**: Extract values with `FormData.get()`
- **No form libraries**: No Formik, React Hook Form, etc.
- **Mantine inputs**: TextInput, NumberInput, Select

```typescript
// ✅ Good
const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const name = formData.get('name') as string;
  // ...
};

// ❌ Bad
import { useForm } from 'react-hook-form'; // Don't use
```

## Disabled States

- **Always explain**: Wrap disabled buttons with `<Tooltip>`
- **User clarity**: Tooltip explains why button is disabled

```typescript
// ✅ Good
<Tooltip label={t('errors.gameNotSetup')}>
  <Button disabled={!isSetup}>
    {t('actions.start')}
  </Button>
</Tooltip>

// ❌ Bad
<Button disabled={!isSetup}>{t('actions.start')}</Button>
```

## Status Styling

- **Helper functions**: Create status-based style helpers
- **No inline styles**: Use Mantine theme values
- **Consistent colors**: Use Mantine color scheme

## Critical Rules

- ❌ No custom form libraries
- ❌ No inline style objects (use Mantine)
- ❌ No disabled buttons without tooltip explanation
- ❌ Form submission via button click (use form submit)
- ✅ All UI from Mantine components
- ✅ Native HTML forms with FormData
