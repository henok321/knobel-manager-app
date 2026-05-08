import type { Icon as TablerIconType } from '@tabler/icons-react';
import type React from 'react';

interface IconProps {
  icon: TablerIconType;
  size?: number;
  strokeWidth?: number;
  color?: string;
  className?: string;
}

const Icon: React.FC<IconProps> = ({
  icon: TablerIcon,
  size = 18,
  strokeWidth = 1.5,
  color,
  className,
}) => (
  <TablerIcon
    className={className}
    color={color}
    size={size}
    stroke={strokeWidth}
  />
);

export default Icon;
