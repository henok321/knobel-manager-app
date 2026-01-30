import { Group, rem, Stack, Text } from '@mantine/core';
import { IconLanguage, IconPalette } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import ColorSchemeToggle from './ColorSchemeToggle.tsx';
import LanguagePicker from './LanguagePicker.tsx';

const SettingsSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Stack gap="sm">
      <div>
        <Group gap="xs" mb={6}>
          <IconPalette
            style={{
              width: rem(14),
              height: rem(14),
              opacity: 0.6,
            }}
          />
          <Text c="dimmed" fw={500} size="xs">
            {t('common:header.nav.colorScheme')}
          </Text>
        </Group>
        <ColorSchemeToggle />
      </div>

      <div>
        <Group gap="xs" mb={6}>
          <IconLanguage
            style={{
              width: rem(14),
              height: rem(14),
              opacity: 0.6,
            }}
          />
          <Text c="dimmed" fw={500} size="xs">
            {t('common:header.nav.language')}
          </Text>
        </Group>
        <LanguagePicker />
      </div>
    </Stack>
  );
};

export default SettingsSection;
