import { expect, type Page, test } from '@playwright/test';

/**
 * Phone-width regression test for the responsive fixes (scrollable tab list,
 * matrix ScrollContainer, capped user menu). Self-contained on purpose:
 * Playwright projects run in separate workers, so the tournament published by
 * the full-game lifecycle is not reachable here. Leaves an "E2E Mobile View"
 * game behind — same no-cleanup convention as the lifecycle test.
 *
 * Checks 375px (common phone) and 320px (the narrowest supported width, where
 * the original tab and user-menu overflow defects showed up).
 */

const EMAIL = process.env.E2E_EMAIL;
const PASSWORD = process.env.E2E_PASSWORD;

const TEAM_SIZE = 4;
const TABLE_SIZE = 4;
const ROUNDS = 4;
// The lifecycle test's proven matchmaking pool; 4 rounds need far fewer fresh
// opponents per player than these 40 players provide.
const TEAMS = Array.from({ length: 10 }, (_, i) => `M${i + 1}`);
const MEMBER_SUFFIXES = ['One', 'Two', 'Three', 'Four'];
const WIDTHS = [375, 320];

const login = async (page: Page) => {
  await page.goto('/games');
  await expect(page).toHaveURL(/\/login$/);
  await page.getByRole('textbox', { name: 'Email' }).fill(EMAIL as string);
  await page
    .getByRole('textbox', { name: 'Password' })
    .fill(PASSWORD as string);
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/\/games$/);
};

const pageOverflow = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);

const expectNoOverflow = async (page: Page, where: string) => {
  expect(
    await pageOverflow(page),
    `${where}: page overflows horizontally`,
  ).toBeLessThanOrEqual(0);
};

test.beforeAll(() => {
  if (!EMAIL || !PASSWORD) {
    throw new Error(
      'Set E2E_EMAIL and E2E_PASSWORD, or create .env.e2e, to run the playbook.',
    );
  }
});

test('mobile: phone-width views stay inside the viewport', async ({ page }) => {
  await login(page);
  await expectNoOverflow(page, 'games list');

  const gameName = `E2E Mobile View ${new Date()
    .toISOString()
    .replace(/[:.]/g, '-')}`;
  await page.getByRole('button', { name: 'Create game' }).click();
  const d = page.getByRole('dialog');
  await d.getByRole('textbox', { name: 'Name' }).fill(gameName);
  await d.getByRole('textbox', { name: 'Team size' }).fill(String(TEAM_SIZE));
  await d.getByRole('textbox', { name: 'Table size' }).fill(String(TABLE_SIZE));
  await d
    .getByRole('textbox', { name: 'Number of rounds' })
    .fill(String(ROUNDS));
  await d.getByRole('button', { name: 'Create', exact: true }).click();
  await expect(d).toBeHidden();
  await page.getByRole('button', { name: new RegExp(gameName) }).click();
  await expect(page).toHaveURL(/\/games\/\d+$/);

  for (const teamName of TEAMS) {
    await page.getByRole('button', { name: 'Add Team' }).click();
    const teamDialog = page.getByRole('dialog');
    await teamDialog.getByRole('textbox', { name: 'Team name' }).fill(teamName);
    for (const [i, suffix] of MEMBER_SUFFIXES.entries()) {
      await teamDialog.locator(`#player-${i}`).fill(`${teamName} ${suffix}`);
    }
    await teamDialog
      .getByRole('button', { name: 'Create', exact: true })
      .click();
    await expect(teamDialog).toBeHidden();
  }

  // The assignment matrix only renders once tables exist.
  await page.getByRole('tab', { name: 'Rounds' }).click();
  await page.getByRole('button', { name: 'Setup Matchmaking' }).click();
  await expect(
    page
      .getByRole('tabpanel', { name: 'Rounds' })
      .getByRole('heading', { name: /^Table / }),
  ).toHaveCount((TEAMS.length * TEAM_SIZE) / TABLE_SIZE);

  for (const width of WIDTHS) {
    await page.setViewportSize({ width, height: 667 });
    await expectNoOverflow(page, `game detail @${width}`);

    // The tab bar must stay one scrollable row instead of wrapping/overflowing.
    const tabBar = await page.evaluate(() => {
      const list = document.querySelector('[role=tablist]');
      return {
        rows: new Set(
          [...document.querySelectorAll('[role=tab]')].map((t) =>
            Math.round(t.getBoundingClientRect().top),
          ),
        ).size,
        scrollsInternally: list !== null && list.scrollWidth > list.clientWidth,
      };
    });
    expect(tabBar.rows, `tab bar rows @${width}`).toBe(1);
    expect(
      tabBar.scrollsInternally,
      `tab bar scrolls internally @${width}`,
    ).toBe(true);

    for (const name of [
      'Teams',
      'Rounds',
      'Rankings',
      'Administration',
      'Audit Log',
    ]) {
      await page.getByRole('tab', { name }).click();
      await expect(page.getByRole('tabpanel', { name })).toBeVisible();
      await expectNoOverflow(page, `${name} tab @${width}`);
    }

    // 4 rounds exceed the phone width: the matrix must keep its minimum width
    // (160 + rounds * 60) and scroll inside its ScrollContainer, not squeeze
    // its columns to the container width.
    await page.getByRole('tab', { name: 'Teams' }).click();
    await expect(page.getByRole('tabpanel', { name: 'Teams' })).toBeVisible();
    const matrixW = await page.evaluate(() => {
      const table = [...document.querySelectorAll('table')].find((t) =>
        t.querySelector('caption'),
      );
      return table ? Math.round(table.getBoundingClientRect().width) : null;
    });
    expect(matrixW, `assignment matrix rendered @${width}`).not.toBeNull();
    expect(
      matrixW,
      `matrix keeps column width @${width}`,
    ).toBeGreaterThanOrEqual(160 + ROUNDS * 60);

    // The 360px user menu must be capped to the viewport.
    await page.locator('header button').last().click();
    await expect(page.getByRole('menu')).toBeVisible();
    const menuFit = await page.evaluate(() => {
      const rect = document
        .querySelector('[role=menu]')
        ?.getBoundingClientRect();
      return rect
        ? { left: rect.left, right: rect.right, innerW: window.innerWidth }
        : null;
    });
    expect(menuFit, `user menu opened @${width}`).not.toBeNull();
    expect(
      menuFit?.left,
      `user menu left edge @${width}`,
    ).toBeGreaterThanOrEqual(0);
    expect(
      menuFit?.right,
      `user menu right edge @${width}`,
    ).toBeLessThanOrEqual(menuFit?.innerW ?? 0);
    await page.keyboard.press('Escape');
  }
});
