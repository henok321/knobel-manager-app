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

interface AdministrationPanelProps {
  game: Game;
}

const AdministrationPanel = ({ game }: AdministrationPanelProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [addOwner, { isLoading: isAdding }] = useAddOwnerMutation();
  const [removeOwner] = useRemoveOwnerMutation();

  const singleAdmin = game.owners.length <= 1;

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
        message: t('gameDetail:administration.admins.added'),
        color: 'green',
      });
    } catch (error) {
      const status =
        error && typeof error === 'object' && 'status' in error
          ? (error as { status: number }).status
          : undefined;
      const message =
        status === 409
          ? t('gameDetail:administration.admins.errorAlreadyAdmin')
          : status === 422
            ? t('gameDetail:administration.admins.errorUserNotFound')
            : t('gameDetail:administration.admins.errorGeneric');
      notifications.show({ message, color: 'red' });
    }
  };

  const confirmRemove = (owner: GameOwner) => {
    const label = owner.email ?? owner.ownerSub;
    modals.openConfirmModal({
      title: t('gameDetail:administration.admins.removeConfirmTitle'),
      children: (
        <Text size="sm">
          {t('gameDetail:administration.admins.removeConfirmMessage', {
            email: label,
          })}
        </Text>
      ),
      labels: {
        confirm: t('gameDetail:administration.admins.remove'),
        cancel: t('gameDetail:administration.admins.cancel'),
      },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await removeOwner({
            gameId: game.id,
            ownerSub: owner.ownerSub,
          }).unwrap();
          notifications.show({
            message: t('gameDetail:administration.admins.removed'),
            color: 'green',
          });
        } catch {
          notifications.show({
            message: t('gameDetail:administration.admins.errorGeneric'),
            color: 'red',
          });
        }
      },
    });
  };

  return (
    <Stack gap="md">
      <div>
        <Text fw={600}>{t('gameDetail:administration.admins.title')}</Text>
        <Text c="dimmed" size="sm">
          {t('gameDetail:administration.admins.description')}
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
                      {t('gameDetail:administration.admins.you')}
                    </Badge>
                  )}
                </Group>
                <ActionIcon
                  aria-label={t('gameDetail:administration.admins.remove')}
                  color="red"
                  disabled={singleAdmin}
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
          label={t('gameDetail:administration.admins.emailLabel')}
          onChange={(event) => setEmail(event.currentTarget.value)}
          placeholder={t('gameDetail:administration.admins.emailPlaceholder')}
          type="email"
          value={email}
        />
        <Button loading={isAdding} onClick={() => void handleAdd()}>
          {t('gameDetail:administration.admins.add')}
        </Button>
      </Group>
    </Stack>
  );
};

export default AdministrationPanel;
