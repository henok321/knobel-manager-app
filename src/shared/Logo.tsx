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
    {/* top face fill (cobalt accent) */}
    <path d="M12 3 L21 8 L12 12 L3 8 Z" fill="var(--mantine-color-cobalt-6)" />
    {/* top face pip — 1 */}
    <circle cx="12" cy="7.75" fill="#ffffff" r="1.2" />
    {/* left-front face pips — 2 */}
    <circle cx="6" cy="12.3" fill="var(--mantine-color-cobalt-6)" r="1" />
    <circle cx="9" cy="17" fill="var(--mantine-color-cobalt-6)" r="1" />
    {/* right-front face pips — 3 */}
    <circle cx="19" cy="11" fill="var(--mantine-color-cobalt-6)" r="1" />
    <circle cx="16.5" cy="14.5" fill="var(--mantine-color-cobalt-6)" r="1" />
    <circle cx="14" cy="18" fill="var(--mantine-color-cobalt-6)" r="1" />
    {/* hexagon silhouette + internal Y, drawn last so strokes stay sharp */}
    <path
      d="M12 3 L21 8 L21 16 L12 21 L3 16 L3 8 Z M12 12 L21 8 M12 12 L3 8 M12 12 L12 21"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
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
