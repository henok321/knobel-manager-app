import { TFunction } from 'i18next';
import autoTable from 'jspdf-autotable';

import { createPDF } from './pdfBase';
import { PlayerRanking, TeamRanking } from '../rankingsMapper';

interface RankingsData {
  gameName: string;
  teamRankings: TeamRanking[];
  playerRankings: PlayerRanking[];
  roundNumber?: number; // undefined means "total"
}

export const generateRankings = (data: RankingsData, t: TFunction): void => {
  const { gameName, teamRankings, playerRankings, roundNumber } = data;

  const roundLabel = roundNumber
    ? `${t('pdf.rankings.round')} ${roundNumber}`
    : t('pdf.rankings.total');

  const doc = createPDF({
    title: `${gameName} - ${t('pdf.rankings.title')}`,
    subtitle: `${t('pdf.rankings.subtitle')} - ${roundLabel}`,
  });

  let startY = 40;

  // Team Rankings Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(t('pdf.rankings.teamRankings'), 14, startY);
  startY += 10;

  const teamTableData: (string | number)[][] = teamRankings.map(
    (ranking, index) => [index + 1, ranking.teamName, ranking.totalScore],
  );

  if (teamTableData.length === 0) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text(t('pdf.rankings.noData'), 14, startY);
    startY += 15;
  } else {
    autoTable(doc, {
      startY,
      head: [
        [
          t('pdf.rankings.rank'),
          t('pdf.rankings.team'),
          t('pdf.rankings.totalScore'),
        ],
      ],
      body: teamTableData,
      theme: 'striped',
      headStyles: { fillColor: [66, 139, 202] },
      margin: { left: 14 },
      styles: { fontSize: 11 },
      columnStyles: {
        0: { cellWidth: 20, halign: 'center' },
        1: { cellWidth: 100 },
        2: { cellWidth: 40, halign: 'center' },
      },
    });

    startY =
      (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
        .finalY + 20;
  }

  // Player Rankings Section
  if (startY > 200) {
    doc.addPage();
    startY = 20;
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(t('pdf.rankings.playerRankings'), 14, startY);
  startY += 10;

  const playerTableData: (string | number)[][] = playerRankings.map(
    (ranking, index) => [
      index + 1,
      ranking.playerName,
      ranking.teamName,
      ranking.totalScore,
    ],
  );

  if (playerTableData.length === 0) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text(t('pdf.rankings.noData'), 14, startY);
  } else {
    autoTable(doc, {
      startY,
      head: [
        [
          t('pdf.rankings.rank'),
          t('pdf.rankings.player'),
          t('pdf.rankings.team'),
          t('pdf.rankings.totalScore'),
        ],
      ],
      body: playerTableData,
      theme: 'striped',
      headStyles: { fillColor: [66, 139, 202] },
      margin: { left: 14 },
      styles: { fontSize: 11 },
      columnStyles: {
        0: { cellWidth: 20, halign: 'center' },
        1: { cellWidth: 70 },
        2: { cellWidth: 60 },
        3: { cellWidth: 40, halign: 'center' },
      },
    });
  }

  const filename = roundNumber
    ? `${gameName}_${t('pdf.rankings.filename')}_Round${roundNumber}.pdf`
    : `${gameName}_${t('pdf.rankings.filename')}_Total.pdf`;

  doc.save(filename);
};
