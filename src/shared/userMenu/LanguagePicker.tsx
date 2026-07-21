import { Group, Select, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';

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

const LanguagePicker = () => {
  const { i18n, t } = useTranslation();

  const handleLanguageChange = (value: string | null) => {
    if (value) {
      void i18n.changeLanguage(value);
    }
  };

  return (
    <Select
      comboboxProps={{ withinPortal: false }}
      data={[
        { value: 'en', label: t('common:header.nav.languages.english') },
        { value: 'de', label: t('common:header.nav.languages.german') },
      ]}
      leftSection={<Text size="lg">{getFlag(i18n.language)}</Text>}
      renderOption={({ option }) => (
        <Group gap="xs">
          <Text size="lg">{getFlag(option.value)}</Text>
          <Text size="sm">{option.label}</Text>
        </Group>
      )}
      size="sm"
      value={i18n.language}
      onChange={handleLanguageChange}
    />
  );
};

export default LanguagePicker;
