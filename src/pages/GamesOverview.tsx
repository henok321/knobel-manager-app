import { Badge, Heading, List, ListItem, Text } from '@chakra-ui/react';
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
      <List spacing={3}>
        {games.map((game) => (
          <ListItem
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
          </ListItem>
        ))}
      </List>
    </Layout>
  );
};

export default GamesOverview;
