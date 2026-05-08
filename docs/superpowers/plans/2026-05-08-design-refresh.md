# Design Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Mantine's default look with a curated theme (cobalt accent, system stack, abstract three-square logo, refined header/footer/cards/badges) without breaking any existing functionality.

**Architecture:** Approach A from the spec — a central `theme.ts` exports a `MantineThemeOverride`; new shared components (`Logo`, `Icon`) live in `src/shared`; targeted edits to `Header`, `Footer`, `gameStatusHelpers`, `GameListItem`, `GameViewContent`, `index.html`, and a favicon swap. No wrapper-component layer; no API or routing changes.

**Tech Stack:** React 19, Mantine v9, TypeScript (strict), Tabler icons, Vite, Biome, i18next-cli, Jest (only existing slice tests).

**Spec:** `docs/superpowers/specs/2026-05-08-design-refresh-design.md`

---

## File Structure

**New files:**
- `src/theme.ts` — central `MantineThemeOverride` export, cobalt scale, defaults.
- `src/shared/global.css` — tabular-nums setting, `@keyframes km-pulse`, `.km-card-interactive` hover class.
- `src/shared/Logo.tsx` — SVG component with `mark` and `full` variants.
- `src/shared/Icon.tsx` — Tabler icon wrapper with stroke/size defaults.
- `public/favicon.svg` — new abstract three-square glyph.

**Modified files:**
- `src/App.tsx` — pass `theme` to `MantineProvider`, import `global.css`.
- `src/shared/layout/Header.tsx` — replace dice icon + title with `<Logo variant="full" />`.
- `src/shared/layout/Footer.tsx` — layout refresh, icon-only tooltip links.
- `src/utils/gameStatusHelpers.tsx` — drop `statusIcon`, change `statusColor` mapping (`blue` → `cobalt`).
- `src/pages/games/components/GameListItem.tsx` — card class, drop `leftSection`, dim trash, font tweak.
- `src/pages/games/components/GameViewContent.tsx` — drop `leftSection={statusIcon(...)}` on the badge.
- `index.html` — point favicon at SVG.
- (cross-pass) various pages — replace inline `style={{ width: N, height: N }}` icon sizing with `<Icon icon={...} size={N} />`.

**Deleted file:** `public/icons8-dice-64.png`.

---

## Pre-flight

### Task 0: Create branch and verify clean state

**Files:** none (git only).

- [ ] **Step 1: Confirm clean working tree**

```bash
git status
```

Expected: `On branch main`, working tree clean (the `design-explorations/` directory is gone after the user shredded it).

- [ ] **Step 2: Create and switch to feature branch**

```bash
git checkout -b design-refresh
```

Expected: `Switched to a new branch 'design-refresh'`.

- [ ] **Step 3: Sanity check — baseline runs**

```bash
pnpm check
pnpm test
```

Expected: both pass. If `pnpm check` already fails on `main`, stop and surface the issue rather than masking it with the design-refresh changes.

---

## Task 1: Theme tokens

**Files:**
- Create: `src/theme.ts`

- [ ] **Step 1: Write the theme file**

Create `src/theme.ts`:

```ts
import { createTheme, type MantineColorsTuple } from '@mantine/core';

const cobalt: MantineColorsTuple = [
  '#eef2ff',
  '#e0e7ff',
  '#c7d2fe',
  '#a5b4fc',
  '#818cf8',
  '#4f6ef0',
  '#2563eb',
  '#1d4ed8',
  '#1e40af',
  '#172554',
];

const systemSans =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
const systemMono =
  'ui-monospace, "SF Mono", Menlo, Consolas, monospace';

export const theme = createTheme({
  primaryColor: 'cobalt',
  colors: { cobalt },
  defaultRadius: 'md',
  fontFamily: systemSans,
  fontFamilyMonospace: systemMono,
  headings: {
    fontFamily: systemSans,
    fontWeight: '600',
  },
  components: {
    Card: {
      defaultProps: {
        radius: 'md',
        shadow: 'sm',
        withBorder: true,
      },
    },
    Badge: {
      defaultProps: {
        variant: 'dot',
        size: 'sm',
        radius: 'sm',
      },
    },
    Button: {
      defaultProps: {
        radius: 'md',
      },
    },
    ActionIcon: {
      defaultProps: {
        variant: 'subtle',
      },
    },
  },
});
```

- [ ] **Step 2: Type-check**

```bash
pnpm exec tsc --noEmit
```

Expected: passes. (No file consumes the export yet — `noUnusedLocals` is on, but a top-level `export` counts as used.)

- [ ] **Step 3: Commit**

```bash
git add src/theme.ts
git commit -m "feat(theme): add central Mantine theme with cobalt palette"
```

---

## Task 2: Global CSS layer

**Files:**
- Create: `src/shared/global.css`

- [ ] **Step 1: Write the CSS file**

Create `src/shared/global.css`:

```css
:root {
  font-feature-settings: "tnum", "ss01";
}

@keyframes km-pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.4;
    transform: scale(0.92);
  }
}

.km-badge-pulse [data-variant="dot"]::before,
.km-badge-pulse::before {
  animation: km-pulse 1.4s ease-in-out infinite;
}

.km-card-interactive {
  cursor: pointer;
  transition:
    transform 150ms ease,
    box-shadow 150ms ease;
}

.km-card-interactive:hover {
  transform: translateY(-1px);
  box-shadow: var(--mantine-shadow-md);
}

@media (prefers-reduced-motion: reduce) {
  .km-badge-pulse [data-variant="dot"]::before,
  .km-badge-pulse::before,
  .km-card-interactive {
    animation: none;
    transition: none;
  }
}
```

> Note on the `.km-badge-pulse` selector: Mantine renders the dot via a pseudo-element on the badge root when `variant="dot"`. The two selectors above cover both Mantine v9 versions (with and without the `data-variant` attribute) — only one will match at runtime, the other is dead. This is deliberately overspecified to survive a minor Mantine bump.

- [ ] **Step 2: Verify Biome accepts the CSS**

```bash
pnpm exec biome check src/shared/global.css
```

Expected: passes (Biome's CSS linter is on by default in this repo's config).

- [ ] **Step 3: Commit**

```bash
git add src/shared/global.css
git commit -m "feat(theme): add global CSS for tnum and pulse animation"
```

---

## Task 3: Wire theme and CSS into the app

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Read the current `App.tsx`**

(Already in context; if running fresh, `cat src/App.tsx`.)

- [ ] **Step 2: Update imports and `MantineProvider`**

Change:

```tsx
import { MantineProvider } from '@mantine/core';
// ...
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
```

To:

```tsx
import { MantineProvider } from '@mantine/core';
// ...
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import './shared/global.css';
import { theme } from './theme.ts';
```

And change:

```tsx
<MantineProvider defaultColorScheme="auto">
```

To:

```tsx
<MantineProvider defaultColorScheme="auto" theme={theme}>
```

- [ ] **Step 3: Verify dev build**

```bash
pnpm exec tsc --noEmit
```

Expected: passes.

```bash
pnpm test
```

Expected: all existing slice tests pass (theme change is irrelevant to them, but confirms nothing is broken).

- [ ] **Step 4: Manual smoke check (informational; no automated test)**

Start dev:

```bash
pnpm local
```

Open `http://localhost:5173` (or whatever Vite reports), log in. Buttons should now use a clearly cobalt blue (slightly more saturated than the default Mantine blue). Numbers in any tables should look monospace-aligned.

Stop the dev server (`Ctrl-C`) before committing.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx
git commit -m "feat(theme): wire central theme and global CSS into MantineProvider"
```

---

## Task 4: Logo component

**Files:**
- Create: `src/shared/Logo.tsx`

- [ ] **Step 1: Write the component**

Create `src/shared/Logo.tsx`:

```tsx
import type React from 'react';

type LogoVariant = 'mark' | 'full';

interface LogoProps {
  variant?: LogoVariant;
  size?: number;
  className?: string;
}

const Glyph: React.FC<{ size: number }> = ({ size }) => (
  <svg
    aria-hidden="true"
    fill="none"
    height={size}
    role="presentation"
    viewBox="0 0 24 24"
    width={size}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* top-left outline square */}
    <rect
      height="9.5"
      stroke="currentColor"
      strokeWidth="1.5"
      width="9.5"
      x="0.75"
      y="0.75"
    />
    {/* bottom-right outline square */}
    <rect
      height="9.5"
      stroke="currentColor"
      strokeWidth="1.5"
      width="9.5"
      x="13.75"
      y="13.75"
    />
    {/* centre filled square (drawn last so it overlaps) */}
    <rect
      fill="var(--mantine-color-cobalt-6)"
      height="10"
      width="10"
      x="7"
      y="7"
    />
  </svg>
);

const Logo: React.FC<LogoProps> = ({
  variant = 'full',
  size = 16,
  className,
}) => {
  if (variant === 'mark') {
    return (
      <span aria-label="Knobel Manager" className={className} role="img">
        <Glyph size={size} />
      </span>
    );
  }

  const glyphSize = Math.round(size * 1.6);
  return (
    <span
      aria-label="Knobel Manager"
      className={className}
      role="img"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <Glyph size={glyphSize} />
      <span
        style={{
          fontWeight: 600,
          fontSize: size,
          letterSpacing: '-0.01em',
          whiteSpace: 'nowrap',
        }}
      >
        Knobel Manager
      </span>
    </span>
  );
};

export default Logo;
```

- [ ] **Step 2: Type-check**

```bash
pnpm exec tsc --noEmit
```

Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add src/shared/Logo.tsx
git commit -m "feat(brand): add Logo component with mark and full variants"
```

---

## Task 5: Icon wrapper

**Files:**
- Create: `src/shared/Icon.tsx`

- [ ] **Step 1: Write the wrapper**

Create `src/shared/Icon.tsx`:

```tsx
import type { Icon as TablerIconType } from '@tabler/icons-react';
import type React from 'react';

interface IconProps {
  icon: TablerIconType;
  size?: number;
  strokeWidth?: number;
  color?: string;
  className?: string;
}

const Icon: React.FC<IconProps> = ({
  icon: TablerIcon,
  size = 18,
  strokeWidth = 1.5,
  color,
  className,
}) => (
  <TablerIcon
    className={className}
    color={color}
    size={size}
    stroke={strokeWidth}
  />
);

export default Icon;
```

- [ ] **Step 2: Type-check**

```bash
pnpm exec tsc --noEmit
```

Expected: passes. The `Icon` type from `@tabler/icons-react` is the React component type for any Tabler icon.

- [ ] **Step 3: Commit**

```bash
git add src/shared/Icon.tsx
git commit -m "feat(shared): add Icon wrapper with consistent stroke and size"
```

---

## Task 6: Header refresh

**Files:**
- Modify: `src/shared/layout/Header.tsx`

- [ ] **Step 1: Replace the file content**

Open `src/shared/layout/Header.tsx`. Replace it entirely with:

```tsx
import { Box, Group } from '@mantine/core';
import type React from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../auth/useAuth.ts';
import Logo from '../Logo.tsx';
import UserMenu from '../userMenu/UserMenu.tsx';

interface HeaderProps {
  navbarActive?: boolean;
}

const Header: React.FC<HeaderProps> = ({ navbarActive }) => {
  const navigate = useNavigate();
  const { logOut } = useAuth();

  return (
    <Box
      style={{
        borderBottom:
          '1px solid light-dark(var(--mantine-color-gray-2), var(--mantine-color-dark-5))',
        backgroundColor: 'var(--mantine-color-body)',
      }}
    >
      <Group
        align="center"
        h={60}
        justify="space-between"
        maw={1440}
        mx="auto"
        px="xl"
        wrap="nowrap"
      >
        <Box
          style={{ cursor: 'pointer' }}
          onClick={() => {
            void navigate('/');
          }}
        >
          <Logo size={16} variant="full" />
        </Box>

        {navbarActive && (
          <Group gap="xs">
            <UserMenu onLogout={logOut} />
          </Group>
        )}
      </Group>
    </Box>
  );
};

export default Header;
```

Notes:
- The `useTranslation` import is dropped because the wordmark is part of the SVG component now. The unused `t` is removed by the same change.
- `IconDice` and `ThemeIcon` and `Title` imports are dropped.
- `border-bottom` colour shifts to `gray.2`/`dark.5` (one step lighter than before for a quieter divider).

- [ ] **Step 2: Type-check**

```bash
pnpm exec tsc --noEmit
```

Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add src/shared/layout/Header.tsx
git commit -m "refactor(layout): replace dice icon + title with Logo component"
```

---

## Task 7: Footer refresh

**Files:**
- Modify: `src/shared/layout/Footer.tsx`

- [ ] **Step 1: Replace the file content**

Open `src/shared/layout/Footer.tsx`. Replace it entirely with:

```tsx
import { ActionIcon, Container, Group, Text, Tooltip } from '@mantine/core';
import { IconBrandGithub, IconLicense } from '@tabler/icons-react';
import type React from 'react';
import { useTranslation } from 'react-i18next';

import Icon from '../Icon.tsx';
import Logo from '../Logo.tsx';

const GITHUB_URL = 'https://github.com/henok321/knobel-manager-app';
const LICENSE_URL = `${GITHUB_URL}/blob/main/LICENSE`;

const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Container
      fluid
      p={{ base: 'xs', sm: 'md' }}
      style={{
        backgroundColor:
          'light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-7))',
        borderTop:
          '1px solid light-dark(var(--mantine-color-gray-2), var(--mantine-color-dark-5))',
      }}
    >
      <Group gap="md" justify="space-between" wrap="wrap">
        <Group gap="xs">
          <Logo size={14} variant="mark" />
          <Text c="dimmed" size="xs">
            © 2026
          </Text>
        </Group>

        <Group gap="xs">
          <Tooltip label={t('footer:links.github')}>
            <ActionIcon
              aria-label={t('footer:links.github')}
              component="a"
              href={GITHUB_URL}
              rel="noopener noreferrer"
              target="_blank"
            >
              <Icon icon={IconBrandGithub} size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label={t('footer:links.license')}>
            <ActionIcon
              aria-label={t('footer:links.license')}
              component="a"
              href={LICENSE_URL}
              rel="noopener noreferrer"
              target="_blank"
            >
              <Icon icon={IconLicense} size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>
    </Container>
  );
};

export default Footer;
```

Notes:
- Removed `useMantineTheme`, `useMediaQuery`, `Anchor`, `rem` — no longer needed; `Group` `wrap="wrap"` handles mobile layout.
- The translated labels become tooltip + `aria-label` content rather than visible link text. Same i18n keys reused.
- The `footer:copyright` key becomes unused; this is handled by the i18n cleanup task at the end.

- [ ] **Step 2: Type-check**

```bash
pnpm exec tsc --noEmit
```

Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add src/shared/layout/Footer.tsx
git commit -m "refactor(layout): refresh footer with logo and tooltip-icon links"
```

---

## Task 8: Status helpers

**Files:**
- Modify: `src/utils/gameStatusHelpers.tsx`

- [ ] **Step 1: Replace the file content**

Open `src/utils/gameStatusHelpers.tsx`. Replace it entirely with:

```tsx
import type { TFunction } from 'i18next';
import type { GameStatus } from '../slices/types';
import { assertNever } from './assertNever';

export const statusColor = (status: GameStatus): string => {
  switch (status) {
    case 'setup':
      return 'gray';
    case 'in_progress':
      return 'cobalt';
    case 'completed':
      return 'green';
    default:
      return assertNever(status);
  }
};

export const translateGameStatus = (
  t: TFunction,
  status: GameStatus,
): string => {
  switch (status) {
    case 'in_progress':
      return t('gameDetail:status.in_progress');
    case 'completed':
      return t('gameDetail:status.completed');
    case 'setup':
      return t('gameDetail:status.setup');
    default:
      return assertNever(status);
  }
};
```

Notes:
- `statusIcon` is removed entirely.
- The Tabler imports (`IconCheck`, `IconPlayerPlay`, `IconSettings`) are removed.
- `statusColor('in_progress')` now returns `'cobalt'` — matches the theme palette.
- Two callsites (`GameListItem`, `GameViewContent`) currently import `statusIcon`; they will be updated in Tasks 9 and 10 respectively. Until then, `tsc` will fail. **Do NOT commit this task in isolation — bundle Tasks 8, 9, 10 into the same commit OR run them back-to-back without `tsc` between, and verify after Task 10.**

- [ ] **Step 2: Skip independent type-check**

Skipping `tsc` here is intentional. Proceed to Task 9 immediately. The combined commit happens at the end of Task 10.

---

## Task 9: GameListItem refresh

**Files:**
- Modify: `src/pages/games/components/GameListItem.tsx`

- [ ] **Step 1: Replace the file content**

Open `src/pages/games/components/GameListItem.tsx`. Replace it entirely with:

```tsx
import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Divider,
  Group,
  Stack,
  Text,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconTrash } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import Icon from '../../../shared/Icon';
import type { Game } from '../../../slices/types';
import {
  statusColor,
  translateGameStatus,
} from '../../../utils/gameStatusHelpers';

interface GameListItemProps {
  game: Game;
  onDelete: (gameID: number) => void;
}

const GameListItem = ({ game, onDelete }: GameListItemProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    modals.openConfirmModal({
      title: t('games:deleteGame'),
      children: <Text size="sm">{t('games:confirmDelete')}</Text>,
      labels: {
        confirm: t('common:actions.delete'),
        cancel: t('common:actions.cancel'),
      },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        onDelete(game.id);
      },
    });
  };

  const handleOpen = () => {
    void navigate(`/games/${game.id}`);
  };

  const isInProgress = game.status === 'in_progress';

  return (
    <Card className="km-card-interactive" padding="md" onClick={handleOpen}>
      <Stack gap="sm">
        <Group align="center" justify="space-between" wrap="nowrap">
          <Group gap="sm" style={{ flex: 1, minWidth: 0 }}>
            <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
              <Text truncate fw={600} size="lg">
                {game.name}
              </Text>
              <Group gap="xs">
                <Badge
                  className={isInProgress ? 'km-badge-pulse' : undefined}
                  color={statusColor(game.status)}
                >
                  {translateGameStatus(t, game.status)}
                </Badge>
                <Text c="dimmed" size="xs">
                  {game.teams.length} {t('games:picker.teams').toLowerCase()} •{' '}
                  {game.numberOfRounds}{' '}
                  {t('gameDetail:rounds.round').toLowerCase()}
                </Text>
              </Group>
            </Stack>
          </Group>

          <Group gap="xs" wrap="nowrap">
            <Button size="sm" onClick={handleOpen}>
              {t('games:card.viewDetails')}
            </Button>
            <ActionIcon
              aria-label={t('common:actions.delete')}
              color="gray"
              size="lg"
              onClick={handleDelete}
            >
              <Icon icon={IconTrash} size={20} />
            </ActionIcon>
          </Group>
        </Group>

        <Divider />
        <Group gap="md">
          <div>
            <Text c="dimmed" size="xs">
              {t('games:card.details.teamSize')}
            </Text>
            <Text fw={600} size="sm">
              {game.teamSize}
            </Text>
          </div>
          <div>
            <Text c="dimmed" size="xs">
              {t('games:card.details.tableSize')}
            </Text>
            <Text fw={600} size="sm">
              {game.tableSize}
            </Text>
          </div>
          <div>
            <Text c="dimmed" size="xs">
              {t('games:card.details.numberOfRounds')}
            </Text>
            <Text fw={600} size="sm">
              {game.numberOfRounds}
            </Text>
          </div>
          <div>
            <Text c="dimmed" size="xs">
              {t('games:card.details.teams')}
            </Text>
            <Text fw={600} size="sm">
              {game.teams.length}
            </Text>
          </div>
        </Group>
      </Stack>
    </Card>
  );
};

export default React.memo(GameListItem);
```

Changes vs. current:
- `Card` no longer specifies `withBorder`/`shadow`/`radius` — picks up theme defaults; `padding="md"` retained explicitly because the theme default is `lg`.
- New `className="km-card-interactive"` for the hover lift; `onClick={handleOpen}` makes the whole card clickable.
- `e.stopPropagation()` already exists in `handleDelete` and prevents card-level open.
- Game name typography: `fw={500} size="md"` → `fw={600} size="lg"`.
- Status `Badge`: drops `leftSection={statusIcon(...)}`, drops `size="sm" variant="light"` (theme default handles it). Adds `km-badge-pulse` className when `in_progress`.
- Trash `ActionIcon`: `color="red" variant="subtle"` → `color="gray"` (variant comes from theme default), and the icon is wrapped in `<Icon>`.
- Removes the now-unused `statusIcon` import.

- [ ] **Step 2: Skip independent type-check**

Same reason as Task 8 — `GameViewContent` still imports `statusIcon`. Combined verification happens after Task 10.

---

## Task 10: GameViewContent — drop statusIcon usage

**Files:**
- Modify: `src/pages/games/components/GameViewContent.tsx`

- [ ] **Step 1: Read the surrounding context**

```bash
sed -n '20,30p' src/pages/games/components/GameViewContent.tsx
sed -n '178,190p' src/pages/games/components/GameViewContent.tsx
```

You should see an import line that currently reads:

```tsx
import {
  statusColor,
  statusIcon,
  translateGameStatus,
} from '../../../utils/gameStatusHelpers';
```

And a usage around line 183:

```tsx
            leftSection={statusIcon(game.status)}
```

- [ ] **Step 2: Apply two edits**

Edit 1 — remove the `statusIcon` import. Change:

```tsx
import {
  statusColor,
  statusIcon,
  translateGameStatus,
} from '../../../utils/gameStatusHelpers';
```

To:

```tsx
import {
  statusColor,
  translateGameStatus,
} from '../../../utils/gameStatusHelpers';
```

Edit 2 — drop the `leftSection` prop. Find the badge block (around line 178–185, format may vary) and remove the entire `leftSection={statusIcon(game.status)}` line. Leave `color={statusColor(game.status)}` and the badge content untouched.

- [ ] **Step 3: Type-check the combined Tasks 8+9+10**

```bash
pnpm exec tsc --noEmit
```

Expected: passes. If it fails because some other file still imports `statusIcon`, grep:

```bash
grep -rn "statusIcon" src
```

…and remove the import from any file the search surfaces.

- [ ] **Step 4: Run tests**

```bash
pnpm test
```

Expected: all slice tests pass.

- [ ] **Step 5: Commit Tasks 8 + 9 + 10 together**

```bash
git add src/utils/gameStatusHelpers.tsx \
        src/pages/games/components/GameListItem.tsx \
        src/pages/games/components/GameViewContent.tsx
git commit -m "refactor(games): drop statusIcon, use dot badges, refresh game list card"
```

---

## Task 11: Favicon swap

**Files:**
- Create: `public/favicon.svg`
- Modify: `index.html`
- Delete: `public/icons8-dice-64.png`

- [ ] **Step 1: Write the SVG favicon**

Create `public/favicon.svg`:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none">
  <rect x="0.75" y="0.75" width="9.5" height="9.5" stroke="#0f172a" stroke-width="1.5"/>
  <rect x="13.75" y="13.75" width="9.5" height="9.5" stroke="#0f172a" stroke-width="1.5"/>
  <rect x="7" y="7" width="10" height="10" fill="#2563eb"/>
</svg>
```

Note: the favicon stroke uses a hard-coded near-black (`#0f172a`) instead of `currentColor` because favicons render outside of any DOM context — `currentColor` resolves to `black`, which is fine on light browser chrome but goes invisible on dark chrome. The chosen near-black + cobalt centre stays visible on both.

- [ ] **Step 2: Update `index.html`**

Change:

```html
<link rel="icon" type="image/svg+xml" href="/icons8-dice-64.png" />
```

To:

```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
```

- [ ] **Step 3: Remove the old PNG**

```bash
git rm public/icons8-dice-64.png
```

- [ ] **Step 4: Verify**

```bash
pnpm exec tsc --noEmit
```

Expected: passes (HTML/SVG aren't type-checked, but this confirms nothing else broke).

- [ ] **Step 5: Commit**

```bash
git add public/favicon.svg index.html
git commit -m "chore(brand): replace dice favicon with three-square SVG mark"
```

---

## Task 12: Cross-pass — adopt the Icon wrapper

**Files (all Modify):**
- `src/shared/PrintMenu.tsx`
- `src/shared/userMenu/UserMenu.tsx`
- `src/pages/games/Games.tsx`
- `src/pages/games/panels/TeamsPanel.tsx`
- `src/pages/games/panels/RoundsPanel.tsx`
- `src/pages/games/components/TeamForm.tsx`

**Pattern.** Replace each occurrence of `<IconX style={{ width: N, height: N }} />` with `<Icon icon={IconX} size={N} />`, keeping any other props (like `color`) unchanged. This is mechanical; the goal is consistent stroke width across the app.

> **Skip these false positives**: `style={{ width: rem(...) }}` patterns on `UserMenu.tsx` lines 68 and 91 contain extra style properties (`opacity`, etc.) — for those, keep the inline `style` for the non-size properties and replace the `<IconX />` with `<Icon icon={IconX} size={N} ... />` carrying the size only. Lines 102, 187, 194, 250 etc. in `RankingsPanel.tsx`/`RoundsPanel.tsx`/`ScoreSheetsView.tsx` are about `Container`/`Table.Th`/`col` widths, not icons — leave them alone.

- [ ] **Step 1: `src/shared/PrintMenu.tsx` line ~35**

Change:

```tsx
leftSection={<IconPrinter style={{ width: 16, height: 16 }} />}
```

To:

```tsx
leftSection={<Icon icon={IconPrinter} size={16} />}
```

Add at top of imports if not already present:

```tsx
import Icon from './Icon';
```

(`PrintMenu.tsx` lives in `src/shared/`, so the relative path is `./Icon`.)

- [ ] **Step 2: `src/shared/userMenu/UserMenu.tsx` lines ~67–69 and ~91**

For lines ~67–69, the icon is `IconChevronDown` and the style includes `opacity: 0.6` in addition to size. Preserve `opacity` via a wrapping span. Change:

```tsx
<IconChevronDown
  style={{ width: rem(16), height: rem(16), opacity: 0.6 }}
/>
```

To:

```tsx
<span style={{ opacity: 0.6, display: 'inline-flex' }}>
  <Icon icon={IconChevronDown} size={16} />
</span>
```

For line ~91:

```tsx
<IconLogout style={{ width: rem(16), height: rem(16) }} />
```

To:

```tsx
<Icon icon={IconLogout} size={16} />
```

Add import:

```tsx
import Icon from '../Icon';
```

After the change, the `rem` import from `@mantine/core` may become unused. Check:

```bash
grep -n "\brem(" src/shared/userMenu/UserMenu.tsx
```

If no other usages remain, drop `rem` from the `@mantine/core` named import line. Biome's `pnpm exec biome check` (Step 7) will surface this if missed.

- [ ] **Step 3: `src/pages/games/Games.tsx` line ~115**

Change:

```tsx
leftSection={<IconPlus style={{ width: 20, height: 20 }} />}
```

To:

```tsx
leftSection={<Icon icon={IconPlus} size={20} />}
```

Add import:

```tsx
import Icon from '../../shared/Icon';
```

- [ ] **Step 4: `src/pages/games/panels/TeamsPanel.tsx` lines ~164, ~174, ~207, ~216**

Apply the same pattern four times. Add the import:

```tsx
import Icon from '../../../shared/Icon';
```

Replacements (in document order):

```tsx
leftSection={<IconPlus style={{ width: 20, height: 20 }} />}
// →
leftSection={<Icon icon={IconPlus} size={20} />}

leftSection={<IconPlus style={{ width: 20, height: 20 }} />}
// →
leftSection={<Icon icon={IconPlus} size={20} />}

<IconPencil style={{ width: 16, height: 16 }} />
// →
<Icon icon={IconPencil} size={16} />

<IconTrash style={{ width: 16, height: 16 }} />
// →
<Icon icon={IconTrash} size={16} />
```

- [ ] **Step 5: `src/pages/games/panels/RoundsPanel.tsx` lines ~300 and ~310**

```tsx
<IconCheck style={{ width: 14, height: 14 }} />
// →
<Icon icon={IconCheck} size={14} />

<IconClock style={{ width: 14, height: 14 }} />
// →
<Icon icon={IconClock} size={14} />
```

Add import:

```tsx
import Icon from '../../../shared/Icon';
```

- [ ] **Step 6: `src/pages/games/components/TeamForm.tsx` lines ~114 and ~122**

```tsx
<IconTrash style={{ width: 20, height: 20 }} />
// →
<Icon icon={IconTrash} size={20} />

leftSection={<IconPlus style={{ width: 20, height: 20 }} />}
// →
leftSection={<Icon icon={IconPlus} size={20} />}
```

Add import:

```tsx
import Icon from '../../../shared/Icon';
```

- [ ] **Step 7: Verify**

```bash
pnpm exec tsc --noEmit
pnpm exec biome check src
pnpm test
```

Expected: all pass. If `biome` flags an unused import (e.g. an icon is no longer used), remove the offending import.

- [ ] **Step 8: Final scan for missed sites**

```bash
grep -rn 'style={{ width:.*height:' src --include='*.tsx' | grep -i 'icon'
```

Expected: empty. If anything remains, apply the same pattern.

- [ ] **Step 9: Commit**

```bash
git add src/shared/PrintMenu.tsx \
        src/shared/userMenu/UserMenu.tsx \
        src/pages/games/Games.tsx \
        src/pages/games/panels/TeamsPanel.tsx \
        src/pages/games/panels/RoundsPanel.tsx \
        src/pages/games/components/TeamForm.tsx
git commit -m "refactor(icons): adopt shared Icon wrapper for consistent stroke and size"
```

---

## Task 13: i18n cleanup

**Files:**
- Modify (auto-generated): `src/i18n/locales/en/common.json`
- Modify (auto-generated): `src/i18n/locales/de/common.json`

The `common:header.heading` key is no longer referenced anywhere (Header now uses the `<Logo>` SVG component). The `i18next-cli` extract config has `removeUnusedKeys: true`, so a single command takes care of it.

- [ ] **Step 1: Run extract**

```bash
pnpm exec i18next-cli extract
```

Expected:
- `src/i18n/locales/en/common.json` and `src/i18n/locales/de/common.json` have the `header.heading` key removed.
- No other keys are touched.
- If `footer:copyright` was referenced via the old footer (`{ year: '2024' }`), it is also removed by the same pass — that's correct because the new footer hard-codes `© 2026` without using a translation. (The new design accepts that trade-off; localising "©" is unnecessary.)

- [ ] **Step 2: Verify**

```bash
pnpm check
```

Expected: passes (`tsc`, `biome ci`, `i18next-cli status`, `i18next-cli lint`, `i18next-cli extract --ci` all green).

If `i18next-cli status` reports an EN/DE drift, run `pnpm exec i18next-cli extract` once more — the first pass may have only touched one locale due to ordering.

- [ ] **Step 3: Commit**

```bash
git add src/i18n/locales
git commit -m "chore(i18n): drop unused header.heading and footer.copyright keys"
```

---

## Task 14: Final verification

**Files:** none modified — verification only.

- [ ] **Step 1: Run the full check**

```bash
pnpm check
```

Expected: passes.

- [ ] **Step 2: Run tests**

```bash
pnpm test
```

Expected: all pass.

- [ ] **Step 3: Run knip**

```bash
pnpm knip
```

Expected: passes. If knip flags `Logo`, `Icon`, or `theme` as unused, something didn't get wired correctly — re-trace Tasks 3 (theme), 4 (Logo), 5 (Icon).

- [ ] **Step 4: Production build**

```bash
pnpm build
```

Expected: builds cleanly. Any TS or asset errors here surface things the dev server hides (e.g. a missing favicon ref).

- [ ] **Step 5: Manual smoke test in dev**

```bash
pnpm local
```

Verify against the spec's "Success Criteria" section:
- Header shows the new logo (mark + wordmark) in both light and dark.
- Footer shows mark + © 2026 + GitHub/License icon-only buttons with tooltips.
- `/games` shows refreshed cards: hover lift, dot-style status badges, dimmed trash icon.
- An `in_progress` game has a pulsing dot on its badge.
- Toggle the OS colour scheme (or use the in-app `ColorSchemeToggle`); both modes look polished.
- Browser tab favicon shows the three-square mark.

Stop dev server.

- [ ] **Step 6: No commit**

This is verification only — nothing changed.

---

## Out of scope, listed for completeness

The spec excludes these from this plan; do not pull them in mid-execution:
- New tests for `Logo` / `Icon` / `gameStatusHelpers` (existing test conventions cover slices only; UI tests would deviate).
- Mantine wrapper components (`KMCard` etc., explicitly rejected approach B).
- Changes to `Login.tsx`, `GameDetail.tsx`, panel internals beyond the icon-wrapper cross-pass.
- New i18n keys, new Tabler icons, new pages.

If something in this list seems necessary during implementation, stop and surface it for spec amendment rather than expanding scope silently.
