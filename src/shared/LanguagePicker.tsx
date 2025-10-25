import { Select } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface LanguagePickerProps {
  currentLanguage?: string;
  onLanguageChange?: (language: string) => void;
}

const LanguagePicker: React.FC<LanguagePickerProps> = ({
  currentLanguage,
  onLanguageChange,
}) => {
  const { i18n, t } = useTranslation();

  const handleLanguageChange = (value: string | null) => {
    if (value) {
      i18n.changeLanguage(value);
      if (onLanguageChange) {
        onLanguageChange(value);
      }
    }
  };

  return (
    <Select
      data={[
        { value: 'en', label: t('header.nav.languages.english') },
        { value: 'de', label: t('header.nav.languages.german') },
      ]}
      size="sm"
      value={currentLanguage || i18n.language}
      w={150}
      onChange={handleLanguageChange}
    />
  );
};

export default LanguagePicker;
