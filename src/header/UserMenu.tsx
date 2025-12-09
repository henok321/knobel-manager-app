import {
  Avatar,
  Group,
  Menu,
  Text,
  UnstyledButton,
  rem,
  useMantineTheme,
} from '@mantine/core';
import { IconChevronDown, IconLogout } from '@tabler/icons-react';
import React, { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';

import { useAuth } from '../auth/useAuth.ts';

interface UserMenuProps {
  onLogout: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ onLogout }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const theme = useMantineTheme();

  const userInitial = user?.email?.charAt(0).toUpperCase() || 'U';
  const userDisplayName =
    user?.displayName || user?.email?.split('@')[0] || 'User';

  const buttonStyle: CSSProperties = {
    padding: '8px 12px',
    borderRadius: theme.radius.sm,
    transition: 'background-color 150ms ease',
    backgroundColor: 'transparent',
  };

  return (
    <Menu position="bottom-end" shadow="md" width={220}>
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
            <Avatar color="blue" radius="xl" size="sm">
              {userInitial}
            </Avatar>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Text fw={500} size="sm" truncate="end">
                {userDisplayName}
              </Text>
              <Text c="dimmed" size="xs">
                {t('header.nav.settings')}
              </Text>
            </div>
            <IconChevronDown
              style={{ width: rem(16), height: rem(16), opacity: 0.6 }}
            />
          </Group>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>{t('header.nav.settings')}</Menu.Label>

        <Menu.Item
          color="red"
          leftSection={
            <IconLogout style={{ width: rem(16), height: rem(16) }} />
          }
          onClick={onLogout}
        >
          {t('header.logout')}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

export default UserMenu;
