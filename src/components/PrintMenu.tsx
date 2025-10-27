import { Button, Menu } from '@mantine/core';
import { IconPrinter } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { GameStatusEnum } from '../generated';
import { Game } from '../slices/types';

interface PrintMenuProps {
  game: Game;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'filled' | 'light' | 'outline' | 'subtle' | 'default';
}

const PrintMenu = ({
  game,
  size = 'sm',
  variant = 'light',
}: PrintMenuProps) => {
  const { t } = useTranslation(['gameDetail', 'common']);
  const navigate = useNavigate();

  if (game.status === GameStatusEnum.Setup) {
    return null;
  }

  const handlePrintView = (type: string, params?: Record<string, string>) => {
    const queryParams = new URLSearchParams({ type, ...params });
    navigate(`/games/${game.id}/print?${queryParams.toString()}`);
  };

  return (
    <Menu shadow="md" width={250}>
      <Menu.Target>
        <Button
          leftSection={<IconPrinter style={{ width: 16, height: 16 }} />}
          size={size}
          variant={variant}
        >
          {t('actions.printView')}
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>{t('printMenu.label')}</Menu.Label>
        <Menu.Item onClick={() => handlePrintView('tablePlan')}>
          {t('printMenu.tablePlan')}
        </Menu.Item>
        <Menu.Item onClick={() => handlePrintView('scoreSheets')}>
          {t('printMenu.scoreSheets')}
        </Menu.Item>
        <Menu.Item onClick={() => handlePrintView('teamHandouts')}>
          {t('printMenu.teamHandouts')}
        </Menu.Item>
        <Menu.Divider />
        <Menu.Label>{t('printMenu.rankingsLabel')}</Menu.Label>
        <Menu.Item onClick={() => handlePrintView('rankings')}>
          {t('printMenu.rankingsAll')}
        </Menu.Item>
        {Array.from({ length: game.numberOfRounds }, (_, i) => i + 1).map(
          (roundNum) => (
            <Menu.Item
              key={roundNum}
              onClick={() =>
                handlePrintView('rankings', { round: String(roundNum) })
              }
            >
              {t('printMenu.rankingsRound', {
                round: roundNum,
              })}
            </Menu.Item>
          ),
        )}
      </Menu.Dropdown>
    </Menu>
  );
};

export default PrintMenu;
