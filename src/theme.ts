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

const systemSans =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
const systemMono = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace';

export const theme = createTheme({
  primaryColor: 'cobalt',
  colors: { cobalt },
  defaultRadius: 'md',
  fontFamily: systemSans,
  fontFamilyMonospace: systemMono,
  headings: {
    fontFamily: systemSans,
    fontWeight: '600',
  },
  components: {
    Card: {
      defaultProps: {
        radius: 'md',
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
    Button: {
      defaultProps: {
        radius: 'md',
      },
    },
    ActionIcon: {
      defaultProps: {
        variant: 'subtle',
      },
    },
  },
});
