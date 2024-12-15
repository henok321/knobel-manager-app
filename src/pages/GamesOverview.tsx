import { Badge, Heading, Text, List } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout.tsx';

const GamesOverview = () => {
  const { t } = useTranslation();

  const games = [
    { id: 1, name: 'Game 1', year: '2021' },
    { id: 2, name: 'Game 2', year: '2022' },
  ];

  return (
    <Layout>
      <Heading marginBottom={'1rem'}>{t('GAMES_OVERVIEW_HEADING')}</Heading>
      <List.Root gap={3}>
        {games.map((game) => (
          <List.Item
            background={'white'}
            key={game.id}
            p={3}
            borderWidth="1px"
            borderRadius="lg"
            cursor="pointer"
            onClick={() => {}}
          >
            <Text fontWeight="bold">{game.name}</Text>
            <Badge colorScheme={game.year === 'Admin' ? 'red' : 'blue'}>
              {game.year}
            </Badge>
          </List.Item>
        ))}
      </List.Root>
    </Layout>
  );
};

export default GamesOverview;
