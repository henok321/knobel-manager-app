import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Group,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAuth } from '../../../../auth/useAuth';
import {
  useAddOwnerMutation,
  useRemoveOwnerMutation,
} from '../../../../store/api';
import type { Game, GameOwner } from '../../../../store/generatedApi.ts';

interface OwnersPanelProps {
  game: Game;
}

const OwnersPanel = ({ game }: OwnersPanelProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [addOwner, { isLoading: isAdding }] = useAddOwnerMutation();
  const [removeOwner] = useRemoveOwnerMutation();

  const singleOwner = game.owners.length <= 1;

  const handleAdd = async () => {
    const value = email.trim();
    if (!value) {
      return;
    }

    try {
      await addOwner({
        gameId: game.id,
        addOwnerRequest: { email: value },
      }).unwrap();
      setEmail('');
      notifications.show({
        message: t('gameDetail:owners.added'),
        color: 'green',
      });
    } catch (error) {
      const status =
        error && typeof error === 'object' && 'status' in error
          ? (error as { status: number }).status
          : undefined;
      const message =
        status === 409
          ? t('gameDetail:owners.errorAlreadyOwner')
          : status === 422
            ? t('gameDetail:owners.errorUserNotFound')
            : t('gameDetail:owners.errorGeneric');
      notifications.show({ message, color: 'red' });
    }
  };

  const confirmRemove = (owner: GameOwner) => {
    const label = owner.email ?? owner.ownerSub;
    modals.openConfirmModal({
      title: t('gameDetail:owners.removeConfirmTitle'),
      children: (
        <Text size="sm">
          {t('gameDetail:owners.removeConfirmMessage', { email: label })}
        </Text>
      ),
      labels: {
        confirm: t('gameDetail:owners.remove'),
        cancel: t('gameDetail:owners.cancel'),
      },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await removeOwner({
            gameId: game.id,
            ownerSub: owner.ownerSub,
          }).unwrap();
          notifications.show({
            message: t('gameDetail:owners.removed'),
            color: 'green',
          });
        } catch {
          notifications.show({
            message: t('gameDetail:owners.errorGeneric'),
            color: 'red',
          });
        }
      },
    });
  };

  return (
    <Stack gap="md">
      <div>
        <Text fw={600}>{t('gameDetail:owners.title')}</Text>
        <Text c="dimmed" size="sm">
          {t('gameDetail:owners.description')}
        </Text>
      </div>

      <Stack gap="xs">
        {game.owners.map((owner) => {
          const isSelf = owner.ownerSub === user?.uid;
          return (
            <Card key={owner.ownerSub} padding="sm" withBorder>
              <Group justify="space-between">
                <Group gap="xs">
                  <Text size="sm">{owner.email ?? owner.ownerSub}</Text>
                  {isSelf && (
                    <Badge color="cobalt" size="sm">
                      {t('gameDetail:owners.you')}
                    </Badge>
                  )}
                </Group>
                <ActionIcon
                  aria-label={t('gameDetail:owners.remove')}
                  color="red"
                  disabled={singleOwner}
                  onClick={() => confirmRemove(owner)}
                  variant="subtle"
                >
                  <IconTrash size={16} stroke={1.5} />
                </ActionIcon>
              </Group>
            </Card>
          );
        })}
      </Stack>

      <Group align="flex-end" gap="sm">
        <TextInput
          flex={1}
          label={t('gameDetail:owners.emailLabel')}
          onChange={(event) => setEmail(event.currentTarget.value)}
          placeholder={t('gameDetail:owners.emailPlaceholder')}
          type="email"
          value={email}
        />
        <Button loading={isAdding} onClick={() => void handleAdd()}>
          {t('gameDetail:owners.add')}
        </Button>
      </Group>
    </Stack>
  );
};

export default OwnersPanel;
