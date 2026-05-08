# Design Refresh — Knobel Manager v2 Look

- **Date:** 2026-05-08
- **Owner:** Hendrik Brinkmann
- **Status:** Approved (brainstorming)
- **Implementation approach:** A — Theme + targeted component updates

## Context

The app currently uses Mantine v9's default theme. Visually it is indistinguishable from any other Mantine application: default blue primary, default font stack, generic `IconDice` from Tabler in a `ThemeIcon variant="light"` as the only logo, bullet-separated text links in the footer, default `Card`/`Badge` look. Functionally everything works; what is missing is an own, recognisable look.

This spec captures the refresh: keep Mantine, introduce a curated theme layer on top, and update a small number of identity-bearing components (logo, header, footer, status badge, game list card, icon defaults).

## Goals

- Recognisable identity for the app: own logo, own accent treatment, consistent icon style.
- Functional and clean: high legibility, no decoration that hurts long-session use, works in pubs (low light) and outdoors (sunlight).
- Light and dark mode equally polished; existing `defaultColorScheme="auto"` is preserved.
- No breaking changes to component APIs, Redux slices, hooks, tests, routing, generated API code, i18n keys, or form logic.

## Non-Goals

- New layouts beyond logo/header/footer/cards/badges. No restructure of `Games`, `GameDetail`, `Login` page composition.
- No replacement of Tabler with a different icon library.
- No webfont loading. System stack only.
- No design system extraction or wrapper-component layer (rejected approach B).
- No new pages, no new features.

## Compatibility Statement

"No breaking changes" in this spec means:

- Mantine component prop signatures are not wrapped or re-typed.
- Public surfaces of the app (routes, API, i18n contracts, Redux state shape) are unchanged.
- Existing tests pass without modification.

The `statusIcon` helper in `src/utils/gameStatusHelpers.tsx` is removed intentionally as part of moving to the dot-variant badge. This is an internal API change with two known callsites that are updated in the same change.

## Locked Design Decisions

| Decision | Value | Source |
| --- | --- | --- |
| Aesthetic mood | Modern productive tool (Linear/Vercel-Vibe) | Brainstorming Q1 |
| Logo motif | Abstract geometric — three overlapping squares | Brainstorming Q2 + Q-design |
| Accent colour | Cobalt `#2563eb` (custom Mantine 10-step scale) | Brainstorming Q3a |
| Colour scheme strategy | Auto, both schemes equally polished | Brainstorming Q4 |
| Typography | System stack (no webfont), tabular numerals globally | Brainstorming Q5 |
| Implementation approach | A — Theme + targeted component updates | Brainstorming approach selection |

## Architecture

A new `src/theme.ts` exports a `MantineThemeOverride` that is passed to `MantineProvider` in `src/App.tsx`. The theme defines:

- A custom `cobalt` 10-step colour palette and sets `primaryColor: 'cobalt'`.
- `defaultRadius: 'md'`.
- `fontFamily` and `fontFamilyMonospace` as system stacks.
- `headings.fontWeight: '600'`.
- Component `defaultProps` and `styles` overrides for `Card`, `Badge`, `Button`, `ActionIcon` where the look is touched globally (e.g. card border colour, badge default size).
- A global CSS layer (via `<MantineProvider />` `cssVariablesResolver` or a single CSS file imported in `App.tsx`) sets `font-feature-settings: "tnum", "ss01"` on `:root` so that all numerals are tabular by default — important for tournament tables and scores.

Two new shared components are introduced:

- `src/shared/Logo.tsx` — SVG-based, prop `variant: 'mark' | 'full'` and prop `size?: number`.
- `src/shared/Icon.tsx` — thin wrapper around a Tabler icon, applies `strokeWidth={1.5}` and `size={18}` defaults; accepts overrides.

Existing files are updated in place: `Header.tsx`, `Footer.tsx`, `gameStatusHelpers.tsx`, `GameListItem.tsx`, `index.html` (favicon).

## Component Details

### Theme tokens (`src/theme.ts`)

**Cobalt palette.** A 10-step Mantine-conformant scale built around `#2563eb`:

```
[0] #eef2ff  (lightest tint, hover backgrounds)
[1] #e0e7ff
[2] #c7d2fe
[3] #a5b4fc
[4] #818cf8
[5] #4f6ef0
[6] #2563eb  ← primary shade (light theme)
[7] #1d4ed8
[8] #1e40af
[9] #172554  (deepest)
```

Mantine's `primaryShade` is left at default (`{ light: 6, dark: 8 }`) so dark theme automatically picks the deeper navy variant.

**Status semantic colours.** Used by `gameStatusHelpers.statusColor`:

- `setup` → Mantine `gray.5` (light) / `gray.6` (dark) — muted, not yet started.
- `in_progress` → `cobalt.6` — active, primary identity colour.
- `completed` → Mantine `green.6` — done.

**Other tokens.**

- `defaultRadius: 'md'`.
- `fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'`.
- `fontFamilyMonospace: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace'`.
- `headings.fontWeight: '600'`.

**Component defaults.**

- `Card`: `defaultProps: { radius: 'md', shadow: 'sm', withBorder: true }`; `styles` set border to `var(--mantine-color-gray-2)` light / `var(--mantine-color-dark-5)` dark.
- `Badge`: `defaultProps: { variant: 'dot', size: 'sm', radius: 'sm' }`.
- `Button`: `defaultProps: { radius: 'md' }`.
- `ActionIcon`: `defaultProps: { variant: 'subtle' }` (was previously sometimes default-`filled`-looking).

**Global CSS.** Imported once in `App.tsx`:

```css
:root { font-feature-settings: "tnum", "ss01"; }
```

### Logo (`src/shared/Logo.tsx`)

Single SVG, two render modes via `variant` prop, size in pixels.

**Glyph:** three squares on a 24×24 viewBox, two outlined with `currentColor` and one filled with the cobalt accent (`var(--mantine-color-cobalt-6)`). Stroke width 1.5, no rounded corners (geometric/architectural feel). Coordinates are inset by 0.75 (half of stroke width) so the outline never clips at the viewport edge:

- Top-left square: outline, 9.5×9.5, at (0.75, 0.75).
- Bottom-right square: outline, 9.5×9.5, at (13.75, 13.75).
- Centre square: filled (no stroke), 10×10, at (7, 7), drawn last so it overlaps both outlines.

`currentColor` makes the outlines respect text colour automatically in both schemes; the centre square uses the cobalt CSS variable directly.

**`variant='mark'`**: renders only the 24×24 glyph, scaled to `size`.
**`variant='full'`**: renders the glyph (size 28) followed by the wordmark "Knobel Manager" in `fontWeight: 600`, `letterSpacing: -0.01em`, font size derived from `size` (default 16). The wordmark is a regular `<span>` styled inline; no SVG text — keeps the wordmark accessible and resizable.

### Icon wrapper (`src/shared/Icon.tsx`)

```tsx
import type { TablerIcon } from '@tabler/icons-react';

type Props = {
  icon: TablerIcon;
  size?: number;
  strokeWidth?: number;
  color?: string;
};
const Icon = ({ icon: IconComp, size = 18, strokeWidth = 1.5, color }: Props) =>
  <IconComp size={size} stroke={strokeWidth} color={color} />;
```

Existing inline `style={{ width: 20, height: 20 }}` patterns at icon usage sites are replaced with `<Icon icon={IconX} size={20} />`. Migration done page-by-page after the core changes land; not required for the look to take effect.

### Header (`src/shared/layout/Header.tsx`)

- Replace `<ThemeIcon variant="light"><IconDice /></ThemeIcon>` + `<Title>{t(...)}</Title>` with `<Logo variant="full" size={16} />` (clickable wrapper retained, navigates to `/`).
- Centre column intentionally empty.
- Right column: existing `<UserMenu />` when `navbarActive`.
- Border-bottom replaced with `1px solid var(--mantine-color-gray-2)` light / `var(--mantine-color-dark-5)` dark; no shadow.
- The `i18n` key `common:header.heading` is still consumed — but now from inside `<Logo>` rather than from `Header.tsx`. The brand-name string differs slightly between EN ("Knobel Manager") and DE ("Knobel-Manager"), and the project's `i18next-cli lint` rule flags hardcoded user-facing strings. The wordmark therefore reads `t('common:header.heading')` instead of being literal in the JSX. The key is **kept**, not removed.

### Footer (`src/shared/layout/Footer.tsx`)

- Three-column flex: left (`<Logo variant="mark" size={14} />` + `© {year}` `Text size="xs" c="dimmed"`), centre empty, right (two `ActionIcon`s with `Tooltip`s — GitHub, License — both `variant="subtle"` `size="md"`, using the new `<Icon>` wrapper).
- The translated label texts (`footer:links.github`, `footer:links.license`) become tooltip content rather than visible link text.
- i18n keys are reused, not removed.
- Background remains `var(--mantine-color-gray-0)` light / `var(--mantine-color-dark-7)` dark; border-top retained.
- Mobile breakpoint kept; on `<sm` the right column wraps below.

### Status badges (`src/utils/gameStatusHelpers.tsx`)

`statusColor` continues to return a Mantine colour key, but the values change:

- `setup` → `'gray'`
- `in_progress` → `'cobalt'`
- `completed` → `'green'`

`statusIcon` is removed. Badges now rely on the Mantine `dot` variant, which renders a small coloured dot before the label automatically. Two callsites update accordingly by dropping the `leftSection={statusIcon(...)}` prop:

- `src/pages/games/components/GameListItem.tsx` (line 65 today).
- `src/pages/games/components/GameViewContent.tsx` (line 183 today).

The badge `variant` is set globally in theme `defaultProps`, so callers do not need to pass it.

For `in_progress`, an additional CSS animation pulses the dot. Approach: a CSS class `.km-badge-pulse` defined in the same global CSS file; conditionally applied via `className` on the badge when status is `in_progress`. Animation is 1.4s steps(2) ease-in-out infinite, opacity 1 → 0.4 → 1.

### GameListItem (`src/pages/games/components/GameListItem.tsx`)

- Card now picks up the new theme defaults (radius, shadow, border colour) automatically — no per-instance overrides needed.
- Add `style={{ cursor: 'pointer', transition: 'transform 0.15s ease, box-shadow 0.15s ease' }}` on the outer card (currently the card itself isn't clickable — only the "Details" button is; the design preserves that affordance but adds visual feedback).
- Hover effect: `:hover` raises shadow from `sm` to `md` and applies `transform: translateY(-1px)`. Implemented via inline style + `onMouseEnter`/`Leave` is too noisy; instead a small CSS class `.km-card-interactive` is added in the global CSS.
- Game name typography: `<Text fw={600} size="lg">` (was `fw={500} size="md"`).
- Status badge: `<Badge color={statusColor(game.status)}>{translateGameStatus(t, game.status)}</Badge>` — variant comes from theme defaults, no `leftSection`.
- Delete `ActionIcon`: change `color="red"` → `color="gray"`. The hover state of `variant="subtle"` already gives visual feedback; the red colour pre-action is overly alarming.
- Stats row at the bottom uses `Text fw={600}` for the value — already mono-numeric thanks to global `tnum`.

### Favicon (`index.html` + `public/`)

- Replace `public/icons8-dice-64.png` with a new `public/favicon.svg` containing only the glyph.
- `index.html` `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />`.
- Old PNG kept as a fallback only if needed; otherwise removed.

## Migration Order

The order is chosen so the look becomes visible early and each step is independently reviewable.

1. `src/theme.ts` — token file, exports `MantineThemeOverride`.
2. `src/App.tsx` — pass theme + import global CSS.
3. `src/shared/Logo.tsx` — new SVG component.
4. `src/shared/Icon.tsx` — new wrapper.
5. `src/shared/layout/Header.tsx` — swap to `<Logo />`.
6. `src/shared/layout/Footer.tsx` — refresh.
7. `src/utils/gameStatusHelpers.tsx` — drop `statusIcon`, update colours.
8. `src/pages/games/components/GameListItem.tsx` — card refresh, drop `leftSection`, dim trash.
9. `src/pages/games/components/GameViewContent.tsx` — drop `leftSection={statusIcon(...)}` on the status badge (same change pattern as step 8, but no other card edits).
10. `index.html` + `public/favicon.svg` — favicon swap.
11. Cross-pass: replace inline `style={{ width: N, height: N }}` icon sizing with `<Icon icon={...} size={N} />` across remaining files. Mechanical, can be done file-by-file.
12. `i18n` cleanup — remove unused `common:header.heading` key from EN + DE; run `pnpm exec i18next-cli extract` to apply.

## What Is *Not* Changing

- Mantine component APIs.
- Redux slices, hooks, and `cross-slice.test.ts`.
- `react-router` routes and `ProtectedRoute`.
- `src/generated/` (OpenAPI client/types).
- `src/api/apiClient.ts`.
- i18n configuration; only one unused key removed.
- Form logic (`@mantine/form`), `ModalsProvider`, `Notifications`.
- Page composition for `Games`, `GameDetail`, `Login` beyond what is listed above.

## Success Criteria

- `pnpm check` passes (`tsc`, `biome ci`, `i18next-cli` status/lint/extract).
- `pnpm test` passes; no test changes required for the look refresh.
- `pnpm fix` produces no diff.
- Manual inspection in dev mode (`pnpm local`):
  - Header shows new logo (mark + wordmark) in both schemes.
  - Footer shows mark + © + two icon-only action buttons with tooltips.
  - Games list shows refreshed cards with hover lift, dot-style status badges, dimmed trash icon.
  - Active game shows pulsing in-progress badge dot.
  - Switching system colour scheme yields a polished result in both modes.
  - Favicon shows the abstract three-square glyph.

## Risks and Mitigations

| Risk | Mitigation |
| --- | --- |
| Custom `cobalt` palette renders poorly in dark mode at `primaryShade.dark = 8`. | Validate by toggling scheme and checking button/badge contrast against `dark.7`. Adjust shade or shift `primaryShade.dark` to 7 if needed. |
| `font-feature-settings: "tnum"` interferes with proportional numerals in body copy where they're preferred. | `tnum` keeps width consistent but doesn't change glyph design. Acceptable trade-off for tournament data; revisit only if visually disruptive. |
| Pulse animation on the `in_progress` dot causes motion sensitivity issues. | Wrap animation in `@media (prefers-reduced-motion: reduce) { animation: none; }`. |
| `<Logo>` SVG glyph fails to read at 14px (footer). | Test at 14, 16, 28 px. If needed, reduce stroke to 1.25 px at small sizes via a `size`-derived attribute. |
| `i18n` key removal breaks `pnpm check`. | Run `pnpm exec i18next-cli extract` after the change; the key only exists in `common.json` and is referenced once. |

## Open Questions

None. All decisions captured in "Locked Design Decisions" table above.
