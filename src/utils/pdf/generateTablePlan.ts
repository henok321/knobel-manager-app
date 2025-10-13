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
    title: `${gameName} - ${t('pdf.tablePlan.title')}`,
    subtitle: t('pdf.tablePlan.subtitle'),
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

    if (startY > 240) {
      doc.addPage();
      startY = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`${t('pdf.tablePlan.round')} ${roundNum}`, 14, startY);
    startY += 8;

    if (roundTables.length === 0) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.text(t('pdf.tablePlan.noTables'), 14, startY);
      startY += 8;
    } else {
      // For each table, create a section with table name as headline
      for (const table of roundTables) {
        // Estimate table height: header (11) + title (6) + rows (players * 10) + spacing (8)
        const estimatedHeight = 11 + 6 + (table.players?.length || 0) * 10 + 8;

        // Check if table will fit on current page (portrait A4 height is ~297mm)
        // Leave margin of 20 at bottom
        if (startY + estimatedHeight > 260) {
          doc.addPage();
          startY = 20;
        }

        // Table headline
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(
          `${t('pdf.tablePlan.table')} ${table.tableNumber + 1}`,
          14,
          startY,
        );
        startY += 6;

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
          head: [[t('pdf.tablePlan.player'), t('pdf.tablePlan.team')]],
          body: playerData,
          theme: 'striped',
          headStyles: { fillColor: [66, 139, 202], fontSize: 9 },
          margin: { left: 14, right: 14 },
          styles: { fontSize: 9, cellPadding: 3 },
          columnStyles: {
            0: { cellWidth: 80 },
            1: { cellWidth: 80 },
          },
        });

        startY =
          (doc as unknown as { lastAutoTable: { finalY: number } })
            .lastAutoTable.finalY + 8;
      }
    }
  }

  doc.save(`${gameName}_${t('pdf.tablePlan.filename')}.pdf`);
};
