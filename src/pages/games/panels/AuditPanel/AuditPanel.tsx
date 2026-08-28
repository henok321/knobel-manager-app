import { Badge, Stack, Table, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import EmptyStateCard from '../../../../shared/EmptyStateCard';
import { useGetAuditLogQuery } from '../../../../store/api.ts';
import type { AuditChange, Game } from '../../../../store/generatedApi.ts';
import {
  actionColor,
  formatEntityRef,
  formatTimestamp,
  translateAuditAction,
  translateAuditField,
} from './auditLabels.ts';

interface AuditPanelProps {
  game: Game;
}

const ChangeList = ({ changes }: { changes: AuditChange[] }) => {
  const { t } = useTranslation();

  if (changes.length === 0) {
    return (
      <Text c="dimmed" size="sm">
        —
      </Text>
    );
  }

  return (
    <Stack gap={2}>
      {changes.map((change) => (
        <Text key={change.field} size="sm">
          <Text component="span" fw={500}>
            {translateAuditField(t, change.field)}
          </Text>
          {': '}
          <Text component="span" c="dimmed">
            {change.from ?? t('gameDetail:audit.empty')}
          </Text>
          {' → '}
          <Text component="span">
            {change.to ?? t('gameDetail:audit.empty')}
          </Text>
        </Text>
      ))}
    </Stack>
  );
};

const AuditPanel = ({ game }: AuditPanelProps) => {
  const { t, i18n } = useTranslation();
  const {
    data,
    isLoading: loading,
    isError,
  } = useGetAuditLogQuery({ gameId: game.id });

  if (loading) {
    return (
      <Text c="dimmed" ta="center">
        {t('common:actions.loading')}
      </Text>
    );
  }

  if (isError) {
    return <EmptyStateCard title={t('gameDetail:audit.loadError')} />;
  }

  const events = data?.events ?? [];

  if (events.length === 0) {
    return (
      <EmptyStateCard
        description={t('gameDetail:audit.emptyDescription')}
        title={t('gameDetail:audit.emptyTitle')}
      />
    );
  }

  return (
    <Table.ScrollContainer minWidth={720}>
      <Table highlightOnHover striped>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{t('gameDetail:audit.columns.when')}</Table.Th>
            <Table.Th>{t('gameDetail:audit.columns.who')}</Table.Th>
            <Table.Th>{t('gameDetail:audit.columns.action')}</Table.Th>
            <Table.Th>{t('gameDetail:audit.columns.what')}</Table.Th>
            <Table.Th>{t('gameDetail:audit.columns.changes')}</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {events.map((event) => (
            <Table.Tr key={event.id}>
              <Table.Td>
                <Text size="sm">
                  {formatTimestamp(i18n.language, event.timestamp)}
                </Text>
              </Table.Td>
              <Table.Td>
                <Text size="sm">{event.actor.email || event.actor.sub}</Text>
              </Table.Td>
              <Table.Td>
                <Badge color={actionColor(event.action)} variant="light">
                  {translateAuditAction(t, event.action)}
                </Badge>
              </Table.Td>
              <Table.Td>
                <Text size="sm">
                  {formatEntityRef(t, event.entity, event.entityID)}
                </Text>
              </Table.Td>
              <Table.Td>
                <ChangeList changes={event.changes} />
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
};

export default AuditPanel;
