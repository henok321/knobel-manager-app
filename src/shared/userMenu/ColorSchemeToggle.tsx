import { Group, Select, Text, useMantineColorScheme } from '@mantine/core';
import { IconDeviceDesktop, IconMoon, IconSun } from '@tabler/icons-react';
import React, { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';

interface ItemProps extends React.ComponentPropsWithoutRef<'div'> {
  label: string;
  value: string;
}

const SelectItem = forwardRef<HTMLDivElement, ItemProps>(
  ({ label, value, ...others }, ref) => {
    const getIcon = () => {
      switch (value) {
        case 'light':
          return <IconSun size={16} />;
        case 'dark':
          return <IconMoon size={16} />;
        case 'auto':
          return <IconDeviceDesktop size={16} />;
        default:
          return null;
      }
    };

    return (
      <div ref={ref} {...others}>
        <Group gap="xs">
          {getIcon()}
          <Text size="sm">{label}</Text>
        </Group>
      </div>
    );
  },
);

SelectItem.displayName = 'SelectItem';

const ColorSchemeToggle: React.FC = () => {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const { t } = useTranslation();

  const handleColorSchemeChange = (value: string | null) => {
    if (value === 'light' || value === 'dark' || value === 'auto') {
      setColorScheme(value);
    }
  };

  const getLeftSectionIcon = () => {
    switch (colorScheme) {
      case 'dark':
        return <IconMoon size={16} />;
      case 'light':
        return <IconSun size={16} />;
      default:
        return <IconDeviceDesktop size={16} />;
    }
  };

  return (
    <Select
      comboboxProps={{ withinPortal: false }}
      data={[
        {
          value: 'light',
          label: t('header.nav.colorSchemes.light'),
        },
        {
          value: 'dark',
          label: t('header.nav.colorSchemes.dark'),
        },
        {
          value: 'auto',
          label: t('header.nav.colorSchemes.auto'),
        },
      ]}
      leftSection={getLeftSectionIcon()}
      renderOption={({ option }) => (
        <SelectItem label={option.label} value={option.value} />
      )}
      size="sm"
      value={colorScheme}
      onChange={handleColorSchemeChange}
    />
  );
};

export default ColorSchemeToggle;
