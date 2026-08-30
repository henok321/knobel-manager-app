import { Badge, Stack, Table, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import EmptyStateCard from '../../../../shared/EmptyStateCard';
import {
  useGetAuditLogQuery,
  useGetGameTablesQuery,
} from '../../../../store/api.ts';
import type {
  AuditAction,
  Game,
  GameStatus,
} from '../../../../store/generatedApi.ts';
import { assertNever } from '../../../../utils/assertNever';
import { translateGameStatus } from '../../../../utils/gameStatusHelpers';
import {
  type AuditChange,
  type AuditLookups,
  describeChanges,
  describeSubject,
} from './auditChanges.ts';

interface AuditPanelProps {
  game: Game;
}

const GAME_STATUSES: readonly string[] = ['setup', 'in_progress', 'completed'];

const isGameStatus = (value: string): value is GameStatus =>
  GAME_STATUSES.includes(value);

const actionColor = (action: AuditAction) => {
  switch (action) {
    case 'insert':
      return 'green';
    case 'update':
      return 'cobalt';
    case 'delete':
      return 'red';
    default:
      return assertNever(action);
  }
};

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
  const isInaccessible =
    !!error &&
    'status' in error &&
    (error.status === 403 || error.status === 404);

  const teams = game.teams ?? [];
  const roundNumbers = new Map(
    (game.rounds ?? []).map((round) => [round.id, round.roundNumber]),
  );

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

  const actionLabel = (action: AuditAction) => {
    switch (action) {
      case 'insert':
        return t('gameDetail:audit.actions.insert');
      case 'update':
        return t('gameDetail:audit.actions.update');
      case 'delete':
        return t('gameDetail:audit.actions.delete');
      default:
        return assertNever(action);
    }
  };

  const fieldLabel = (field: string) => {
    switch (field) {
      case 'game_name':
      case 'team_name':
      case 'player_name':
        return t('gameDetail:audit.fields.name');
      case 'status':
        return t('gameDetail:audit.fields.status');
      case 'team_size':
        return t('gameDetail:teamSize');
      case 'table_size':
        return t('gameDetail:tableSize');
      case 'number_of_rounds':
        return t('gameDetail:numberOfRounds');
      case 'score':
        return t('gameDetail:rounds.score');
      case 'team_id':
        return t('gameDetail:audit.entities.teams');
      case 'player_id':
        return t('gameDetail:audit.entities.players');
      case 'table_id':
        return t('gameDetail:rounds.table');
      case 'owner_sub':
        return t('gameDetail:audit.entities.gameOwners');
      default:
        return field;
    }
  };

  const valueLabel = (field: string, value: string) =>
    field === 'status' && isGameStatus(value)
      ? translateGameStatus(t, value)
      : value;

  const changeText = ({ field, from, to }: AuditChange) => {
    const before = valueLabel(field, from);
    const after = valueLabel(field, to);
    return before && after
      ? `${fieldLabel(field)}: ${before} → ${after}`
      : `${fieldLabel(field)}: ${before || after}`;
  };

  const entityLabel = (entity: string) => {
    switch (entity) {
      case 'games':
        return t('gameDetail:audit.entities.games');
      case 'game_owners':
        return t('gameDetail:audit.entities.gameOwners');
      case 'teams':
        return t('gameDetail:audit.entities.teams');
      case 'players':
        return t('gameDetail:audit.entities.players');
      case 'scores':
        return t('gameDetail:audit.entities.scores');
      default:
        return entity;
    }
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
                {entityLabel(event.entity)}
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
                  {actionLabel(event.action)}
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
                      {changeText(change)}
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
