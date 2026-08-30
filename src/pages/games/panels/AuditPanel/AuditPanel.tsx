import { Badge, Stack, Table, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import EmptyStateCard from '../../../../shared/EmptyStateCard';
import { useGetAuditLogQuery } from '../../../../store/api.ts';
import type { AuditAction, Game } from '../../../../store/generatedApi.ts';
import { assertNever } from '../../../../utils/assertNever';
import { describeChanges } from './auditChanges.ts';

interface AuditPanelProps {
  game: Game;
}

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
  // No cache tag: every domain mutation would have to invalidate it, so refetch on mount instead.
  const { data, isLoading, isError, error } = useGetAuditLogQuery(
    { gameId: game.id },
    { refetchOnMountOrArgChange: true },
  );

  // A 404 means the game is gone or was never the caller's — nothing to show, same as no events.
  const isNotFound = !!error && 'status' in error && error.status === 404;

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

  if (isLoading) {
    return (
      <Text c="dimmed" ta="center">
        {t('common:actions.loading')}
      </Text>
    );
  }

  if (isError && !isNotFound) {
    return (
      <Text c="red" ta="center">
        {t('common:actions.errorOccurred')}
      </Text>
    );
  }

  const events = data?.events ?? [];

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
                {new Date(event.createdAt).toLocaleString(i18n.language)}
              </Table.Td>
              <Table.Td>{event.actorEmail || event.actorSub}</Table.Td>
              <Table.Td>{entityLabel(event.entity)}</Table.Td>
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
                  {describeChanges(event.old, event.new).map((change) => (
                    <Text key={change.field} size="xs">
                      {change.text}
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
