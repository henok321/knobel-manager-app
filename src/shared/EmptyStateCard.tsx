import { Card, Stack, Text, Title } from '@mantine/core';
import type { ReactNode } from 'react';

interface EmptyStateCardProps {
  title: string;
  description?: string | string[];
  children?: ReactNode;
}

const EmptyStateCard = ({
  title,
  description,
  children,
}: EmptyStateCardProps) => {
  const lines = [description ?? []].flat();

  return (
    <Card padding="xl">
      <Stack align="center" gap="md">
        <Title order={4}>{title}</Title>
        {lines.map((line) => (
          <Text key={line} c="dimmed" size="sm" ta="center">
            {line}
          </Text>
        ))}
        {children}
      </Stack>
    </Card>
  );
};

export default EmptyStateCard;
