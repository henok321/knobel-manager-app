# UI/UX Refactoring Plan - Knobel Manager App

## Summary

Refactor the Knobel Manager App's UI/UX using Mantine UI components while setting up and leveraging Model Context Protocol (MCP) servers - specifically Playwright MCP - to analyze the current state, identify improvements, and validate changes through automated browser interactions.

## Current State Analysis

Based on exploration, the app has:

### ✅ Strengths

- Solid foundation with Mantine v8 components
- Clean component structure with proper separation
- Responsive design patterns
- Consistent Redux state management
- Good TypeScript typing

### ❌ Gaps Identified

1. **Accessibility**: Minimal ARIA labels, no keyboard shortcuts, color-only status indicators
2. **Design Consistency**: No custom theme, mixed button variants, inconsistent typography weights
3. **Loading States**: Minimal visual feedback during async operations
4. **Form UX**: No auto-save, limited validation feedback, loses intermediate state
5. **Mobile Experience**: Needs touch-optimized interactions, better table handling
6. **Performance**: No debouncing on search, no virtual scrolling for long lists

---

## Phase 1: MCP Setup and Configuration

### 1.1 Verify/Configure Playwright MCP

**Current Status:**

- `.claude/settings.local.json` already has playwright permissions enabled
- Need to verify MCP server is configured at user level

**Configuration Required:**

The user's Claude Code configuration file (`~/.config/claude/config.json` or similar) should include:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-playwright"]
    }
  }
}
```

**Note:** The `next-devtools` MCP mentioned in user's example is for Next.js - not applicable to this Vite + React app.

### 1.2 Install Playwright Browser

Once MCP is configured, install the browser:

```bash
# This will be done via MCP tool: mcp__playwright__browser_install
```

### 1.3 Start Development Server

For Playwright to interact with the app:

```bash
npm run local  # or npm run prod if local backend unavailable
```

---

## Phase 2: Automated UI/UX Analysis with Playwright MCP

Use Playwright MCP to systematically analyze each page:

### 2.1 Navigation and Accessibility Audit

**Pages to Test:**

1. Login page (`/login`)
2. Home/Dashboard (`/`)
3. Games list (`/games`)
4. Game detail (`/games/:gameId`) - Teams, Rounds, Rankings tabs
5. Print views (`/games/:gameId/print`)

**Analysis Checklist per Page:**

- [ ] Take screenshot for visual baseline
- [ ] Navigate through the page flow
- [ ] Test keyboard navigation (Tab, Enter, Escape)
- [ ] Check color contrast using browser snapshot
- [ ] Verify responsive breakpoints (resize browser)
- [ ] Test form interactions and validation
- [ ] Identify missing ARIA labels
- [ ] Check loading states
- [ ] Test error states (network failures)
- [ ] Verify mobile drawer functionality

### 2.2 Component Interaction Testing

**Key Flows to Test:**

#### 1. Authentication Flow

- Login form validation
- Error states
- Success redirect

#### 2. Game Management Flow

- Create new game
- Search/filter games
- Activate game
- Delete game (modal confirmation)

#### 3. Team Management Flow

- Add team to game
- Edit team/player names
- Delete team

#### 4. Score Entry Flow

- Setup matchmaking
- Enter scores per table
- View updated rankings

#### 5. Print Flow

- Access print menu
- Preview different print views

### 2.3 Document Findings

Create a detailed report of:

- Screenshots showing current UI state
- Accessibility violations
- UX friction points
- Performance issues observed
- Mobile responsiveness problems

---

## Phase 3: Design System and Theme Setup

### 3.1 Create Custom Mantine Theme

**File:** `src/theme/theme.ts`

```typescript
import { createTheme, MantineColorsTuple } from '@mantine/core';

// Define custom color palette for Knobeln/dice game theme
const knobelPrimary: MantineColorsTuple = [
  '#e6f7ff', // 0
  '#bae7ff', // 1
  '#91d5ff', // 2
  '#69c0ff', // 3
  '#40a9ff', // 4
  '#1890ff', // 5 - primary
  '#096dd9', // 6
  '#0050b3', // 7
  '#003a8c', // 8
  '#002766', // 9
];

export const theme = createTheme({
  primaryColor: 'knobelPrimary',
  colors: {
    knobelPrimary,
  },
  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  headings: {
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    fontWeight: '600',
  },
  defaultRadius: 'md',
  spacing: {
    xs: '0.5rem', // 8px
    sm: '0.75rem', // 12px
    md: '1rem', // 16px
    lg: '1.5rem', // 24px
    xl: '2rem', // 32px
  },
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 20px rgba(0, 0, 0, 0.15)',
  },
  components: {
    Button: {
      defaultProps: {
        radius: 'md',
      },
    },
    Card: {
      defaultProps: {
        shadow: 'sm',
        padding: 'lg',
        radius: 'md',
        withBorder: true,
      },
    },
    Modal: {
      defaultProps: {
        centered: true,
        overlayProps: {
          backgroundOpacity: 0.55,
          blur: 3,
        },
      },
    },
  },
});
```

### 3.2 Apply Theme to App

**File:** `src/main.tsx`

Update MantineProvider to use custom theme:

```typescript
import { theme } from './theme/theme';

<MantineProvider theme={theme}>
```

### 3.3 Create Design System Components

**Components to Create:**

#### 1. StatusBadge (`src/components/StatusBadge.tsx`)

- Standardized badge with consistent colors
- Props: status, size, withDot
- Includes icon and accessible text

#### 2. LoadingCard (`src/components/LoadingCard.tsx`)

- Skeleton loader matching card layout
- Props: height, withImage, withTitle
- Used during async data loading

#### 3. EmptyState (`src/components/EmptyState.tsx`)

- Consistent empty state with icon, title, description, action
- Props: icon, title, description, actionLabel, onAction
- Replaces inline empty states

#### 4. SearchInput (`src/components/SearchInput.tsx`)

- Debounced search with clear button
- Props: onSearch, debounceMs, placeholder
- Built-in 300ms debounce

#### 5. ConfirmDialog (`src/components/ConfirmDialog.tsx`)

- Reusable confirmation modal
- Props: title, message, confirmLabel, onConfirm
- Standardizes delete confirmations

---

## Phase 4: Systematic UI/UX Improvements

### 4.1 Accessibility Enhancements

**Priority: High**

#### Add ARIA Labels Throughout

- Form inputs (all forms)
- Interactive elements (buttons, links)
- Status indicators
- Navigation elements

#### Keyboard Navigation

- Implement keyboard shortcuts
- Add skip navigation links
- Ensure focus management in modals
- Create keyboard shortcut help dialog (?)

#### Screen Reader Support

- Add ARIA live regions for notifications
- Provide text alternatives for visual-only content
- Proper heading hierarchy

**Files to Modify:**

- `src/pages/Login.tsx`
- `src/pages/home/TeamForm.tsx`
- `src/pages/games/GameForm.tsx`
- `src/pages/games/components/ScoreEntryModal.tsx`
- `src/header/Header.tsx`

### 4.2 Loading and Error States

**Priority: High**

#### Replace CenterLoader with Skeletons

- Create skeleton components for each page
- Use during data fetching
- Show structure while loading

#### Add Loading Indicators

- Button loading states (during save/submit)
- Inline loaders for async actions
- Progress indicators for multi-step processes

#### Improve Error Handling

- Inline error messages
- Error boundaries per route
- Retry mechanisms
- Partial success states

**Files to Modify:**

- `src/pages/home/Home.tsx`
- `src/pages/games/Games.tsx`
- `src/pages/games/GameDetail.tsx`
- `src/slices/games/hooks.ts` (add loading states to hooks)

### 4.3 Form Improvements

**Priority: High**

#### Score Entry Modal

- Convert to controlled inputs
- Add auto-save draft to localStorage
- Show save indicators
- Optimistic updates

#### Team Form

- Allow partial team creation
- Save as draft
- Inline validation
- Better error messages

#### Game Form

- Add form preview
- Validate on blur
- Show field requirements clearly

**Files to Modify:**

- `src/pages/games/components/ScoreEntryModal.tsx`
- `src/pages/home/TeamForm.tsx`
- `src/pages/games/GameForm.tsx`

### 4.4 Mobile Experience

**Priority: Medium**

#### Touch Targets

- Ensure minimum 44x44px
- Add touch feedback (ripple effects)

#### Table Responsiveness

- Convert tables to cards on mobile
- Add horizontal scroll indicators
- Swipe gestures for navigation

#### Modal Optimization

- Full-screen modals on mobile
- Bottom sheets for actions

**Files to Modify:**

- `src/pages/games/panels/RoundsPanel.tsx`
- `src/pages/games/panels/RankingsPanel.tsx`
- `src/pages/games/components/ScoreEntryModal.tsx`

### 4.5 Performance Optimizations

**Priority: Medium**

#### Search Debouncing

- Add 300ms debounce to all search inputs
- Use new SearchInput component

#### Virtual Scrolling

- Add for games list (if > 50 items)
- Add for rankings tables (if > 100 items)

#### Optimistic Updates

- Score entry
- Team/player name edits
- Game activation

**Files to Modify:**

- `src/pages/games/Games.tsx`
- `src/pages/games/panels/TeamsPanel.tsx`
- `src/pages/games/components/ScoreEntryModal.tsx`

### 4.6 Visual Consistency

**Priority: Medium**

#### Standardize Components

- Replace inline styles with theme values
- Use consistent spacing (theme.spacing)
- Standardize button variants
- Consistent typography weights

#### Status Indicators

- Use StatusBadge component
- Add icons to badges
- Consistent color coding

#### Empty States

- Use EmptyState component everywhere
- Add helpful illustrations/icons

**Files to Modify:**

- All component files (systematic refactor)
- Remove inline styles
- Use theme variables

---

## Phase 5: Validation with Playwright MCP

After each improvement phase, use Playwright to:

### Visual Regression Testing

- Take screenshots before/after
- Compare visual changes
- Document improvements

### Functional Testing

- Verify all interactions still work
- Test new keyboard shortcuts
- Validate accessibility improvements

### Performance Testing

- Measure page load times
- Check interaction responsiveness
- Verify no new console errors

### Cross-Browser Testing

- Test on different viewport sizes
- Verify responsive breakpoints
- Check mobile drawer functionality

---

## Phase 6: Documentation and Handoff

### 6.1 Update CLAUDE.md

Add new sections:

- MCP configuration for UI testing
- Custom theme documentation
- New design system components
- Accessibility guidelines

### 6.2 Create UI Documentation

**File:** `src/components/README.md`

Document:

- Component API
- Usage examples
- Accessibility features
- When to use which component

### 6.3 Testing Documentation

Document Playwright MCP workflows for:

- Running UI tests
- Visual regression testing
- Accessibility audits

---

## Implementation Order

### Sprint 1: Foundation (Weeks 1-2)

1. ✅ Setup Playwright MCP
2. ✅ Run comprehensive UI analysis
3. ✅ Create custom Mantine theme
4. ✅ Build design system components
5. ✅ Document findings and baseline

### Sprint 2: Critical Fixes (Weeks 3-4)

1. Accessibility enhancements (ARIA labels, keyboard nav)
2. Loading states (replace spinners with skeletons)
3. Form improvements (controlled inputs, validation)
4. Validate with Playwright

### Sprint 3: Experience (Weeks 5-6)

1. Mobile optimizations
2. Performance improvements (debouncing, virtual scroll)
3. Visual consistency pass
4. Validate with Playwright

### Sprint 4: Polish (Week 7)

1. Edge cases and error handling
2. Final accessibility audit
3. Visual regression testing
4. Documentation updates

---

## Critical Files

### Theme and Design System

- `src/theme/theme.ts` (new)
- `src/components/StatusBadge.tsx` (new)
- `src/components/LoadingCard.tsx` (new)
- `src/components/EmptyState.tsx` (new)
- `src/components/SearchInput.tsx` (new)
- `src/components/ConfirmDialog.tsx` (new)

### High-Impact Improvements

- `src/pages/Login.tsx` - accessibility
- `src/pages/games/components/ScoreEntryModal.tsx` - controlled inputs, auto-save
- `src/pages/home/TeamForm.tsx` - form validation
- `src/header/Header.tsx` - keyboard nav
- `src/pages/games/Games.tsx` - search debouncing
- `src/pages/games/panels/RoundsPanel.tsx` - mobile tables
- `src/pages/games/panels/RankingsPanel.tsx` - mobile tables

### Configuration

- `~/.config/claude/config.json` (or user's Claude config location)
- `src/main.tsx` - apply theme

---

## Verification Steps

### 1. Manual Testing

- [ ] All pages load correctly
- [ ] Forms submit successfully
- [ ] Search and filters work
- [ ] Mobile drawer functions
- [ ] Print views render

### 2. Playwright MCP Testing

- [ ] Navigate through all pages
- [ ] Screenshot comparison (before/after)
- [ ] Keyboard navigation works
- [ ] Forms validate correctly
- [ ] Responsive at all breakpoints

### 3. Accessibility Testing

- [ ] Run automated a11y audit
- [ ] Test with screen reader
- [ ] Verify keyboard-only navigation
- [ ] Check color contrast

### 4. Performance Testing

- [ ] Lighthouse score > 90
- [ ] No console errors
- [ ] Fast interaction to next paint
- [ ] Search responds within 300ms

### 5. Cross-Browser Testing

- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers (iOS Safari, Chrome Android)

---

## Success Metrics

- **Accessibility**: WCAG 2.1 AA compliance, Lighthouse accessibility score > 95
- **Performance**: First contentful paint < 1s, Time to interactive < 2s
- **User Experience**: All critical flows have loading states, error recovery, and clear feedback
- **Design Consistency**: All components use theme values, no inline styles, consistent spacing
- **Mobile**: Touch targets ≥ 44px, tables responsive, forms usable on small screens

---

## UI/UX Issues Identified (From Initial Analysis)

### Accessibility Issues

- Very minimal aria-labels (only 2 occurrences in codebase)
- No focus management in modals beyond autofocus
- No skip navigation links
- No keyboard shortcuts documented
- Color-only status indicators (badges) without text alternatives
- No ARIA live regions for dynamic content updates

### Inconsistencies

- Breadcrumbs use inline styles for dimmed color instead of Mantine's `c="dimmed"`
- GameListItem uses inline styles for active indicator dot instead of a component
- Mixed use of button variants (default, subtle, light, outline, filled) without clear pattern
- Inconsistent empty states - some use Cards, some use bare Text
- Print CSS uses hardcoded colors (#dee2e6) instead of Mantine theme tokens
- Some components use `fw={600}` while others use `fw={500}` or `fw={700}` inconsistently

### Visual/UX Issues

- Home page immediately redirects if there's an active game - no actual dashboard view
- No loading states during game setup/matchmaking beyond text
- Score entry modal uses defaultValue instead of controlled inputs - loses intermediate state on re-open
- GameContextSelector truncates text with no tooltip on hover
- No indication of required vs optional fields in forms
- Delete actions use modals but some could be undoable
- No visual feedback when scores are being saved (optimistic updates)
- Table search in RoundsPanel searches players but no indication of what's being searched
- PrintView has no preview mode - jumps straight to print dialog

### Performance/State Issues

- GameListItem uses React.memo but no dependency array optimization
- Selected tab/round state in localStorage could cause stale data across browser tabs
- No debouncing on search inputs
- fetchGames called on every page mount even if data exists (status check)
- Print views load all data without pagination

### Form UX

- TeamForm requires exact team size - can't save with fewer players
- No confirmation when leaving forms with unsaved changes
- Score entry modal loses intermediate scores if closed without saving
- No input validation feedback until form submission
- NumberInput components allow negative values in some places

---

## Opportunities for Improvement (Detailed)

### Accessibility

- Add comprehensive ARIA labels and roles
- Implement keyboard navigation shortcuts (e.g., / for search, n for new game)
- Add skip navigation links
- Ensure proper focus management in modals and dialogs
- Add ARIA live regions for notifications and dynamic updates
- Provide text alternatives for color-coded status indicators
- Test with screen readers

### Design System

- Create custom Mantine theme with brand colors, typography scale, consistent spacing
- Define semantic color tokens (success, warning, error, info)
- Standardize button hierarchy (primary, secondary, tertiary actions)
- Create consistent empty state component
- Define standard card elevation levels
- Document component usage patterns

### Component Improvements

- Create reusable StatusBadge component with consistent styling
- Build a SearchInput component with clear button and debouncing
- Develop a LoadingCard skeleton component for async states
- Create ConfirmDialog wrapper for consistent deletion patterns
- Build PrintPreview component to show before printing

### UX Enhancements

- Add actual dashboard on home page with statistics and recent activity
- Implement optimistic updates for score entry
- Add undo capability for delete actions
- Show inline validation feedback on forms
- Add tooltips for truncated text
- Implement draft saving for forms
- Add search result counts and filters applied indicators
- Create onboarding flow for first-time users
- Add contextual help tooltips
- Implement skeleton loaders instead of full-page spinners

### Performance

- Add debouncing to search inputs (300ms)
- Implement virtual scrolling for long lists
- Add pagination for print views
- Optimize Redux selectors with better memoization
- Lazy load heavy components (already done for PrintMenu)
- Implement service worker for offline capability

### Mobile Experience

- Test and optimize touch targets (minimum 44x44px)
- Improve mobile table layouts (currently may overflow)
- Add swipe gestures for navigation
- Optimize modal sizes for mobile screens
- Add pull-to-refresh for data updates

### Responsive Design

- Games list grid could be more flexible (currently fixed columns)
- Table layouts need overflow handling on small screens
- Modal sizes should adapt better to viewport
- Print views need mobile optimization

### Error Handling

- Add more specific error messages
- Implement retry mechanisms for failed API calls
- Show partial success states (e.g., "3 of 5 teams saved")
- Add error boundaries at component level, not just app level

### Data Management

- Add data export functionality (CSV, PDF)
- Implement game templates/presets
- Add bulk operations (delete multiple games)
- Create game duplication feature

---

## Notes

This refactoring plan maintains the existing Mantine v8 foundation while addressing key gaps in accessibility, design consistency, mobile experience, and form UX. The approach is incremental and can be implemented in sprints, with validation at each phase using Playwright MCP for automated testing.

The codebase is well-organized (~9,500 lines) with clear routing, state management patterns, and TypeScript typing. Most improvements can be made without major refactoring.
