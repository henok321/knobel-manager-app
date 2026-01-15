import { createTheme, MantineColorsTuple } from '@mantine/core';

// Custom color palette for Knobel Manager - dice game theme
// Using a blue-based palette that suggests precision and competition
const knobelPrimary: MantineColorsTuple = [
  '#e6f7ff', // 0 - lightest
  '#bae7ff', // 1
  '#91d5ff', // 2
  '#69c0ff', // 3
  '#40a9ff', // 4
  '#1890ff', // 5 - primary
  '#096dd9', // 6
  '#0050b3', // 7
  '#003a8c', // 8
  '#002766', // 9 - darkest
];

// Success color for completed games, saved scores, etc.
const knobelSuccess: MantineColorsTuple = [
  '#f6ffed', // 0
  '#d9f7be', // 1
  '#b7eb8f', // 2
  '#95de64', // 3
  '#73d13d', // 4
  '#52c41a', // 5 - primary green
  '#389e0d', // 6
  '#237804', // 7
  '#135200', // 8
  '#092b00', // 9
];

// Warning color for setup phase, pending actions
const knobelWarning: MantineColorsTuple = [
  '#fffbe6', // 0
  '#fff1b8', // 1
  '#ffe58f', // 2
  '#ffd666', // 3
  '#ffc53d', // 4
  '#faad14', // 5 - primary orange
  '#d48806', // 6
  '#ad6800', // 7
  '#874d00', // 8
  '#613400', // 9
];

export const theme = createTheme({
  // Color scheme
  primaryColor: 'knobelPrimary',
  colors: {
    knobelPrimary,
    knobelSuccess,
    knobelWarning,
  },

  // Typography
  fontFamily:
    'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  fontFamilyMonospace:
    'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
  headings: {
    fontFamily:
      'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontWeight: '600',
    sizes: {
      h1: { fontSize: '2rem', lineHeight: '1.2' },
      h2: { fontSize: '1.5rem', lineHeight: '1.3' },
      h3: { fontSize: '1.25rem', lineHeight: '1.4' },
      h4: { fontSize: '1.125rem', lineHeight: '1.5' },
      h5: { fontSize: '1rem', lineHeight: '1.5' },
      h6: { fontSize: '0.875rem', lineHeight: '1.5' },
    },
  },

  // Spacing scale - consistent throughout the app
  spacing: {
    xs: '0.5rem', // 8px
    sm: '0.75rem', // 12px
    md: '1rem', // 16px
    lg: '1.5rem', // 24px
    xl: '2rem', // 32px
  },

  // Border radius
  radius: {
    xs: '0.125rem', // 2px
    sm: '0.25rem', // 4px
    md: '0.5rem', // 8px
    lg: '1rem', // 16px
    xl: '1.5rem', // 24px
  },
  defaultRadius: 'md',

  // Shadows for depth
  shadows: {
    xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.15), 0 10px 10px rgba(0, 0, 0, 0.04)',
  },

  // Component defaults
  components: {
    Button: {
      defaultProps: {
        radius: 'md',
      },
      styles: {
        root: {
          fontWeight: 500,
        },
      },
    },

    Card: {
      defaultProps: {
        shadow: 'sm',
        padding: 'lg',
        radius: 'md',
        withBorder: true,
      },
    },

    Paper: {
      defaultProps: {
        shadow: 'sm',
        padding: 'md',
        radius: 'md',
      },
    },

    Modal: {
      defaultProps: {
        centered: true,
        overlayProps: {
          backgroundOpacity: 0.55,
          blur: 3,
        },
        padding: 'lg',
        radius: 'md',
      },
    },

    TextInput: {
      defaultProps: {
        radius: 'md',
      },
    },

    NumberInput: {
      defaultProps: {
        radius: 'md',
      },
    },

    Select: {
      defaultProps: {
        radius: 'md',
      },
    },

    Badge: {
      defaultProps: {
        radius: 'sm',
      },
    },

    Table: {
      defaultProps: {
        striped: true,
        highlightOnHover: true,
        withTableBorder: true,
        withColumnBorders: false,
      },
    },
  },

  // Breakpoints for responsive design
  breakpoints: {
    xs: '30em', // 480px
    sm: '48em', // 768px
    md: '64em', // 1024px
    lg: '74em', // 1184px
    xl: '90em', // 1440px
  },

  // Focus ring styles for accessibility
  focusRing: 'auto',
  cursorType: 'pointer',
});
