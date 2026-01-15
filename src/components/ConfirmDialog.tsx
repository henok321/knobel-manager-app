import { Button, Group, Modal, Stack, Text, Title } from '@mantine/core';
import type { TablerIcon } from '@tabler/icons-react';
import { IconAlertCircle } from '@tabler/icons-react';
import type { ReactNode } from 'react';

interface ConfirmDialogProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string | ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: string;
  icon?: TablerIcon;
  loading?: boolean;
}

const ConfirmDialog = ({
  opened,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmColor = 'red',
  icon: Icon = IconAlertCircle,
  loading = false,
}: ConfirmDialogProps) => (
  <Modal
    opened={opened}
    title={
      <Group gap="sm">
        <Icon
          aria-hidden="true"
          size={24}
          style={{ color: `var(--mantine-color-${confirmColor}-6)` }}
        />
        <Title order={3} size="h4">
          {title}
        </Title>
      </Group>
    }
    onClose={onClose}
  >
    <Stack gap="lg">
      <Text size="sm">{message}</Text>

      <Group gap="sm" justify="flex-end">
        <Button disabled={loading} variant="subtle" onClick={onClose}>
          {cancelLabel}
        </Button>
        <Button
          color={confirmColor}
          loading={loading}
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          {confirmLabel}
        </Button>
      </Group>
    </Stack>
  </Modal>
);

export default ConfirmDialog;
