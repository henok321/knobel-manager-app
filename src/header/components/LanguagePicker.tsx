import { Group, Select, Text } from '@mantine/core';
import React, { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';

interface LanguagePickerProps {
  currentLanguage?: string;
  onLanguageChange?: (language: string) => void;
}

interface ItemProps extends React.ComponentPropsWithoutRef<'div'> {
  label: string;
  value: string;
}

const getFlag = (lang: string) => {
  switch (lang) {
    case 'en':
      return '🇬🇧';
    case 'de':
      return '🇩🇪';
    default:
      return '🌐';
  }
};

const SelectItem = forwardRef<HTMLDivElement, ItemProps>(
  ({ label, value, ...others }, ref) => (
    <div ref={ref} {...others}>
      <Group gap="xs">
        <Text size="lg">{getFlag(value)}</Text>
        <Text size="sm">{label}</Text>
      </Group>
    </div>
  ),
);

SelectItem.displayName = 'SelectItem';

const LanguagePicker: React.FC<LanguagePickerProps> = ({
  currentLanguage,
  onLanguageChange,
}) => {
  const { i18n, t } = useTranslation();

  const handleLanguageChange = (value: string | null) => {
    if (value) {
      void i18n.changeLanguage(value);
      if (onLanguageChange) {
        onLanguageChange(value);
      }
    }
  };

  const currentLang = currentLanguage || i18n.language;

  return (
    <Select
      data={[
        { value: 'en', label: t('header.nav.languages.english') },
        { value: 'de', label: t('header.nav.languages.german') },
      ]}
      leftSection={<Text size="lg">{getFlag(currentLang)}</Text>}
      renderOption={({ option }) => (
        <SelectItem label={option.label} value={option.value} />
      )}
      size="sm"
      value={currentLang}
      onChange={handleLanguageChange}
    />
  );
};

export default LanguagePicker;
