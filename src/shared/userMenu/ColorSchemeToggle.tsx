import {
  Group,
  type MantineColorScheme,
  SegmentedControl,
  useMantineColorScheme,
} from '@mantine/core';
import {
  type Icon,
  IconDeviceDesktop,
  IconMoon,
  IconSun,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

const optionLabel = (SchemeIcon: Icon, label: string) => (
  <Group gap="xs" wrap="nowrap">
    <SchemeIcon size={16} />
    {label}
  </Group>
);

const ColorSchemeToggle = () => {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const { t } = useTranslation();

  return (
    <SegmentedControl
      data={[
        {
          value: 'auto',
          label: optionLabel(
            IconDeviceDesktop,
            t('common:header.nav.colorSchemes.auto'),
          ),
        },
        {
          value: 'light',
          label: optionLabel(
            IconSun,
            t('common:header.nav.colorSchemes.light'),
          ),
        },
        {
          value: 'dark',
          label: optionLabel(
            IconMoon,
            t('common:header.nav.colorSchemes.dark'),
          ),
        },
      ]}
      size="sm"
      value={colorScheme}
      w="100%"
      onChange={(value) => setColorScheme(value as MantineColorScheme)}
    />
  );
};

export default ColorSchemeToggle;
