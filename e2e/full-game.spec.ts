import { expect, type Locator, type Page, test } from '@playwright/test';

/**
 * Needs a running `pnpm local` + backend:
 *   E2E_EMAIL=... E2E_PASSWORD=... pnpm test:e2e
 *
 * Matchmaking seats players randomly and the API's row order is unstable, so
 * expectations are computed from the scores typed here and rows compared as sets.
 */

const EMAIL = process.env.E2E_EMAIL;
const PASSWORD = process.env.E2E_PASSWORD;

const TEAM_SIZE = 4;
const TABLE_SIZE = 4;
const ROUNDS = 2;
const TEAM_NAMES = [
  'Team Alpha',
  'Team Bravo',
  'Team Charlie',
  'Team Delta',
  'Team Echo',
  'Team Foxtrot',
  'Team Golf',
  'Team Hotel',
  'Team India',
  'Team Juliett',
];
const LATE_TEAM = 'Team Kilo';
const MEMBER_SUFFIXES = ['Eins', 'Zwei', 'Drei', 'Vier'];
const RENAMED_TEAM = 'Team Charlie Umbenannt';
const RENAMED_PLAYER = 'Charlie Zwei Geaendert';

const memberNames = (teamName: string) =>
  MEMBER_SUFFIXES.map((suffix) => `${teamName.replace('Team ', '')} ${suffix}`);

interface ScoreRecord {
  perRound: Map<number, Map<string, number>>;
  teamOfPlayer: Map<string, string>;
}

const newRecord = (): ScoreRecord => ({
  perRound: new Map(),
  teamOfPlayer: new Map(),
});

const remember = (
  record: ScoreRecord,
  round: number,
  player: string,
  team: string,
  score: number,
) => {
  const round_ = record.perRound.get(round) ?? new Map<string, number>();
  round_.set(player, score);
  record.perRound.set(round, round_);
  record.teamOfPlayer.set(player, team);
};

const playerTotals = (record: ScoreRecord, rounds: number[]) => {
  const totals = new Map<string, number>();
  for (const round of rounds) {
    for (const [player, score] of record.perRound.get(round) ?? []) {
      totals.set(player, (totals.get(player) ?? 0) + score);
    }
  }
  return totals;
};

const teamTotals = (record: ScoreRecord, rounds: number[]) => {
  const totals = new Map<string, number>();
  for (const [player, score] of playerTotals(record, rounds)) {
    const team = record.teamOfPlayer.get(player);
    if (team) {
      totals.set(team, (totals.get(team) ?? 0) + score);
    }
  }
  return totals;
};

interface Tournament {
  gameId: string;
  gameName: string;
  record: ScoreRecord;
  totalTables: number;
}

let built: Tournament | null = null;

const tournament = (): Tournament => {
  if (!built) {
    throw new Error('the lifecycle test did not publish a tournament');
  }
  return built;
};

const dialog = (page: Page) => page.getByRole('dialog');

const cardByHeading = (panel: Locator, page: Page, heading: string) =>
  panel
    .locator('.mantine-Card-root')
    .filter({ has: page.getByRole('heading', { exact: true, name: heading }) })
    .first();

/** Mantine keeps closed dropdowns in the DOM, so options must be filtered to the open one. */
const selectOption = async (page: Page, combo: Locator, label: string) => {
  await combo.click();
  await page
    .locator('[role=option]:visible')
    .filter({ hasText: label })
    .first()
    .click();
  await expect(combo).toHaveValue(label);
};

const panelFor = (page: Page, name: string) =>
  page.getByRole('tabpanel', { name });

const openTab = async (page: Page, name: string) => {
  await page.getByRole('tab', { name }).click();
  const panel = panelFor(page, name);
  await expect(panel).toBeVisible();
  return panel;
};

/** Every context starts unauthenticated, so this also covers the protected-route redirect. */
const login = async (page: Page) => {
  await page.goto('/games');
  await expect(page).toHaveURL(/\/login$/);
  await page.getByRole('textbox', { name: 'Email' }).fill(EMAIL as string);
  await page
    .getByRole('textbox', { name: 'Password' })
    .fill(PASSWORD as string);
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/\/games$/);
  await expect(page.getByRole('button', { name: 'Create game' })).toBeVisible();
};

const readScoreModal = async (page: Page) => {
  const d = dialog(page);
  await expect(d).toBeVisible();
  const lines = (await d.innerText()).split('\n');
  const entries = lines
    .filter((line) => /\(.+\)$/.test(line.trim()))
    .map((line) => {
      const match = /^(.*) \((.*)\)$/.exec(line.trim());
      return { player: match?.[1] ?? '', team: match?.[2] ?? '' };
    });
  const values = await d
    .locator('input')
    .evaluateAll((els) => els.map((el) => (el as HTMLInputElement).value));
  const title = lines[0] ?? '';
  return {
    entries,
    values,
    title,
    tableNumber: Number(/(\d+)$/.exec(title)?.[1]),
  };
};

const createTeam = async (page: Page, teamName: string) => {
  await page.getByRole('button', { name: 'Add Team' }).click();
  const d = dialog(page);
  await expect(
    d.getByRole('button', { name: 'Create', exact: true }),
  ).toBeDisabled();
  await d.getByRole('textbox', { name: 'Team name' }).fill(teamName);
  for (let i = 1; i < TEAM_SIZE; i++) {
    await d.getByRole('button', { name: 'Add member' }).click();
  }
  await expect(d.getByRole('button', { name: 'Add member' })).toBeDisabled();
  const names = memberNames(teamName);
  for (const [i, name] of names.entries()) {
    await d.locator(`#player-${i}`).fill(name);
  }
  return names;
};

/** A map, not a list: the API's row order is unstable. */
const scoreRowsFor = async (page: Page, expectedTables: number) => {
  const panel = panelFor(page, 'Rounds');
  // Saving invalidates the round query; wait for the cards to come back.
  await expect(panel.getByRole('button', { name: 'Edit Scores' })).toHaveCount(
    expectedTables,
  );

  const rows = await panel
    .locator('tbody tr')
    .evaluateAll((trs) =>
      trs.map((tr) =>
        [...tr.querySelectorAll('td')].map((cell) =>
          (cell as HTMLElement).innerText.trim(),
        ),
      ),
    );
  const scores = new Map<string, number>();
  for (const row of rows) {
    if (row.length === 3 && row[2] !== '-') {
      scores.set(row[0] as string, Number(row[2]));
    }
  }
  return scores;
};

/** Rank / name / score rows, split by column count: 3 = team, 4 = player. */
const readRankingRows = async (panel: Locator) => {
  const rows = await panel
    .locator('tbody tr')
    .evaluateAll((trs) =>
      trs.map((tr) =>
        [...tr.querySelectorAll('td,th')].map((cell) =>
          (cell as HTMLElement).innerText.trim(),
        ),
      ),
    );
  return {
    teamRows: rows.filter((r) => r.length === 3),
    playerRows: rows.filter((r) => r.length === 4),
  };
};

test.skip(
  !EMAIL || !PASSWORD,
  'Set E2E_EMAIL and E2E_PASSWORD to run the tournament playbook.',
);

test('tournament lifecycle: create, rename, matchmaking conflict, every score, score edit', async ({
  page,
}) => {
  const consoleErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  const gameName = `E2E Turnier ${new Date().toISOString().replace(/[:.]/g, '-')}`;
  const record = newRecord();
  let gameId = '';

  await test.step('login, and /games redirects there when signed out', async () => {
    await login(page);
  });

  await test.step('create the game', async () => {
    await page.getByRole('button', { name: 'Create game' }).click();
    const d = dialog(page);
    await d.getByRole('textbox', { name: 'Name' }).fill(gameName);
    await d.getByRole('textbox', { name: 'Team size' }).fill(String(TEAM_SIZE));
    await d
      .getByRole('textbox', { name: 'Table size' })
      .fill(String(TABLE_SIZE));
    await d
      .getByRole('textbox', { name: 'Number of rounds' })
      .fill(String(ROUNDS));
    await d.getByRole('button', { name: 'Create', exact: true }).click();
    await expect(d).toBeHidden();

    await page.getByRole('button', { name: new RegExp(gameName) }).click();
    await expect(page).toHaveURL(/\/games\/\d+$/);
    gameId = page.url().split('/').pop() as string;
    await expect(
      page.getByRole('heading', { level: 1, name: gameName }),
    ).toBeVisible();
  });

  await test.step('matchmaking is refused before enough teams exist', async () => {
    await openTab(page, 'Rounds');
    await expect(
      page.getByRole('button', { name: 'Setup Matchmaking' }),
    ).toBeDisabled();
  });

  await test.step(`create ${TEAM_NAMES.length} teams`, async () => {
    const teamsPanel = await openTab(page, 'Teams');
    for (const teamName of TEAM_NAMES) {
      const names = await createTeam(page, teamName);
      await dialog(page)
        .getByRole('button', { name: 'Create', exact: true })
        .click();
      await expect(dialog(page)).toBeHidden();
      await expect(
        teamsPanel.getByRole('heading', { exact: true, name: teamName }),
      ).toBeVisible();
      for (const name of names) {
        await expect(teamsPanel.getByText(name, { exact: true })).toBeVisible();
      }
    }
    await expect(page.getByText(`Teams: ${TEAM_NAMES.length}`)).toBeVisible();
  });

  await test.step('rename a team and one of its players', async () => {
    const teamsPanel = panelFor(page, 'Teams');
    await teamsPanel.getByRole('button', { name: 'Edit Team Charlie' }).click();
    const d = dialog(page);
    await expect(d.getByRole('textbox', { name: 'Team Name' })).toHaveValue(
      'Team Charlie',
    );
    await d.getByRole('textbox', { name: 'Team Name' }).fill(RENAMED_TEAM);
    await d.getByRole('textbox', { name: 'Player 2' }).fill(RENAMED_PLAYER);
    await d.getByRole('button', { name: 'Save' }).click();
    await expect(d).toBeHidden();

    await expect(
      teamsPanel.getByRole('heading', { exact: true, name: RENAMED_TEAM }),
    ).toBeVisible();
    await expect(
      teamsPanel.getByText(RENAMED_PLAYER, { exact: true }),
    ).toBeVisible();
    await expect(
      teamsPanel.getByRole('heading', { exact: true, name: 'Team Charlie' }),
    ).toHaveCount(0);
  });

  const expectedTables = (TEAM_NAMES.length * TEAM_SIZE) / TABLE_SIZE;

  await test.step('run matchmaking', async () => {
    const roundsPanel = await openTab(page, 'Rounds');
    await page.getByRole('button', { name: 'Setup Matchmaking' }).click();
    await expect(
      roundsPanel.getByRole('heading', { name: /^Table / }),
    ).toHaveCount(expectedTables);
    await expect(roundsPanel.getByText(RENAMED_TEAM).first()).toBeVisible();
  });

  await test.step('adding a team after matchmaking raises a conflict and offers a reset', async () => {
    await openTab(page, 'Teams');
    await createTeam(page, LATE_TEAM);
    await dialog(page)
      .getByRole('button', { name: 'Create', exact: true })
      .click();

    // The 409 must surface as a reset offer, not a silent failure.
    const resetDialog = page.getByRole('dialog', { name: 'Reset Matchmaking' });
    await expect(resetDialog).toBeVisible();
    await expect(
      page
        .getByRole('dialog')
        .filter({ hasText: 'Create team' })
        .getByRole('textbox', {
          name: 'Team name',
        }),
    ).toHaveValue(LATE_TEAM);

    await resetDialog
      .getByRole('button', { name: 'Reset Matchmaking' })
      .click();

    const teamsPanel = panelFor(page, 'Teams');
    await expect(
      teamsPanel.getByRole('heading', { exact: true, name: LATE_TEAM }),
    ).toBeVisible();
    await expect(
      page.getByText(`Teams: ${TEAM_NAMES.length + 1}`),
    ).toBeVisible();

    await openTab(page, 'Rounds');
    await expect(
      page.getByRole('button', { name: 'Setup Matchmaking' }),
    ).toBeEnabled();
  });

  const totalTables = ((TEAM_NAMES.length + 1) * TEAM_SIZE) / TABLE_SIZE;

  await test.step('re-run matchmaking with the added team', async () => {
    const roundsPanel = panelFor(page, 'Rounds');
    await page.getByRole('button', { name: 'Setup Matchmaking' }).click();
    await expect(
      roundsPanel.getByRole('heading', { name: /^Table / }),
    ).toHaveCount(totalTables);
    await expect(roundsPanel.getByText(`${LATE_TEAM}`).first()).toBeVisible();
  });

  await test.step('start the game', async () => {
    await page.getByRole('button', { name: 'Start Game' }).click();
    await dialog(page).getByRole('button', { name: 'Start Game' }).click();
    await expect(dialog(page)).toBeHidden();
    await expect(page.getByText('IN PROGRESS')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Finalize Game' }),
    ).toBeVisible();
    await expect(
      page.getByText(`Tables: ${totalTables * ROUNDS}`),
    ).toBeVisible();
  });

  let counter = 0;

  const enterAllScoresForRound = async (round: number) => {
    const roundsPanel = panelFor(page, 'Rounds');
    await selectOption(
      page,
      roundsPanel.getByRole('combobox', { name: 'Select Round' }),
      `Round ${round}`,
    );
    await expect(
      page.getByRole('button', { name: 'Enter Scores' }),
    ).toHaveCount(totalTables);

    for (let i = 0; i < totalTables; i++) {
      await page.getByRole('button', { name: 'Enter Scores' }).first().click();
      const { entries, title } = await readScoreModal(page);
      expect(entries).toHaveLength(TABLE_SIZE);
      expect(title).toContain('Enter Scores');
      const d = dialog(page);
      for (const [index, entry] of entries.entries()) {
        counter += 1;
        await d.locator('input').nth(index).fill(String(counter));
        remember(record, round, entry.player, entry.team, counter);
      }
      await d.getByRole('button', { name: 'Save Scores' }).click();
      await expect(d).toBeHidden();

      // Until the refetch lands the saved table keeps its stale button, and
      // the next iteration would re-open it.
      await expect(
        page.getByRole('button', { name: 'Enter Scores' }),
      ).toHaveCount(totalTables - i - 1);
    }

    await expect(page.getByRole('button', { name: 'Edit Scores' })).toHaveCount(
      totalTables,
    );
  };

  for (const round of [1, 2]) {
    await test.step(`enter every score for round ${round}`, async () => {
      await enterAllScoresForRound(round);

      const rows = await scoreRowsFor(page, totalTables);
      for (const [player, score] of record.perRound.get(round) ?? []) {
        expect(rows.get(player), `round ${round} score for ${player}`).toBe(
          score,
        );
      }
    });
  }

  await test.step('the selected round survives a tab switch', async () => {
    const roundsPanel = panelFor(page, 'Rounds');
    await selectOption(
      page,
      roundsPanel.getByRole('combobox', { name: 'Select Round' }),
      'Round 1',
    );
    await openTab(page, 'Rankings');
    await openTab(page, 'Rounds');
    await expect(
      panelFor(page, 'Rounds').getByRole('combobox', { name: 'Select Round' }),
    ).toHaveValue('Round 1');
  });

  await test.step('editing one score leaves the other players at that table untouched', async () => {
    const roundsPanel = panelFor(page, 'Rounds');
    await selectOption(
      page,
      roundsPanel.getByRole('combobox', { name: 'Select Round' }),
      'Round 1',
    );

    await cardByHeading(roundsPanel, page, 'Table 1')
      .getByRole('button')
      .click();
    const before = await readScoreModal(page);
    expect(before.title).toContain('Edit Scores');

    for (const [index, entry] of before.entries.entries()) {
      expect(Number(before.values[index]), `prefill for ${entry.player}`).toBe(
        record.perRound.get(1)?.get(entry.player),
      );
    }

    const edited = before.entries[0]?.player as string;
    const newScore = 200;
    await dialog(page).locator('input').nth(0).fill(String(newScore));
    await dialog(page).getByRole('button', { name: 'Save Scores' }).click();
    await expect(dialog(page)).toBeHidden();

    // No count changes here, so retry on the cell instead.
    const editedRow = roundsPanel
      .locator('tbody tr')
      .filter({ has: page.getByText(edited, { exact: true }) });
    await expect(editedRow.locator('td').nth(2)).toHaveText(String(newScore));

    const rows = await scoreRowsFor(page, totalTables);
    expect(rows.get(edited)).toBe(newScore);
    remember(
      record,
      1,
      edited,
      record.teamOfPlayer.get(edited) as string,
      newScore,
    );

    // Guard: the modal once submitted scores typed at another table.
    for (const entry of before.entries.slice(1)) {
      expect(
        rows.get(entry.player),
        `untouched score for ${entry.player}`,
      ).toBe(record.perRound.get(1)?.get(entry.player));
    }
  });

  await test.step('no unexpected console errors', async () => {
    // The deliberate add-team-after-matchmaking 409 is expected.
    const unexpected = consoleErrors.filter((line) => !line.includes('409'));
    expect(unexpected, unexpected.join('\n')).toHaveLength(0);
  });

  built = { gameId, gameName, record, totalTables };
});

/** Separate, non-serial tests so one broken view cannot hide another. */
test.describe('a finished tournament', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(
      !built,
      'the lifecycle test did not finish building a tournament',
    );
    await login(page);
    await page.goto(`/games/${tournament().gameId}`);
  });

  test('rankings match the scores that were entered', async ({ page }) => {
    const { record } = tournament();
    const panel = await openTab(page, 'Rankings');
    const combo = panel.getByRole('combobox');

    const views: { label: string; rounds: number[] }[] = [
      { label: 'Round 1', rounds: [1] },
      { label: 'Round 2', rounds: [2] },
      { label: 'Total (All Rounds)', rounds: [1, 2] },
    ];

    for (const view of views) {
      await selectOption(page, combo, view.label);

      const expectedTeams = teamTotals(record, view.rounds);
      const expectedPlayers = playerTotals(record, view.rounds);

      // Switching the view refetches; wait for its rows.
      await expect(panel.locator('tbody tr')).toHaveCount(
        expectedTeams.size + expectedPlayers.size,
      );

      const { teamRows, playerRows } = await readRankingRows(panel);

      expect(teamRows, `${view.label}: one row per team`).toHaveLength(
        TEAM_NAMES.length + 1,
      );
      expect(playerRows, `${view.label}: one row per player`).toHaveLength(
        expectedPlayers.size,
      );

      for (const [, team, score] of teamRows as [string, string, string][]) {
        expect(Number(score), `${view.label}: ${team}`).toBe(
          expectedTeams.get(team),
        );
      }
      for (const [, player, , score] of playerRows as [
        string,
        string,
        string,
        string,
      ][]) {
        expect(Number(score), `${view.label}: ${player}`).toBe(
          expectedPlayers.get(player),
        );
      }

      // Team rankings and player rankings must describe the same tournament.
      const teamSum = teamRows.reduce((sum, r) => sum + Number(r[2]), 0);
      const playerSum = playerRows.reduce((sum, r) => sum + Number(r[3]), 0);
      expect(teamSum, `${view.label}: team total equals player total`).toBe(
        playerSum,
      );

      // Ranks must be a dense 1..n sequence, ordered by descending score.
      const ranks = teamRows.map((r) => Number.parseInt(r[0] as string, 10));
      expect(ranks).toEqual(teamRows.map((_, i) => i + 1));
      const scores = teamRows.map((r) => Number(r[2]));
      expect([...scores].sort((a, b) => b - a)).toEqual(scores);
    }
  });

  test('the audit log records the whole history', async ({ page }) => {
    const { gameName } = tournament();
    const panel = await openTab(page, 'Audit Log');
    await expect(panel).toContainText(gameName);
    const text = await panel.innerText();
    expect(text).toContain(EMAIL as string);
    for (const marker of [
      'CREATED',
      'UPDATED',
      'Game',
      'Team',
      'Player',
      'Score',
    ]) {
      expect(text, `audit log mentions ${marker}`).toContain(marker);
    }
    expect(text).toContain(RENAMED_TEAM);
    expect(text).toContain(RENAMED_PLAYER);
    expect(text).toContain('Score: ');
  });

  test('every print view renders', async ({ page }) => {
    const { gameId, gameName } = tournament();
    const printViews = [
      'tablePlan',
      'scoreSheets',
      'teamHandouts',
      'rankings',
      'rankings&round=1',
      'rankings&round=2',
    ];

    for (const view of printViews) {
      await page.goto(`/games/${gameId}/print?type=${view}`);
      const body = page.locator('body');
      await expect(body).toContainText(gameName);
      const text = await body.innerText();

      expect(text, `${view}: no unresolved values`).not.toMatch(
        /\bundefined\b|\bNaN\b|\[object /,
      );
      // An unresolved i18n key renders as the literal "namespace:some.key".
      expect(text, `${view}: no untranslated keys`).not.toMatch(
        /\b(common|games|gameDetail|pdf|footer):[a-zA-Z][\w.]*/,
      );
      expect(
        await page.getByRole('alert').count(),
        `${view}: no error alert`,
      ).toBe(0);
    }
  });

  test('the table plan prints two cards per row', async ({ page }) => {
    const { gameId, totalTables } = tournament();
    await page.goto(`/games/${gameId}/print?type=tablePlan`);
    await expect(page.locator('.table-card')).toHaveCount(totalTables * ROUNDS);
    await expect(page.locator('.print-page-break')).toHaveCount(ROUNDS);

    await page.emulateMedia({ media: 'print' });
    const columns = await page
      .locator('.tables-grid')
      .first()
      .evaluate((el) => getComputedStyle(el).gridTemplateColumns);
    expect(
      columns.split(' ').length,
      'printed table plan uses two columns so long names do not wrap',
    ).toBe(2);
    await page.emulateMedia({ media: null });
  });

  // Mutating, and it locks the tournament — so it runs last.
  test('finalizing locks the tournament without changing a result', async ({
    page,
  }) => {
    const { record } = tournament();
    await page.getByRole('button', { name: 'Finalize Game' }).click();
    await dialog(page).getByRole('button', { name: 'Finalize Game' }).click();
    await expect(dialog(page)).toBeHidden();

    await expect(page.getByText('FINALIZED')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Finalize Game' }),
    ).toHaveCount(0);
    await expect(
      page.getByRole('button', { name: 'Print View' }),
    ).toBeVisible();

    await openTab(page, 'Rounds');
    await expect(
      page.getByRole('button', { name: 'Enter Scores' }),
    ).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Edit Scores' })).toHaveCount(
      0,
    );

    const panel = await openTab(page, 'Rankings');
    await selectOption(page, panel.getByRole('combobox'), 'Total (All Rounds)');
    const expectedTeams = teamTotals(record, [1, 2]);
    await expect(panel.locator('tbody tr')).toHaveCount(
      expectedTeams.size + playerTotals(record, [1, 2]).size,
    );
    const { teamRows } = await readRankingRows(panel);
    for (const [, team, score] of teamRows as [string, string, string][]) {
      expect(Number(score), `finalized total for ${team}`).toBe(
        expectedTeams.get(team),
      );
    }
  });
});
