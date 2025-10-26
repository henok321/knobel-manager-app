import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import mkcert from 'vite-plugin-mkcert';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiUrl = env.VITE_API_URL || 'http://localhost:8080';

  return {
    plugins: [
      react(),
      mkcert({
        hosts: ['localhost', '127.0.0.1'],
        keyFileName: 'knobel-manager-app.key.pem',
        certFileName: 'knobel-manager-app.cert.pem',
      }),
    ],
    server: {
      proxy: {
        '/api': {
          target: apiUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Vendor chunk: Core React libraries
            if (
              id.includes('node_modules/react') ||
              id.includes('node_modules/react-dom') ||
              id.includes('node_modules/react-router') ||
              id.includes('node_modules/scheduler')
            ) {
              return 'vendor-react';
            }

            // Redux chunk: State management
            if (
              id.includes('node_modules/@reduxjs') ||
              id.includes('node_modules/redux') ||
              id.includes('node_modules/react-redux') ||
              id.includes('node_modules/reselect')
            ) {
              return 'vendor-redux';
            }

            // Mantine UI chunk
            if (id.includes('node_modules/@mantine')) {
              return 'vendor-ui';
            }

            // Firebase chunk
            if (
              id.includes('node_modules/firebase') ||
              id.includes('node_modules/@firebase')
            ) {
              return 'vendor-firebase';
            }

            // PDF generation chunk (jsPDF, html2canvas, etc.)
            if (
              id.includes('node_modules/jspdf') ||
              id.includes('node_modules/html2canvas') ||
              id.includes('node_modules/dompurify')
            ) {
              return 'vendor-pdf';
            }

            // i18n chunk
            if (
              id.includes('node_modules/i18next') ||
              id.includes('node_modules/react-i18next')
            ) {
              return 'vendor-i18n';
            }

            // Other vendor libraries
            if (id.includes('node_modules')) {
              return 'vendor-misc';
            }
          },
        },
      },
    },
  };
});
