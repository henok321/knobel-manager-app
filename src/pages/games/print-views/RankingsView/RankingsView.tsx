import { Badge, Stack, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import type {
  Game,
  Player,
  Table as TableType,
  Team,
} from '../../../../store/generatedApi.ts';
import PlayerRankingsSection, {
  type PlayerRanking,
} from './PlayerRankingsSection';
import TeamRankingsSection, { type TeamRanking } from './TeamRankingsSection';

interface RankingsViewProps {
  game: Game;
  tables: (TableType & { roundNumber?: number })[];
  players: Player[];
  teams: Team[];
  roundNumber?: number;
}

const RankingsView = ({
  game,
  tables,
  players,
  teams,
  roundNumber,
}: RankingsViewProps) => {
  const { t } = useTranslation();

  const gameTeams = teams.filter((team) => team.gameID === game.id);

  const relevantTables = roundNumber
    ? tables.filter((table) => table.roundNumber === roundNumber)
    : tables;

  const scoresByPlayer: Record<number, number> = {};
  for (const table of relevantTables) {
    for (const score of table.scores || []) {
      scoresByPlayer[score.playerID] =
        (scoresByPlayer[score.playerID] || 0) + (score.score || 0);
    }
  }

  const playerRankings: PlayerRanking[] = [];
  for (const team of gameTeams) {
    for (const teamPlayer of team.players ?? []) {
      const player = players.find((p) => p.id === teamPlayer.id) ?? teamPlayer;

      playerRankings.push({
        playerID: player.id,
        playerName: player.name,
        teamID: team.id,
        teamName: team.name,
        totalScore: scoresByPlayer[player.id] || 0,
      });
    }
  }
  playerRankings.sort((a, b) => b.totalScore - a.totalScore);

  const teamScoresMap: Record<number, number> = {};
  for (const team of gameTeams) {
    teamScoresMap[team.id] = 0;
  }
  for (const playerRank of playerRankings) {
    teamScoresMap[playerRank.teamID] =
      (teamScoresMap[playerRank.teamID] || 0) + playerRank.totalScore;
  }

  const teamRankings: TeamRanking[] = Object.entries(teamScoresMap).map(
    ([teamIDStr, totalScore]) => {
      const teamID = Number(teamIDStr);
      const team = teams.find((t) => t.id === teamID);
      return {
        teamID,
        teamName: team?.name || 'Unknown',
        totalScore,
      };
    },
  );
  teamRankings.sort((a, b) => b.totalScore - a.totalScore);

  const roundLabel = roundNumber
    ? `${t('pdf:teamHandout.round')} ${roundNumber}`
    : t('pdf:rankings.total');

  return (
    <Stack gap="md">
      <div className="print-header">
        <Title order={1}>{game.name}</Title>
        <Title c="dimmed" fw={400} order={2}>
          {t('pdf:rankings.title')}
        </Title>
        <Badge color="blue" size="sm" variant="light">
          {roundLabel}
        </Badge>
      </div>

      <TeamRankingsSection rankings={teamRankings} />

      <PlayerRankingsSection rankings={playerRankings} />
    </Stack>
  );
};

export default RankingsView;
