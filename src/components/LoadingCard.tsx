import { Card, Group, Skeleton, Stack } from '@mantine/core';

interface LoadingCardProps {
  height?: number | string;
  withImage?: boolean;
  withTitle?: boolean;
  withActions?: boolean;
  count?: number;
}

const LoadingCard = ({
  height,
  withImage = false,
  withTitle = true,
  withActions = false,
  count = 1,
}: LoadingCardProps) => {
  const cardContent = (
    <Card>
      <Stack gap="md">
        {withImage && <Skeleton height={120} radius="md" />}

        {withTitle && (
          <Stack gap="xs">
            <Skeleton height={24} radius="sm" width="70%" />
            <Skeleton height={16} radius="sm" width="50%" />
          </Stack>
        )}

        <Stack gap="xs">
          <Skeleton height={12} radius="sm" />
          <Skeleton height={12} radius="sm" />
          <Skeleton height={12} radius="sm" width="80%" />
        </Stack>

        {withActions && (
          <Group gap="sm" mt="md">
            <Skeleton height={36} radius="md" width={100} />
            <Skeleton height={36} radius="md" width={80} />
          </Group>
        )}
      </Stack>
    </Card>
  );

  if (count === 1) {
    return height ? <div style={{ height }}>{cardContent}</div> : cardContent;
  }

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} style={height ? { height } : undefined}>
          {cardContent}
        </div>
      ))}
    </>
  );
};

export default LoadingCard;
