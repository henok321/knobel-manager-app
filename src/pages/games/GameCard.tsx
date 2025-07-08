import { Card, Group, Text, Badge, Button, Stack } from '@mantine/core';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Game } from '../../slices/types.ts';

export type GameCardProps = {
  game: Game;
  isActiveGame: boolean;
  onActivate: (id: number) => void;
  onDelete: (id: number) => void;
};

const GameCard = ({
  game,
  onActivate,
  onDelete,
  isActiveGame,
}: GameCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t } = useTranslation();

  const toggleExpand = () => setIsExpanded((prev) => !prev);

  return (
    <Card
      withBorder
      p="lg"
      radius="md"
      shadow="md"
      style={{
        cursor: 'pointer',
        marginBottom: 16,
        transition: 'transform 0.2s',
      }}
      onClick={toggleExpand}
    >
      <Group align="center" justify="space-between">
        <Text fw={600} size="xl">
          {game.name}
        </Text>
        <Group gap="xs">
          <Badge
            color={game.status === 'active' ? 'green' : 'red'}
            variant="light"
          >
            {game.status}
          </Badge>
          {isActiveGame && (
            <Badge color="green" variant="outline">
              {t('pages.games.card.isActive')}
            </Badge>
          )}
        </Group>
      </Group>
      {isExpanded && (
        <Stack gap="sm" mt="md">
          <Text>
            <strong>{t('pages.games.card.details.teamSize')}</strong>{' '}
            {game.teamSize}
          </Text>
          <Text>
            <strong>{t('pages.games.card.details.tableSize')}</strong>{' '}
            {game.tableSize}
          </Text>
          <Text>
            <strong>{t('pages.games.card.details.numberOfRounds')}</strong>{' '}
            {game.numberOfRounds}
          </Text>
          <Group gap="sm" mt="md">
            <Button
              color="blue"
              disabled={isActiveGame}
              onClick={(e) => {
                e.stopPropagation();
                onActivate(game.id);
              }}
            >
              {t('pages.games.card.activateButton')}
            </Button>
            <Button
              color="red"
              variant="filled"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(game.id);
              }}
            >
              {t('pages.games.card.deleteButton')}
            </Button>
          </Group>
        </Stack>
      )}
    </Card>
  );
};

export default GameCard;
