import { Badge, Stack, Table, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import EmptyStateCard from '../../../../shared/EmptyStateCard';
import type { Game } from '../../../../store/api.gen.ts';
import {
  useGetAuditLogQuery,
  useGetGameTablesQuery,
} from '../../../../store/api.ts';
import { httpStatus } from '../../../../utils/apiError.ts';
import { roundNumberById } from '../../../../utils/rounds.ts';
import {
  type AuditLookups,
  actionColor,
  actionLabel,
  changeLabel,
  describeChanges,
  describeSubject,
  entityLabel,
} from './auditChanges.ts';

interface AuditPanelProps {
  game: Game;
}

const AuditPanel = ({ game }: AuditPanelProps) => {
  const { t, i18n } = useTranslation();
  const { data, isLoading, isError, error } = useGetAuditLogQuery({
    gameId: game.id,
  });

  const { data: tablesData, isLoading: tablesLoading } = useGetGameTablesQuery({
    gameId: game.id,
  });

  // 403 (not an owner) and 404 (game gone, never owned) both mean the caller cannot see this
  // trail — nothing to show, which is not the same as something going wrong.
  const status = httpStatus(error);
  const isInaccessible = status === 403 || status === 404;

  const teams = game.teams ?? [];
  const roundNumbers = roundNumberById(game.rounds);

  const tableLabel = (tableNumber: number, roundID: number) => {
    const roundNumber = roundNumbers.get(roundID);
    const table = t('gameDetail:audit.table', { table: tableNumber });
    return roundNumber === undefined
      ? table
      : `${t('gameDetail:audit.round', { round: roundNumber })} · ${table}`;
  };

  const lookups: AuditLookups = {
    teams: new Map(teams.map((team) => [team.id, team.name])),
    players: new Map(
      teams.flatMap((team) =>
        (team.players ?? []).map((player) => [player.id, player.name] as const),
      ),
    ),
    tables: new Map(
      (tablesData?.tables ?? []).map((table) => [
        table.id,
        tableLabel(table.tableNumber, table.roundID),
      ]),
    ),
    owners: new Map(
      game.owners.map((owner) => [
        owner.ownerSub,
        owner.email ?? owner.ownerSub,
      ]),
    ),
  };

  if (isLoading || tablesLoading) {
    return (
      <Text c="dimmed" ta="center">
        {t('common:actions.loading')}
      </Text>
    );
  }

  if (isError && !isInaccessible) {
    return (
      <Text c="red" ta="center">
        {t('common:actions.errorOccurred')}
      </Text>
    );
  }

  const events = isInaccessible ? [] : (data?.events ?? []);

  if (events.length === 0) {
    return (
      <EmptyStateCard
        description={t('gameDetail:audit.emptyMessage')}
        title={t('gameDetail:audit.emptyTitle')}
      />
    );
  }

  return (
    <Table.ScrollContainer minWidth={700}>
      <Table striped>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{t('gameDetail:audit.time')}</Table.Th>
            <Table.Th>{t('gameDetail:audit.actor')}</Table.Th>
            <Table.Th>{t('gameDetail:audit.entity')}</Table.Th>
            <Table.Th>{t('gameDetail:audit.action')}</Table.Th>
            <Table.Th>{t('gameDetail:audit.changes')}</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {events.map((event) => (
            <Table.Tr key={event.id}>
              <Table.Td style={{ whiteSpace: 'nowrap' }}>
                {new Date(event.createdAt).toLocaleString(
                  i18n.resolvedLanguage,
                )}
              </Table.Td>
              <Table.Td>{event.actorEmail || event.actorSub}</Table.Td>
              <Table.Td>
                {entityLabel(t, event.entity)}
                {describeSubject(
                  event.entity,
                  event.new ?? event.old,
                  lookups,
                ).map((label) => (
                  <Text key={label} c="dimmed" size="xs">
                    {label}
                  </Text>
                ))}
              </Table.Td>
              <Table.Td>
                <Badge
                  color={actionColor(event.action)}
                  size="sm"
                  variant="light"
                >
                  {actionLabel(t, event.action)}
                </Badge>
              </Table.Td>
              <Table.Td>
                <Stack gap={2}>
                  {describeChanges(
                    event.entity,
                    event.old,
                    event.new,
                    lookups,
                  ).map((change) => (
                    <Text key={change.field} size="xs">
                      {changeLabel(t, change)}
                    </Text>
                  ))}
                </Stack>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
};

export default AuditPanel;
