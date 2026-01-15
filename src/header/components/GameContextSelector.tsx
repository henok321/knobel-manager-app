import {
  Box,
  Divider,
  Group,
  Menu,
  rem,
  Stack,
  Text,
  UnstyledButton,
  useMantineTheme,
} from '@mantine/core';
import {
  IconChevronDown,
  IconListDetails,
  IconPlus,
} from '@tabler/icons-react';
import { CSSProperties, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import StatusBadge from '../../components/StatusBadge';
import useGames from '../../slices/games/hooks.ts';
import { Game } from '../../slices/types.ts';

const getGameSummary = (
  game: Game,
  t: ReturnType<typeof useTranslation>['t'],
) => {
  const teamsCount = game.teams.length;
  return `${t(`status.${game.status}`, { ns: 'gameDetail' })} • ${t('picker.teams')}: ${teamsCount}  • ${t('numberOfRounds', { ns: 'gameDetail' })}: ${game.numberOfRounds}`;
};

interface GameContextSelectorProps {
  onOpenGameForm?: () => void;
  isMobile?: boolean;
  onClose?: () => void;
}

const GameContextSelector = ({
  onOpenGameForm,
  isMobile = false,
  onClose,
}: GameContextSelectorProps) => {
  const { t } = useTranslation(['home', 'gameDetail', 'games', 'common']);
  const navigate = useNavigate();
  const theme = useMantineTheme();
  const { activeGame, allGames, activateGame } = useGames();

  const recentGames = useMemo(
    () =>
      allGames
        .filter((game) => game.id !== activeGame?.id)
        .filter(
          (game) => game.status === 'setup' || game.status === 'in_progress',
        )
        .slice(0, 3),
    [allGames, activeGame?.id],
  );

  const handleSwitchGame = (gameId: number) => {
    activateGame(gameId);
    navigate(`/games/${gameId}`);
    if (isMobile && onClose) {
      onClose();
    }
  };

  const handleNavigateToGames = () => {
    navigate('/games');
    if (isMobile && onClose) {
      onClose();
    }
  };

  const handleCreateGame = () => {
    if (onOpenGameForm) {
      onOpenGameForm();
    } else {
      navigate('/games');
    }
    if (isMobile && onClose) {
      onClose();
    }
  };

  if (!activeGame) {
    return isMobile ? (
      <Text c="dimmed" size="sm" ta="center">
        {t('picker.noActiveGame')}
      </Text>
    ) : null;
  }

  const buttonStyle: CSSProperties = {
    padding: '8px 12px',
    borderRadius: theme.radius.sm,
    border: `1px solid var(--mantine-color-gray-3)`,
    backgroundColor: 'var(--mantine-color-body)',
    transition: 'background-color 150ms ease',
    width: '100%',
    maxWidth: isMobile ? '100%' : '400px',
  };

  return (
    <Menu position="bottom" shadow="md" width={320}>
      <Menu.Target>
        <UnstyledButton
          style={buttonStyle}
          styles={{
            root: {
              '&:hover': {
                backgroundColor: 'var(--mantine-color-gray-0)',
              },
            },
          }}
        >
          <Group gap="xs" wrap="nowrap">
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Text fw={600} size="sm" truncate="end">
                {activeGame.name}
              </Text>
              <Text c="dimmed" size="xs" truncate="end">
                {getGameSummary(activeGame, t)}
              </Text>
            </Box>
            <IconChevronDown
              style={{ width: rem(16), height: rem(16), flexShrink: 0 }}
            />
          </Group>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>{t('dashboard.activeGame.description')}</Menu.Label>
        <Menu.Item
          leftSection={
            <StatusBadge size="sm" status={activeGame.status} variant="dot" />
          }
          onClick={() => {
            navigate(`/games/${activeGame.id}`);
            if (isMobile && onClose) {
              onClose();
            }
          }}
        >
          <Stack gap={0}>
            <Text fw={600} size="sm">
              {activeGame.name}
            </Text>
            <Text c="dimmed" size="xs">
              {t('picker.teams')}: {activeGame.teams.length} •{' '}
              {t('numberOfRounds', { ns: 'gameDetail' })} :{' '}
              {activeGame.numberOfRounds}
            </Text>
          </Stack>
        </Menu.Item>

        {recentGames.length > 0 && (
          <>
            <Divider my="xs" />
            <Menu.Label>{t('dashboard.recentGames')}</Menu.Label>
            {recentGames.map((game) => (
              <Menu.Item
                key={game.id}
                leftSection={
                  <StatusBadge size="sm" status={game.status} variant="dot" />
                }
                onClick={() => handleSwitchGame(game.id)}
              >
                <Stack gap={0}>
                  <Text size="sm">{game.name}</Text>
                  <Text c="dimmed" size="xs">
                    {getGameSummary(game, t)}
                  </Text>
                </Stack>
              </Menu.Item>
            ))}
          </>
        )}

        <Divider my="xs" />
        <Menu.Item
          leftSection={<IconPlus style={{ width: rem(16), height: rem(16) }} />}
          onClick={handleCreateGame}
        >
          <Text fw={600} size="sm">
            {t('createGameButton', { ns: 'games' })}
          </Text>
        </Menu.Item>
        <Menu.Item
          leftSection={
            <IconListDetails style={{ width: rem(16), height: rem(16) }} />
          }
          onClick={handleNavigateToGames}
        >
          <Text fw={500} size="sm">
            {t('heading', { ns: 'games' })}
          </Text>
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

export default GameContextSelector;
