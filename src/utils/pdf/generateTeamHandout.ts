import { TFunction } from 'i18next';
import autoTable from 'jspdf-autotable';

import { createPDF } from './pdfBase';
import { Table, Player, Team } from '../../generated';

interface TeamHandoutData {
  team: Team;
  players: Player[];
  tables: Table[];
  gameName: string;
  numberOfRounds: number;
}

export const generateTeamHandout = (
  data: TeamHandoutData,
  t: TFunction,
): void => {
  const { team, players, tables, gameName, numberOfRounds } = data;

  const doc = createPDF({
    title: `${gameName} - ${t('teamHandout.title', { ns: 'pdf' })}`,
    subtitle: `${t('teamHandout.team', { ns: 'pdf' })}: ${team.name}`,
  });

  // Group tables by round
  const tablesByRound: Record<number, Table[]> = {};
  for (const table of tables) {
    tablesByRound[table.roundID] ??= [];
    tablesByRound[table.roundID]?.push(table);
  }

  let startY = 40;

  // For each player, show their table assignments
  for (const player of players) {
    if (startY > 250) {
      doc.addPage();
      startY = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(player.name, 14, startY);
    startY += 10;

    // Build table data for this player
    const playerTableData: (string | number)[][] = [];

    for (let roundNum = 1; roundNum <= numberOfRounds; roundNum++) {
      const roundTables = tablesByRound[roundNum] || [];
      const playerTable = roundTables.find((table) =>
        table.players?.some((p) => p.id === player.id),
      );

      if (playerTable) {
        playerTableData.push([
          `${t('teamHandout.round', { ns: 'pdf' })} ${roundNum}`,
          `${t('teamHandout.table', { ns: 'pdf' })} ${playerTable.tableNumber + 1}`,
        ]);
      } else {
        playerTableData.push([
          `${t('teamHandout.round', { ns: 'pdf' })} ${roundNum}`,
          t('teamHandout.notAssigned', { ns: 'pdf' }),
        ]);
      }
    }

    autoTable(doc, {
      startY,
      head: [
        [
          t('teamHandout.round', { ns: 'pdf' }),
          t('teamHandout.tableAssignment', { ns: 'pdf' }),
        ],
      ],
      body: playerTableData,
      theme: 'grid',
      headStyles: { fillColor: [66, 139, 202] },
      margin: { left: 14 },
    });

    startY =
      (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
        .finalY + 15;
  }

  // Add summary section
  if (startY > 200) {
    doc.addPage();
    startY = 20;
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(t('teamHandout.summary', { ns: 'pdf' }), 14, startY);
  startY += 10;

  // Summary table: Round -> Players and their tables
  for (let roundNum = 1; roundNum <= numberOfRounds; roundNum++) {
    const roundTables = tablesByRound[roundNum] || [];
    const summaryData: (string | number)[][] = [];

    for (const player of players) {
      const playerTable = roundTables.find((table) =>
        table.players?.some((p) => p.id === player.id),
      );

      summaryData.push([
        player.name,
        playerTable
          ? `${t('teamHandout.table', { ns: 'pdf' })} ${playerTable.tableNumber + 1}`
          : t('teamHandout.notAssigned', { ns: 'pdf' }),
      ]);
    }

    if (startY > 240) {
      doc.addPage();
      startY = 20;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(
      `${t('teamHandout.round', { ns: 'pdf' })} ${roundNum}`,
      14,
      startY,
    );
    startY += 5;

    autoTable(doc, {
      startY,
      head: [
        [
          t('teamHandout.player', { ns: 'pdf' }),
          t('teamHandout.table', { ns: 'pdf' }),
        ],
      ],
      body: summaryData,
      theme: 'striped',
      headStyles: { fillColor: [66, 139, 202] },
      margin: { left: 14 },
    });

    startY =
      (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
        .finalY + 10;
  }

  doc.save(
    `${gameName}_${team.name}_${t('teamHandout.filename', { ns: 'pdf' })}.pdf`,
  );
};

// Generate all team handouts in a single PDF
export const generateAllTeamHandouts = (
  data: {
    gameName: string;
    numberOfRounds: number;
    tables: Table[];
    teams: Array<{ team: Team; players: Player[] }>;
  },
  t: TFunction,
): void => {
  const { gameName, numberOfRounds, tables, teams } = data;

  const doc = createPDF({
    title: `${gameName} - ${t('teamHandout.allTeamsTitle', { ns: 'pdf' })}`,
    subtitle: t('teamHandout.allTeamsSubtitle', { ns: 'pdf' }),
  });

  // Group tables by round
  const tablesByRound: Record<number, Table[]> = {};
  for (const table of tables) {
    tablesByRound[table.roundID] ??= [];
    tablesByRound[table.roundID]?.push(table);
  }

  let startY = 40;
  let isFirstTeam = true;

  // For each team
  for (const { team, players } of teams) {
    // Add page break between teams (except for first team)
    if (!isFirstTeam) {
      doc.addPage();
      startY = 20;
    }
    isFirstTeam = false;

    // Team title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(team.name, 14, startY);
    startY += 10;

    // Summary table: Round -> Players and their tables
    for (let roundNum = 1; roundNum <= numberOfRounds; roundNum++) {
      const roundTables = tablesByRound[roundNum] || [];
      const summaryData: (string | number)[][] = [];

      for (const player of players) {
        const playerTable = roundTables.find((table) =>
          table.players?.some((p) => p.id === player.id),
        );

        summaryData.push([
          player.name,
          playerTable
            ? `${t('teamHandout.table', { ns: 'pdf' })} ${playerTable.tableNumber + 1}`
            : t('teamHandout.notAssigned', { ns: 'pdf' }),
        ]);
      }

      if (startY > 250) {
        doc.addPage();
        startY = 20;
      }

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(
        `${t('teamHandout.round', { ns: 'pdf' })} ${roundNum}`,
        14,
        startY,
      );
      startY += 5;

      autoTable(doc, {
        startY,
        head: [
          [
            t('teamHandout.player', { ns: 'pdf' }),
            t('teamHandout.table', { ns: 'pdf' }),
          ],
        ],
        body: summaryData,
        theme: 'striped',
        headStyles: { fillColor: [66, 139, 202], fontSize: 9 },
        margin: { left: 14 },
        styles: { fontSize: 9, cellPadding: 2 },
      });

      startY =
        (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
          .finalY + 8;
    }
  }

  doc.save(
    `${gameName}_${t('teamHandout.allTeamsFilename', { ns: 'pdf' })}.pdf`,
  );
};
