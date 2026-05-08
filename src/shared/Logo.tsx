import type React from 'react';

import { useTranslation } from 'react-i18next';

type LogoVariant = 'mark' | 'full';

interface LogoProps {
  variant?: LogoVariant;
  size?: number;
  className?: string;
}

const Glyph: React.FC<{ size: number }> = ({ size }) => (
  <svg
    aria-hidden="true"
    fill="none"
    height={size}
    role="presentation"
    viewBox="0 0 24 24"
    width={size}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* top-left outline square */}
    <rect
      height="9.5"
      stroke="currentColor"
      strokeWidth="1.5"
      width="9.5"
      x="0.75"
      y="0.75"
    />
    {/* bottom-right outline square */}
    <rect
      height="9.5"
      stroke="currentColor"
      strokeWidth="1.5"
      width="9.5"
      x="13.75"
      y="13.75"
    />
    {/* centre filled square (drawn last so it overlaps) */}
    <rect
      fill="var(--mantine-color-cobalt-6)"
      height="10"
      width="10"
      x="7"
      y="7"
    />
  </svg>
);

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
        <Glyph size={size} />
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
      <Glyph size={glyphSize} />
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
