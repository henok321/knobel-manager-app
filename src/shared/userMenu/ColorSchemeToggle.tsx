import {
  Group,
  type MantineColorScheme,
  SegmentedControl,
  useMantineColorScheme,
} from '@mantine/core';
import { IconDeviceDesktop, IconMoon, IconSun } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

const ColorSchemeToggle = () => {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const { t } = useTranslation();

  const options = [
    {
      value: 'auto',
      icon: IconDeviceDesktop,
      label: t('common:header.nav.colorSchemes.auto'),
    },
    {
      value: 'light',
      icon: IconSun,
      label: t('common:header.nav.colorSchemes.light'),
    },
    {
      value: 'dark',
      icon: IconMoon,
      label: t('common:header.nav.colorSchemes.dark'),
    },
  ];

  return (
    <SegmentedControl
      data={options.map(({ value, icon: Icon, label }) => ({
        value,
        label: (
          <Group gap="xs" wrap="nowrap">
            <Icon size={16} />
            {label}
          </Group>
        ),
      }))}
      size="sm"
      value={colorScheme}
      w="100%"
      onChange={(value) => setColorScheme(value as MantineColorScheme)}
    />
  );
};

export default ColorSchemeToggle;
