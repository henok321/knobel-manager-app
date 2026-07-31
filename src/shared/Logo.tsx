import { IconDice } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

interface LogoProps {
  variant?: 'mark' | 'full';
}

const Logo = ({ variant = 'full' }: LogoProps) => {
  const { t } = useTranslation('common');
  const appName = t('header.heading');

  if (variant === 'mark') {
    return (
      <span aria-label={appName} role="img">
        <IconDice
          color="var(--mantine-color-cobalt-6)"
          size={14}
          stroke={1.5}
        />
      </span>
    );
  }

  return (
    <span
      aria-label={appName}
      role="img"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <IconDice color="var(--mantine-color-cobalt-6)" size={26} stroke={1.5} />
      <span
        style={{
          fontWeight: 600,
          fontSize: 16,
          letterSpacing: '-0.01em',
          whiteSpace: 'nowrap',
        }}
      >
        {appName}
      </span>
    </span>
  );
};

export default Logo;
