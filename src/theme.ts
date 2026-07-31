import { createTheme, type MantineColorsTuple } from '@mantine/core';

const cobalt: MantineColorsTuple = [
  '#eef2ff',
  '#e0e7ff',
  '#c7d2fe',
  '#a5b4fc',
  '#818cf8',
  '#4f6ef0',
  '#2563eb',
  '#1d4ed8',
  '#1e40af',
  '#172554',
];

export const theme = createTheme({
  primaryColor: 'cobalt',
  colors: { cobalt },
  headings: {
    fontWeight: '600',
  },
  components: {
    Card: {
      defaultProps: {
        shadow: 'sm',
        withBorder: true,
      },
      styles: {
        root: {
          borderColor:
            'light-dark(var(--mantine-color-gray-2), var(--mantine-color-dark-5))',
        },
      },
    },
    Badge: {
      defaultProps: {
        variant: 'dot',
        size: 'sm',
        radius: 'sm',
      },
    },
    ActionIcon: {
      defaultProps: {
        variant: 'subtle',
      },
    },
  },
});
