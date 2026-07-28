import {
  Avatar,
  Box,
  Divider,
  Group,
  Menu,
  Stack,
  Text,
  UnstyledButton,
} from '@mantine/core';
import {
  IconChevronDown,
  IconLanguage,
  IconLogout,
  IconPalette,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import { useAuth } from '../../auth/useAuth.ts';
import ColorSchemeToggle from './ColorSchemeToggle.tsx';
import LanguagePicker from './LanguagePicker.tsx';

const UserMenu = () => {
  const { t } = useTranslation();
  const { user, logOut } = useAuth();

  const userInitial = user?.email?.charAt(0).toUpperCase() || 'U';
  const userDisplayName = user?.displayName || user?.email || 'User';

  return (
    <Menu position="bottom-end" shadow="md" width={360}>
      <Menu.Target>
        <UnstyledButton
          px="sm"
          py="xs"
          style={{ borderRadius: 'var(--mantine-radius-sm)' }}
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
              <IconChevronDown size={16} stroke={1.5} />
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
            <Stack gap="sm">
              <div>
                <Group gap="xs" mb={6}>
                  <IconPalette opacity={0.6} size={14} />
                  <Text c="dimmed" fw={500} size="xs">
                    {t('common:header.nav.colorScheme')}
                  </Text>
                </Group>
                <ColorSchemeToggle />
              </div>

              <div>
                <Group gap="xs" mb={6}>
                  <IconLanguage opacity={0.6} size={14} />
                  <Text c="dimmed" fw={500} size="xs">
                    {t('common:header.nav.language')}
                  </Text>
                </Group>
                <LanguagePicker />
              </div>
            </Stack>
          </Box>

          <Divider />

          <Menu.Item
            color="red"
            leftSection={<IconLogout size={16} stroke={1.5} />}
            onClick={logOut}
          >
            {t('common:header.logout')}
          </Menu.Item>
        </Stack>
      </Menu.Dropdown>
    </Menu>
  );
};

export default UserMenu;
