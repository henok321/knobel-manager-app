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
          rewrqite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (
              id.includes('node_modules/jspdf') ||
              id.includes('node_modules/html2canvas') ||
              id.includes('node_modules/dompurify')
            ) {
              return 'vendor-pdf';
            }
            return undefined;
          },
        },
      },
    },
  };
});
