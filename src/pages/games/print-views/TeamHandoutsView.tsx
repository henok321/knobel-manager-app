import { Title, Text, Paper, Table, Stack, Badge } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import { Table as TableType, Player, Game, Team } from '../../../slices/types';

interface TeamHandoutsViewProps {
  game: Game;
  tables: (TableType & { roundNumber?: number })[];
  players: Player[];
  teams: Team[];
  teamID?: number;
}

const TeamHandoutsView = ({
  game,
  tables,
  players,
  teams: allTeams,
  teamID,
}: TeamHandoutsViewProps) => {
  const { t } = useTranslation();

  const teams = allTeams.filter(
    (team) => team.gameID === game.id && (!teamID || team.id === teamID),
  );

  const rounds = Array.from({ length: game.numberOfRounds }, (_, i) => i + 1);

  const renderTeamHandout = (team: Team) => {
    const teamPlayers = team.players
      .map((playerID: number) => players.find((p) => p.id === playerID))
      .filter((player): player is Player => player !== undefined);

    const playerAssignments: Record<
      number,
      Record<number, { tableNumber: number; roundNumber: number }>
    > = {};

    tables.forEach((table) => {
      if (!table.roundNumber) return;

      (table.players || []).forEach((player) => {
        if (team.players.includes(player.id)) {
          playerAssignments[player.id] ??= {};
          playerAssignments[player.id]![table.roundNumber!] = {
            tableNumber: table.tableNumber,
            roundNumber: table.roundNumber!,
          };
        }
      });
    });

    return (
      <Paper key={team.id} withBorder className="team-handout-card" p="md">
        <Stack gap="sm">
          <div>
            <Title order={3}>{team.name}</Title>
            <Text c="dimmed" size="sm">
              {game.name} &middot;{' '}
              {t('pdf:teamHandout.summary', {
                players: teamPlayers.length,
                rounds: game.numberOfRounds,
              })}
            </Text>
          </div>

          <Table
            striped
            withColumnBorders
            withTableBorder
            className="team-handout-table"
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{t('pdf:teamHandout.player')}</Table.Th>
                {rounds.map((r) => (
                  <Table.Th key={r} style={{ textAlign: 'center' }}>
                    {t('pdf:teamHandout.round')} {r}
                  </Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {teamPlayers.map((player) => {
                const assignments = playerAssignments[player.id] || {};
                return (
                  <Table.Tr key={player.id}>
                    <Table.Td fw={500}>{player.name}</Table.Td>
                    {rounds.map((roundNum) => {
                      const assignment = assignments[roundNum];
                      return (
                        <Table.Td
                          key={roundNum}
                          style={{ textAlign: 'center' }}
                        >
                          {assignment ? (
                            <Badge color="blue" size="sm" variant="light">
                              {t('pdf:teamHandout.table')}{' '}
                              {assignment.tableNumber}
                            </Badge>
                          ) : (
                            <Text c="dimmed" fs="italic" size="sm">
                              {t('pdf:teamHandout.notAssigned')}
                            </Text>
                          )}
                        </Table.Td>
                      );
                    })}
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </Stack>
      </Paper>
    );
  };

  return (
    <Stack gap="md">
      <div className="print-header">
        <Title order={1}>{game.name}</Title>
        <Title c="dimmed" fw={400} order={2}>
          {t('pdf:teamHandout.title')}
        </Title>
        <Text c="dimmed" size="sm">
          {teamID
            ? t('pdf:teamHandout.subtitleSingle')
            : t('pdf:teamHandout.subtitle')}
        </Text>
      </div>

      {teams.map(renderTeamHandout)}
    </Stack>
  );
};

export default TeamHandoutsView;
