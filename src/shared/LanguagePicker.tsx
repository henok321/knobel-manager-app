import { Select } from '@mantine/core';
import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguagePicker: React.FC = () => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (value: string | null) => {
    if (value) {
      i18n.changeLanguage(value);
    }
  };

  return (
    <Select
      data={[
        { value: 'en', label: 'English' },
        { value: 'de', label: 'Deutsch' },
      ]}
      size="sm"
      value={i18n.language}
      w={120}
      onChange={handleLanguageChange}
    />
  );
};

export default LanguagePicker;
