import { Title } from '@mantine/core';
import type { ReactNode } from 'react';

interface PrintHeaderProps {
  title: string;
  subtitle: string;
  children?: ReactNode;
}

const PrintHeader = ({ title, subtitle, children }: PrintHeaderProps) => (
  <div className="print-header">
    <Title order={1}>{title}</Title>
    <Title c="dimmed" fw={400} order={2}>
      {subtitle}
    </Title>
    {children}
  </div>
);

export default PrintHeader;
