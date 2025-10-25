import {
  Badge,
  Box,
  Button,
  Divider,
  Group,
  Menu,
  Stack,
  Text,
  UnstyledButton,
  rem,
} from '@mantine/core';
import {
  IconChevronDown,
  IconPlus,
  IconListDetails,
} from '@tabler/icons-react';
import { useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { GameStatusEnum } from '../generated';
import useGames from '../slices/games/hooks';
import { Game } from '../slices/types';

const getStatusColor = (status: GameStatusEnum) => {
  switch (status) {
    case GameStatusEnum.Setup:
      return 'gray';
    case GameStatusEnum.InProgress:
      return 'blue';
    case GameStatusEnum.Completed:
      return 'green';
    default:
      return 'gray';
  }
};

const getGameSummary = (game: Game, t: (key: string) => string) => {
  const statusText = t(`pages.gameDetail.status.${game.status}`);
  const teamsCount = game.teams.length;
  const roundsText = `${game.numberOfRounds} ${t('pages.gameDetail.rounds.round').toLowerCase()}`;

  return `${statusText} • ${teamsCount} ${t('pages.home.picker.teams').toLowerCase()} • ${roundsText}`;
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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { activeGame, allGames, activateGame } = useGames();

  // Get recent games (excluding active game, max 3) - memoized to prevent filtering on every render
  const recentGames = useMemo(
    () =>
      allGames
        .filter((game) => game.id !== activeGame?.id)
        .filter(
          (game) =>
            game.status === GameStatusEnum.Setup ||
            game.status === GameStatusEnum.InProgress,
        )
        .slice(0, 3),
    [allGames, activeGame?.id],
  );

  const handleSwitchGame = useCallback(
    (gameId: number) => {
      activateGame(gameId);
      navigate('/');
      if (isMobile && onClose) {
        onClose();
      }
    },
    [activateGame, navigate, isMobile, onClose],
  );

  const handleNavigateToGames = useCallback(() => {
    navigate('/games');
    if (isMobile && onClose) {
      onClose();
    }
  }, [navigate, isMobile, onClose]);

  const handleCreateGame = useCallback(() => {
    if (onOpenGameForm) {
      onOpenGameForm();
    } else {
      navigate('/games');
    }
    if (isMobile && onClose) {
      onClose();
    }
  }, [onOpenGameForm, navigate, isMobile, onClose]);

  if (!activeGame) {
    return (
      <Button
        color="gray"
        size="sm"
        variant="subtle"
        onClick={() => navigate('/')}
      >
        {t('pages.home.picker.selectGame')}
      </Button>
    );
  }

  return (
    <Menu position="bottom" shadow="md" width={320}>
      <Menu.Target>
        <UnstyledButton
          style={{
            padding: '8px 12px',
            borderRadius: 'var(--mantine-radius-sm)',
            border:
              '1px solid light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-4))',
            backgroundColor:
              'light-dark(var(--mantine-color-white), var(--mantine-color-dark-6))',
            transition: 'background-color 150ms ease',
            width: '100%',
            maxWidth: isMobile ? '100%' : '400px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor =
              'light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-5))';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor =
              'light-dark(var(--mantine-color-white), var(--mantine-color-dark-6))';
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
        {/* Current Game Section */}
        <Menu.Label>
          {t('pages.home.dashboard.activeGame.description')}
        </Menu.Label>
        <Menu.Item
          leftSection={
            <Badge
              color={getStatusColor(activeGame.status)}
              size="sm"
              variant="dot"
            >
              {t(`pages.gameDetail.status.${activeGame.status}`)}
            </Badge>
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
              {activeGame.teams.length}{' '}
              {t('pages.home.picker.teams').toLowerCase()} •{' '}
              {activeGame.numberOfRounds}{' '}
              {t('pages.gameDetail.rounds.round').toLowerCase()}
            </Text>
          </Stack>
        </Menu.Item>

        {/* Recent Games Section */}
        {recentGames.length > 0 && (
          <>
            <Divider my="xs" />
            <Menu.Label>{t('pages.home.dashboard.recentGames')}</Menu.Label>
            {recentGames.map((game) => (
              <Menu.Item
                key={game.id}
                leftSection={
                  <Badge
                    color={getStatusColor(game.status)}
                    size="sm"
                    variant="dot"
                  >
                    {t(`pages.gameDetail.status.${game.status}`)}
                  </Badge>
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

        {/* Actions Section */}
        <Divider my="xs" />
        <Menu.Item
          leftSection={<IconPlus style={{ width: rem(16), height: rem(16) }} />}
          onClick={handleCreateGame}
        >
          <Text fw={600} size="sm">
            {t('pages.games.createGameButton')}
          </Text>
        </Menu.Item>
        <Menu.Item
          leftSection={
            <IconListDetails style={{ width: rem(16), height: rem(16) }} />
          }
          onClick={handleNavigateToGames}
        >
          <Text fw={500} size="sm">
            {t('pages.games.heading')}
          </Text>
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

export default GameContextSelector;
