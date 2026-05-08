import {
  Avatar,
  Box,
  Divider,
  Group,
  Menu,
  Stack,
  Text,
  UnstyledButton,
  useMantineTheme,
} from '@mantine/core';
import { IconChevronDown, IconLogout } from '@tabler/icons-react';
import type React from 'react';
import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';

import { useAuth } from '../../auth/useAuth.ts';
import Icon from '../Icon';
import SettingsSection from './SettingsSection.tsx';

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
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    borderRadius: theme.radius.sm,
    transition: 'background-color 150ms ease',
    backgroundColor: 'transparent',
  };

  return (
    <Menu position="bottom-end" shadow="md" width={360}>
      <Menu.Target>
        <UnstyledButton
          style={buttonStyle}
          styles={{
            root: {
              '&:hover': {
                backgroundColor:
                  'light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-6))',
              },
            },
          }}
        >
          <Group gap="xs" wrap="nowrap">
            <Avatar color="blue" radius="xl" size="sm">
              {userInitial}
            </Avatar>
            <Box style={{ flex: 1, minWidth: 0 }} visibleFrom="md">
              <Text fw={500} size="sm" truncate="end">
                {userDisplayName}
              </Text>
              <Text c="dimmed" size="xs">
                {t('common:header.nav.settings')}
              </Text>
            </Box>
            <span style={{ opacity: 0.6, display: 'inline-flex' }}>
              <Icon icon={IconChevronDown} size={16} />
            </span>
          </Group>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown p={0}>
        <Stack gap={0}>
          <Box p="md" pb="xs">
            <Text c="dimmed" fw={600} size="xs" tt="uppercase">
              {t('common:header.nav.settings')}
            </Text>
          </Box>

          <Box p="md" pt="xs">
            <SettingsSection />
          </Box>

          <Divider />

          <Menu.Item
            color="red"
            leftSection={<Icon icon={IconLogout} size={16} />}
            onClick={onLogout}
          >
            {t('common:header.logout')}
          </Menu.Item>
        </Stack>
      </Menu.Dropdown>
    </Menu>
  );
};

export default UserMenu;
