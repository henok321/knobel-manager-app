import { Container, Stack, Text, Button, Group } from '@mantine/core';
import { IconPrinter, IconArrowLeft } from '@tabler/icons-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';

import RankingsView from './print-views/RankingsView';
import ScoreSheetsView from './print-views/ScoreSheetsView';
import TablePlanView from './print-views/TablePlanView';
import TeamHandoutsView from './print-views/TeamHandoutsView';
import { useGetGameQuery, type TableWithRound } from '../../api/rtkQueryApi';
import useGames from '../../hooks/useGames';
import usePlayers from '../../hooks/usePlayers';
import useTeams from '../../hooks/useTeams';
import CenterLoader from '../../shared/CenterLoader';
import './print-views/print.css';

const PrintView = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation(['gameDetail', 'common']);
  const navigate = useNavigate();
  const { allGames, status } = useGames();
  const { allTeams } = useTeams();
  const { allPlayers } = usePlayers();

  const viewType = searchParams.get('type') || 'tablePlan';
  const roundNumber = searchParams.get('round');
  const teamId = searchParams.get('teamId');

  const game = allGames.find((g) => g.id === Number(gameId));

  const { data: gameData, isLoading: tablesLoading } = useGetGameQuery(
    { gameId: game?.id ?? 0 },
    { skip: !game },
  );

  const allTables = useMemo<TableWithRound[]>(() => {
    if (!gameData?.rounds) return [];
    return gameData.rounds.flatMap((round) =>
      (round.tables || []).map((table) => ({
        ...table,
        roundNumber: round.roundNumber,
      })),
    );
  }, [gameData]);

  if (status === 'pending' || status === 'idle' || tablesLoading) {
    return <CenterLoader />;
  }

  if (!game) {
    return (
      <Container py="md">
        <Text c="red" size="xl">
          {t('notFound')}
        </Text>
      </Container>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    navigate(`/games/${gameId}`);
  };

  const renderView = () => {
    switch (viewType) {
      case 'tablePlan':
        return (
          <TablePlanView
            game={game}
            players={allPlayers}
            tables={allTables}
            teams={allTeams}
          />
        );
      case 'scoreSheets':
        return (
          <ScoreSheetsView
            game={game}
            players={allPlayers}
            tables={allTables}
            teams={allTeams}
          />
        );
      case 'teamHandouts':
        return (
          <TeamHandoutsView
            game={game}
            players={allPlayers}
            tables={allTables}
            teamId={teamId ? Number(teamId) : undefined}
            teams={allTeams}
          />
        );
      case 'rankings':
        return (
          <RankingsView
            game={game}
            players={allPlayers}
            roundNumber={roundNumber ? Number(roundNumber) : undefined}
            tables={allTables}
            teams={allTeams}
          />
        );
      default:
        return <Text c="red">{t('printView.invalidType')}</Text>;
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
              {t('printView.back')}
            </Button>
            <Button
              leftSection={<IconPrinter size={16} />}
              onClick={handlePrint}
            >
              {t('printView.print')}
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
