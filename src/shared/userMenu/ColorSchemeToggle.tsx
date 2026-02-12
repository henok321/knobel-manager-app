import { Group, SegmentedControl, useMantineColorScheme } from '@mantine/core';
import { IconDeviceDesktop, IconMoon, IconSun } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

const ColorSchemeToggle: React.FC = () => {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const { t } = useTranslation();

  const handleColorSchemeChange = (value: string | null) => {
    if (value === 'light' || value === 'dark' || value === 'auto') {
      setColorScheme(value);
    }
  };

  return (
    <SegmentedControl
      data={[
        {
          value: 'auto',
          label: (
            <Group gap="xs" wrap="nowrap">
              <IconDeviceDesktop size={16} />
              {t('common:header.nav.colorSchemes.auto')}
            </Group>
          ),
        },
        {
          value: 'light',
          label: (
            <Group gap="xs" wrap="nowrap">
              <IconSun size={16} />
              {t('common:header.nav.colorSchemes.light')}
            </Group>
          ),
        },
        {
          value: 'dark',
          label: (
            <Group gap="xs" wrap="nowrap">
              <IconMoon size={16} />
              {t('common:header.nav.colorSchemes.dark')}
            </Group>
          ),
        },
      ]}
      size="sm"
      value={colorScheme}
      w="100%"
      onChange={handleColorSchemeChange}
    />
  );
};

export default ColorSchemeToggle;
