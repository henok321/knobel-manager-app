import { Button, Container, Group, Stack, Text } from '@mantine/core';
import { IconArrowLeft, IconPrinter } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import CenterLoader from '../../shared/CenterLoader';
import { useGetGameQuery, useGetGameTablesQuery } from '../../store/api.ts';
import RankingsView from './print-views/RankingsView/RankingsView';
import ScoreSheetsView from './print-views/ScoreSheetsView/ScoreSheetsView';
import TablePlanView from './print-views/TablePlanView/TablePlanView';
import TeamHandoutsView from './print-views/TeamHandoutsView/TeamHandoutsView';
import './print-views/print.css';

const PrintView = () => {
  const { gameID } = useParams<{ gameID: string }>();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const numericGameId = Number(gameID);

  const { data: gameData, isLoading } = useGetGameQuery(
    { gameId: numericGameId },
    {
      skip: Number.isNaN(numericGameId),
    },
  );
  const game = gameData?.game;
  const { data: rawTablesData } = useGetGameTablesQuery(
    { gameId: numericGameId },
    {
      skip: Number.isNaN(numericGameId),
    },
  );
  const rawTables = rawTablesData?.tables ?? [];

  const teams = game?.teams ?? [];

  const roundNumberByRoundId = new Map(
    (game?.rounds ?? []).map((r) => [r.id, r.roundNumber]),
  );
  const tables = rawTables.map((table) => ({
    ...table,
    roundNumber: roundNumberByRoundId.get(table.roundID),
  }));

  const viewType = searchParams.get('type') || 'tablePlan';
  const roundNumber = searchParams.get('round');
  const teamID = searchParams.get('teamID');

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

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    void navigate(`/games/${gameID}`);
  };

  const renderView = () => {
    switch (viewType) {
      case 'tablePlan':
        return <TablePlanView game={game} tables={tables} teams={teams} />;
      case 'scoreSheets':
        return <ScoreSheetsView game={game} tables={tables} teams={teams} />;
      case 'teamHandouts':
        return (
          <TeamHandoutsView
            game={game}
            tables={tables}
            teamID={teamID ? Number(teamID) : undefined}
            teams={teams}
          />
        );
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
              onClick={handleBack}
            >
              {t('gameDetail:printView.back')}
            </Button>
            <Button
              leftSection={<IconPrinter size={16} />}
              onClick={handlePrint}
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
