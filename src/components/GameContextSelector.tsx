import { ChevronDownIcon } from '@heroicons/react/24/solid';
import {
  Badge,
  Button,
  Divider,
  Group,
  Menu,
  Stack,
  Text,
} from '@mantine/core';
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

  // Get recent games (excluding active game, max 3)
  const recentGames = allGames
    .filter((game) => game.id !== activeGame?.id)
    .filter(
      (game) =>
        game.status === GameStatusEnum.Setup ||
        game.status === GameStatusEnum.InProgress,
    )
    .slice(0, 3);

  const handleSwitchGame = (gameId: number) => {
    activateGame(gameId);
    navigate('/');
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
        <Button
          rightSection={<ChevronDownIcon style={{ width: 16, height: 16 }} />}
          size="sm"
          variant="subtle"
        >
          <Stack gap={0}>
            <Group gap="xs">
              <Text fw={600} size="sm">
                {activeGame.name}
              </Text>
            </Group>
            <Text c="dimmed" size="xs">
              {getGameSummary(activeGame, t)}
            </Text>
          </Stack>
        </Button>
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
        <Menu.Item onClick={handleCreateGame}>
          <Group gap="xs">
            <Text size="lg">➕</Text>
            <Text fw={600} size="sm">
              {t('pages.games.createGameButton')}
            </Text>
          </Group>
        </Menu.Item>
        <Menu.Item onClick={handleNavigateToGames}>
          <Group gap="xs">
            <Text size="lg">📚</Text>
            <Text fw={500} size="sm">
              {t('pages.games.heading')}
            </Text>
          </Group>
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

export default GameContextSelector;
