import { Anchor, Container, Group, Text } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconBrandGithub } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

const GITHUB_URL = 'https://github.com/henok321/knobel-manager-app';
const LICENSE_URL = `${GITHUB_URL}/blob/main/LICENSE`;

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <Container
      fluid
      p={{ base: 'xs', sm: 'md' }}
      style={{
        backgroundColor: 'var(--mantine-color-gray-0)',
        borderTop: '1px solid var(--mantine-color-gray-3)',
        marginTop: 'auto',
      }}
    >
      <Group gap={isMobile ? 'xs' : 'md'} justify="center" wrap="wrap">
        <Text c="dimmed" size={isMobile ? 'xs' : 'sm'}>
          {t('footer:copyright', { year: currentYear })}
        </Text>

        <Text c="dimmed" size={isMobile ? 'xs' : 'sm'}>
          •
        </Text>

        <Anchor
          c="dimmed"
          href={GITHUB_URL}
          rel="noopener noreferrer"
          size={isMobile ? 'xs' : 'sm'}
          target="_blank"
        >
          <Group gap={4}>
            <IconBrandGithub size={isMobile ? 14 : 16} />
            {t('footer:links.github')}
          </Group>
        </Anchor>

        <Text c="dimmed" size={isMobile ? 'xs' : 'sm'}>
          •
        </Text>

        <Anchor
          c="dimmed"
          href={LICENSE_URL}
          rel="noopener noreferrer"
          size={isMobile ? 'xs' : 'sm'}
          target="_blank"
        >
          {t('footer:links.license')}
        </Anchor>
      </Group>
    </Container>
  );
};

export default Footer;
