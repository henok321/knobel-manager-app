import { ActionIcon, Container, Group, Text, Tooltip } from '@mantine/core';
import { IconBrandGithub, IconLicense } from '@tabler/icons-react';
import type React from 'react';
import { useTranslation } from 'react-i18next';

import Icon from '../Icon';
import Logo from '../Logo.tsx';

const GITHUB_URL = 'https://github.com/henok321/knobel-manager-app';
const LICENSE_URL = `${GITHUB_URL}/blob/main/LICENSE`;
const AUTHOR = 'Hendrik Brinkmann';

const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Container
      fluid
      p={{ base: 'xs', sm: 'md' }}
      style={{
        backgroundColor:
          'light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-7))',
        borderTop:
          '1px solid light-dark(var(--mantine-color-gray-2), var(--mantine-color-dark-5))',
      }}
    >
      <Group gap="md" justify="space-between" wrap="wrap">
        <Group gap="xs">
          <Logo size={14} variant="mark" />
          <Text c="dimmed" size="xs">
            {t('footer:copyright', {
              year: new Date().getFullYear(),
              author: AUTHOR,
            })}
          </Text>
        </Group>

        <Group gap="xs">
          <Tooltip label={t('footer:links.github')}>
            <ActionIcon
              aria-label={t('footer:links.github')}
              component="a"
              href={GITHUB_URL}
              rel="noopener noreferrer"
              target="_blank"
            >
              <Icon icon={IconBrandGithub} size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label={t('footer:links.license')}>
            <ActionIcon
              aria-label={t('footer:links.license')}
              component="a"
              href={LICENSE_URL}
              rel="noopener noreferrer"
              target="_blank"
            >
              <Icon icon={IconLicense} size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>
    </Container>
  );
};

export default Footer;
