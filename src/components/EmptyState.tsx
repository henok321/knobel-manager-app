import { Button, Paper, Stack, Text, Title } from '@mantine/core';
import type { TablerIcon } from '@tabler/icons-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: TablerIcon;
  iconColor?: string;
  title: string;
  description?: string | ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: TablerIcon;
  withPaper?: boolean;
}

const EmptyState = ({
  icon: Icon,
  iconColor = 'gray',
  title,
  description,
  actionLabel,
  onAction,
  actionIcon: ActionIcon,
  withPaper = true,
}: EmptyStateProps) => {
  const content = (
    <Stack align="center" gap="lg" py="xl">
      {Icon && (
        <Icon
          aria-hidden="true"
          size={64}
          stroke={1.5}
          style={{ color: `var(--mantine-color-${iconColor}-5)`, opacity: 0.6 }}
        />
      )}

      <Stack align="center" gap="xs" maw={400}>
        <Title order={3} size="h4" ta="center">
          {title}
        </Title>

        {description && (
          <Text c="dimmed" size="sm" ta="center">
            {description}
          </Text>
        )}
      </Stack>

      {actionLabel && onAction && (
        <Button
          leftSection={ActionIcon ? <ActionIcon size={18} /> : undefined}
          mt="md"
          size="md"
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </Stack>
  );

  if (withPaper) {
    return (
      <Paper withBorder p="xl" radius="md">
        {content}
      </Paper>
    );
  }

  return content;
};

export default EmptyState;
