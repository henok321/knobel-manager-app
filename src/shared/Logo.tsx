import { IconDice } from '@tabler/icons-react';
import type React from 'react';
import { useTranslation } from 'react-i18next';

type LogoVariant = 'mark' | 'full';

interface LogoProps {
  variant?: LogoVariant;
  size?: number;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({
  variant = 'full',
  size = 16,
  className,
}) => {
  const { t } = useTranslation('common');
  const appName = t('header.heading');

  if (variant === 'mark') {
    return (
      <span aria-label={appName} className={className} role="img">
        <IconDice
          color="var(--mantine-color-cobalt-6)"
          size={size}
          stroke={1.5}
        />
      </span>
    );
  }

  const glyphSize = Math.round(size * 1.6);
  return (
    <span
      aria-label={appName}
      className={className}
      role="img"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <IconDice
        color="var(--mantine-color-cobalt-6)"
        size={glyphSize}
        stroke={1.5}
      />
      <span
        style={{
          fontWeight: 600,
          fontSize: size,
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
