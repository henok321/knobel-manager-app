import {
  Badge,
  Box,
  Button,
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
import { CSSProperties, useCallback, useMemo } from 'react';
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
  const teamsCount = game.teams.length;
  return `${t(`pages.gameDetail.status.${game.status}`)} • ${t('picker.teams')}: ${teamsCount}  • ${t('pages.gameDetail.numberOfRounds')}: ${game.numberOfRounds}`;
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
  const { t } = useTranslation(['home', 'common']);
  const navigate = useNavigate();
  const theme = useMantineTheme();
  const { activeGame, allGames, activateGame } = useGames();

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
        {t('picker.selectGame')}
      </Button>
    );
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
              {t('picker.teams')}: {activeGame.teams.length} •{' '}
              {t('pages.gameDetail.numberOfRounds')} :{' '}
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
