import { Button, Container, Group, Stack, Text } from '@mantine/core';
import { IconArrowLeft, IconPrinter } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useSearchParams } from 'react-router';

import CenterLoader from '../../shared/CenterLoader';
import { useGetGameQuery, useGetGameTablesQuery } from '../../store/api.ts';
import { roundNumberById } from '../../utils/rounds.ts';
import RankingsView from './print-views/RankingsView';
import ScoreSheetsView from './print-views/ScoreSheetsView';
import TablePlanView from './print-views/TablePlanView';
import TeamHandoutsView from './print-views/TeamHandoutsView';
import './print-views/print.css';

const PrintView = () => {
  const { gameID } = useParams<{ gameID: string }>();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const numericGameId = Number(gameID);
  const skip = Number.isNaN(numericGameId);

  const { data: gameData, isLoading } = useGetGameQuery(
    { gameId: numericGameId },
    { skip },
  );
  const game = gameData?.game;
  const { data: rawTablesData } = useGetGameTablesQuery(
    { gameId: numericGameId },
    { skip },
  );

  const teams = game?.teams ?? [];
  const roundNumbers = roundNumberById(game?.rounds);
  const tables = (rawTablesData?.tables ?? []).map((table) => ({
    ...table,
    roundNumber: roundNumbers.get(table.roundID),
  }));

  const viewType = searchParams.get('type') || 'tablePlan';
  const roundNumber = searchParams.get('round');

  if (isLoading) {
    return <CenterLoader />;
  }

  if (!game) {
    return (
      <Container py="md">
        <Text c="red" size="xl">
          {t('gameDetail:notFound')}
        </Text>
      </Container>
    );
  }

  const renderView = () => {
    switch (viewType) {
      case 'tablePlan':
        return <TablePlanView game={game} tables={tables} teams={teams} />;
      case 'scoreSheets':
        return <ScoreSheetsView game={game} tables={tables} teams={teams} />;
      case 'teamHandouts':
        return <TeamHandoutsView game={game} tables={tables} teams={teams} />;
      case 'rankings':
        return (
          <RankingsView
            game={game}
            roundNumber={roundNumber ? Number(roundNumber) : undefined}
            tables={tables}
            teams={teams}
          />
        );
      default:
        return <Text c="red">{t('gameDetail:printView.invalidType')}</Text>;
    }
  };

  return (
    <>
      <div className="print-controls">
        <Container py="md" size="xl">
          <Group justify="space-between">
            <Button
              leftSection={<IconArrowLeft size={16} />}
              variant="default"
              onClick={() => void navigate(`/games/${gameID}`)}
            >
              {t('gameDetail:printView.back')}
            </Button>
            <Button
              leftSection={<IconPrinter size={16} />}
              onClick={() => window.print()}
            >
              {t('gameDetail:printView.print')}
            </Button>
          </Group>
        </Container>
      </div>

      <Container py="md" size="xl">
        <Stack gap="lg">{renderView()}</Stack>
      </Container>
    </>
  );
};

export default PrintView;
