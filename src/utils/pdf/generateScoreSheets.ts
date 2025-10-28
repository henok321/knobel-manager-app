import { TFunction } from 'i18next';
import autoTable from 'jspdf-autotable';

import { createPDF } from './pdfBase';
import { Table, Player, Team } from '../../generated';

interface ScoreSheetsData {
  gameName: string;
  numberOfRounds: number;
  tables: Table[];
  playersById: Record<number, Player>;
  teamsById: Record<number, Team>;
}

export const generateScoreSheets = (
  data: ScoreSheetsData,
  t: TFunction,
): void => {
  const { gameName, numberOfRounds, tables, playersById, teamsById } = data;

  const doc = createPDF({
    title: `${gameName} - ${t('scoreSheets.title', { ns: 'pdf' })}`,
    subtitle: t('scoreSheets.subtitle', { ns: 'pdf' }),
  });

  // Group tables by round
  const tablesByRound: Record<number, Table[]> = {};
  for (const table of tables) {
    tablesByRound[table.roundID] ??= [];
    tablesByRound[table.roundID]?.push(table);
  }

  let isFirstPage = true;

  // For each round and each table, create a score sheet
  for (let roundNum = 1; roundNum <= numberOfRounds; roundNum++) {
    const roundTables = (tablesByRound[roundNum] || []).sort(
      (a, b) => a.tableNumber - b.tableNumber,
    );

    for (const table of roundTables) {
      if (!isFirstPage) {
        doc.addPage();
      }
      isFirstPage = false;

      let startY = 40;

      // Table header
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(
        `${t('scoreSheets.round', { ns: 'pdf' })} ${roundNum} - ${t('scoreSheets.table', { ns: 'pdf' })} ${table.tableNumber + 1}`,
        14,
        startY,
      );
      startY += 15;

      // Instructions - wrap text if too long (max width: 180mm)
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      const instructionsText = t('scoreSheets.instructions', { ns: 'pdf' });
      const wrappedInstructions = doc.splitTextToSize(instructionsText, 180);
      doc.text(wrappedInstructions, 14, startY);
      // Calculate height based on number of lines (each line is ~5 units)
      startY += wrappedInstructions.length * 5 + 5;

      // Build table data with players and blank score fields
      const scoreData: (string | number)[][] = [];

      const players = table.players || [];
      for (const player of players) {
        const playerData = playersById[player.id];
        const teamData = playerData ? teamsById[playerData.teamID] : undefined;

        scoreData.push([
          playerData?.name || `Player ${player.id}`,
          teamData?.name || '-',
          '', // Blank score field
        ]);
      }

      autoTable(doc, {
        startY,
        head: [
          [
            t('scoreSheets.player', { ns: 'pdf' }),
            t('scoreSheets.team', { ns: 'pdf' }),
            t('scoreSheets.score', { ns: 'pdf' }),
          ],
        ],
        body: scoreData,
        theme: 'grid',
        headStyles: { fillColor: [66, 139, 202], fontStyle: 'bold' },
        margin: { left: 14, right: 14 },
        styles: { fontSize: 12, cellPadding: 8, minCellHeight: 15 },
        columnStyles: {
          0: { cellWidth: 70 },
          1: { cellWidth: 60 },
          2: { cellWidth: 50, halign: 'center' },
        },
      });

      const finalY =
        (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
          .finalY + 20;

      // Add notes section
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(t('scoreSheets.notes', { ns: 'pdf' }), 14, finalY);

      doc.setFont('helvetica', 'normal');
      doc.setDrawColor(200);
      for (let i = 0; i < 4; i++) {
        const lineY = finalY + 10 + i * 10;
        doc.line(14, lineY, 195, lineY);
      }
    }
  }

  doc.save(`${gameName}_${t('scoreSheets.filename', { ns: 'pdf' })}.pdf`);
};
