import { TFunction } from 'i18next';
import autoTable from 'jspdf-autotable';

import { createPDF } from './pdfBase';
import { Table, Player, Team } from '../../generated';

interface TablePlanData {
  gameName: string;
  numberOfRounds: number;
  tables: Table[];
  playersById: Record<number, Player>;
  teamsById?: Record<number, Team>;
}

export const generateTablePlan = (data: TablePlanData, t: TFunction): void => {
  const { gameName, numberOfRounds, tables, playersById, teamsById } = data;

  const doc = createPDF({
    title: `${gameName} - ${t('tablePlan.title', { ns: 'pdf' })}`,
    subtitle: t('tablePlan.subtitle', { ns: 'pdf' }),
    orientation: 'portrait',
  });

  // Group tables by round
  const tablesByRound: Record<number, Table[]> = {};
  for (const table of tables) {
    tablesByRound[table.roundID] ??= [];
    tablesByRound[table.roundID]?.push(table);
  }

  let startY = 40;

  // For each round, show all tables and their players
  for (let roundNum = 1; roundNum <= numberOfRounds; roundNum++) {
    const roundTables = (tablesByRound[roundNum] || []).sort(
      (a, b) => a.tableNumber - b.tableNumber,
    );

    // Start each new round on a new page (except the first round)
    if (roundNum > 1) {
      doc.addPage();
      startY = 20;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`${t('tablePlan.round', { ns: 'pdf' })} ${roundNum}`, 14, startY);
    startY += 10; // Increased space after round headline

    if (roundTables.length === 0) {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text(t('tablePlan.noTables', { ns: 'pdf' }), 14, startY);
      startY += 6;
    } else {
      // For each table, create a section with table name as headline
      for (const table of roundTables) {
        // Estimate table height: header (9) + title (4) + rows (players * 8) + spacing (5)
        const estimatedHeight = 9 + 4 + (table.players?.length || 0) * 8 + 5;

        // Check if table will fit on current page (portrait A4 height is ~297mm)
        // Leave margin of 20 at bottom
        if (startY + estimatedHeight > 270) {
          doc.addPage();
          startY = 20;
        }

        // Table headline
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(
          `${t('tablePlan.table', { ns: 'pdf' })} ${table.tableNumber + 1}`,
          14,
          startY,
        );
        startY += 4;

        // Build player data for this table
        const playerData: (string | number)[][] = [];
        const players = table.players || [];

        for (const player of players) {
          const playerInfo = playersById[player.id];
          const playerName = playerInfo?.name || `Player ${player.id}`;

          // Get team name
          let teamName = '-';
          if (playerInfo && teamsById) {
            const team = teamsById[playerInfo.teamID];
            if (team) {
              teamName = team.name;
            }
          }

          playerData.push([playerName, teamName]);
        }

        autoTable(doc, {
          startY,
          head: [
            [
              t('tablePlan.player', { ns: 'pdf' }),
              t('tablePlan.team', { ns: 'pdf' }),
            ],
          ],
          body: playerData,
          theme: 'striped',
          headStyles: { fillColor: [66, 139, 202], fontSize: 8 },
          margin: { left: 14, right: 14 },
          styles: { fontSize: 8, cellPadding: 1.5 },
          columnStyles: {
            0: { cellWidth: 80 },
            1: { cellWidth: 80 },
          },
        });

        startY =
          (doc as unknown as { lastAutoTable: { finalY: number } })
            .lastAutoTable.finalY + 5;
      }
    }
  }

  doc.save(`${gameName}_${t('tablePlan.filename', { ns: 'pdf' })}.pdf`);
};
