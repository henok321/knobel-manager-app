import { Button, Menu } from '@mantine/core';
import { IconFileDownload } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { tablesApi } from '../api/apiClient';
import { GameStatusEnum } from '../generated';
import { tablesSelectors } from '../slices/tables/slice';
import { Game } from '../slices/types';
import { RootState } from '../store/store';
import {
  generateTablePlan,
  generateScoreSheets,
  generateAllTeamHandouts,
  generateRankings,
} from '../utils/pdf';
import {
  mapPlayersToRankings,
  mapTeamsToRankings,
} from '../utils/rankingsMapper';
import { aggregateScoresFromTables } from '../utils/scoreAggregator';

interface PdfExportMenuProps {
  game: Game;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'filled' | 'light' | 'outline' | 'subtle' | 'default';
}

const PdfExportMenu = ({
  game,
  size = 'sm',
  variant = 'light',
}: PdfExportMenuProps) => {
  const { t } = useTranslation();
  const allTables = useSelector(tablesSelectors.selectAll);
  const teamsById = useSelector((state: RootState) => state.teams.entities);
  const playersById = useSelector((state: RootState) => state.players.entities);

  // Only show if game is in progress or completed
  if (game.status === GameStatusEnum.Setup) {
    return null;
  }

  const handleExportTablePlan = () => {
    const playersRecord: Record<
      number,
      NonNullable<(typeof playersById)[number]>
    > = {};
    for (const [id, player] of Object.entries(playersById)) {
      if (player) {
        playersRecord[Number(id)] = player;
      }
    }

    // Convert Redux teams to generated Team type
    type ConvertedTeam = {
      id: number;
      name: string;
      gameID: number;
      players: NonNullable<(typeof playersById)[number]>[];
    };
    const convertedTeamsRecord: Record<number, ConvertedTeam> = {};
    for (const [id, reduxTeam] of Object.entries(teamsById)) {
      if (reduxTeam) {
        const teamPlayers = reduxTeam.players
          .map((playerId) => playersById[playerId])
          .filter((p): p is NonNullable<typeof p> => p !== undefined);

        convertedTeamsRecord[Number(id)] = {
          id: reduxTeam.id,
          name: reduxTeam.name,
          gameID: reduxTeam.gameID,
          players: teamPlayers,
        };
      }
    }

    generateTablePlan(
      {
        gameName: game.name,
        numberOfRounds: game.numberOfRounds,
        tables: allTables,
        playersById: playersRecord,
        teamsById: convertedTeamsRecord,
      },
      t,
    );
  };

  const handleExportScoreSheets = () => {
    const playersRecord: Record<
      number,
      NonNullable<(typeof playersById)[number]>
    > = {};
    for (const [id, player] of Object.entries(playersById)) {
      if (player) {
        playersRecord[Number(id)] = player;
      }
    }

    // Convert Redux teams to generated Team type
    type ConvertedTeam = {
      id: number;
      name: string;
      gameID: number;
      players: NonNullable<(typeof playersById)[number]>[];
    };
    const convertedTeamsRecord: Record<number, ConvertedTeam> = {};
    for (const [id, reduxTeam] of Object.entries(teamsById)) {
      if (reduxTeam) {
        const teamPlayers = reduxTeam.players
          .map((playerId) => playersById[playerId])
          .filter((p): p is NonNullable<typeof p> => p !== undefined);

        convertedTeamsRecord[Number(id)] = {
          id: reduxTeam.id,
          name: reduxTeam.name,
          gameID: reduxTeam.gameID,
          players: teamPlayers,
        };
      }
    }

    generateScoreSheets(
      {
        gameName: game.name,
        numberOfRounds: game.numberOfRounds,
        tables: allTables,
        playersById: playersRecord,
        teamsById: convertedTeamsRecord,
      },
      t,
    );
  };

  const handleExportAllTeamHandouts = () => {
    // Prepare all team data
    const allTeamsData = game.teams
      .map((teamId: number) => {
        const reduxTeam = teamsById[teamId];
        if (!reduxTeam) return null;

        const players = reduxTeam.players
          .map((id: number) => playersById[id])
          .filter((p): p is NonNullable<typeof p> => p !== undefined);

        const team = {
          id: reduxTeam.id,
          name: reduxTeam.name,
          gameID: reduxTeam.gameID,
          players: players,
        };

        return { team, players };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    generateAllTeamHandouts(
      {
        gameName: game.name,
        numberOfRounds: game.numberOfRounds,
        tables: allTables,
        teams: allTeamsData,
      },
      t,
    );
  };

  const handleExportRankings = async (roundNumber?: number) => {
    try {
      const roundsToFetch = roundNumber
        ? [roundNumber]
        : Array.from({ length: game.numberOfRounds }, (_, i) => i + 1);

      const allTablesFetched = [];
      for (const roundNum of roundsToFetch) {
        try {
          const response = await tablesApi.getTables(game.id, roundNum);
          const tables = response.data.tables;
          if (Array.isArray(tables)) {
            allTablesFetched.push(...tables);
          }
        } catch {
          // Silently skip rounds without tables
        }
      }

      const allScores = aggregateScoresFromTables(allTablesFetched);

      const gameTeams = game.teams
        .map((teamId: number) => teamsById[teamId])
        .filter((team) => team !== undefined);

      const playerRankings = mapPlayersToRankings(
        gameTeams,
        playersById,
        allScores,
      );

      const teamRankings = mapTeamsToRankings(gameTeams, playerRankings);

      generateRankings(
        {
          gameName: game.name,
          teamRankings,
          playerRankings,
          roundNumber,
        },
        t,
      );
    } catch {
      // Silently fail - PDF generation error
    }
  };

  return (
    <Menu shadow="md" width={250}>
      <Menu.Target>
        <Button
          leftSection={<IconFileDownload style={{ width: 16, height: 16 }} />}
          size={size}
          variant={variant}
        >
          {t('pages.gameDetail.actions.exportPDF')}
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>{t('pages.gameDetail.pdfMenu.label')}</Menu.Label>
        <Menu.Item onClick={handleExportTablePlan}>
          {t('pages.gameDetail.pdfMenu.tablePlan')}
        </Menu.Item>
        <Menu.Item onClick={handleExportScoreSheets}>
          {t('pages.gameDetail.pdfMenu.scoreSheets')}
        </Menu.Item>
        <Menu.Item onClick={handleExportAllTeamHandouts}>
          {t('pages.gameDetail.pdfMenu.teamHandouts')}
        </Menu.Item>
        <Menu.Divider />
        <Menu.Label>{t('pages.gameDetail.pdfMenu.rankingsLabel')}</Menu.Label>
        <Menu.Item onClick={() => handleExportRankings()}>
          {t('pages.gameDetail.pdfMenu.rankingsAll')}
        </Menu.Item>
        {Array.from({ length: game.numberOfRounds }, (_, i) => i + 1).map(
          (roundNum) => (
            <Menu.Item
              key={roundNum}
              onClick={() => handleExportRankings(roundNum)}
            >
              {t('pages.gameDetail.pdfMenu.rankingsRound', {
                round: roundNum,
              })}
            </Menu.Item>
          ),
        )}
      </Menu.Dropdown>
    </Menu>
  );
};

export default PdfExportMenu;
