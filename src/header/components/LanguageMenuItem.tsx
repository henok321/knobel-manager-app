import { Group, Menu, rem, Text, UnstyledButton } from '@mantine/core';
import { IconLanguage } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageMenuItem: React.FC = () => {
  const { i18n, t } = useTranslation();

  const currentLanguage = i18n.language;
  const currentLanguageLabel =
    currentLanguage === 'de'
      ? t('header.nav.languages.german')
      : t('header.nav.languages.english');

  const handleLanguageChange = (newLanguage: string) => {
    i18n.changeLanguage(newLanguage);
  };

  return (
    <Menu position="right-start" shadow="md" trigger="click" width={180}>
      <Menu.Target>
        <UnstyledButton
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: '4px',
            transition: 'background-color 150ms ease',
          }}
          styles={{
            root: {
              '&:hover': {
                backgroundColor: 'var(--mantine-color-gray-0)',
              },
            },
          }}
        >
          <Group gap="xs" wrap="nowrap">
            <IconLanguage style={{ width: rem(16), height: rem(16) }} />
            <Group gap="xs" justify="space-between" style={{ flex: 1 }}>
              <Text size="sm">{t('header.nav.language')}</Text>
              <Text c="dimmed" size="xs">
                {currentLanguageLabel}
              </Text>
            </Group>
          </Group>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item
          styles={
            currentLanguage === 'en'
              ? { item: { backgroundColor: 'var(--mantine-color-gray-0)' } }
              : undefined
          }
          onClick={() => handleLanguageChange('en')}
        >
          <Text fw={currentLanguage === 'en' ? 600 : 400} size="sm">
            {t('header.nav.languages.english')}
          </Text>
        </Menu.Item>
        <Menu.Item
          styles={
            currentLanguage === 'de'
              ? { item: { backgroundColor: 'var(--mantine-color-gray-0)' } }
              : undefined
          }
          onClick={() => handleLanguageChange('de')}
        >
          <Text fw={currentLanguage === 'de' ? 600 : 400} size="sm">
            {t('header.nav.languages.german')}
          </Text>
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

export default LanguageMenuItem;
